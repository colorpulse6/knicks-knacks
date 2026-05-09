import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { z } from "zod";
import dotenv from "dotenv";
import { getRequiredUserId } from "../utils/userScope";
import {
  FoodLogRow,
  getScopedFoodLogFilter,
  parseFoodLogUpdate,
  withSignedImageUrls,
} from "../utils/foodLogs";

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define response schema for GPT-4o
const NutritionResponseSchema = z.object({
  foodName: z.string(),
  calories: z.number().int().optional(),
  proteins: z.number().optional(),
  fats: z.number().optional(),
  carbs: z.number().optional(),
  isFood: z.boolean(),
  message: z.string().optional(),
});

type NutritionResponse = z.infer<typeof NutritionResponseSchema>;

function sendUserIdError(res: Response, error: unknown): boolean {
  if (error instanceof Error && error.message.includes("userId")) {
    res.status(400).json({ error: error.message });
    return true;
  }
  return false;
}

function sendBadRequestError(res: Response, error: unknown): boolean {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: error.issues[0]?.message ?? "Invalid request" });
    return true;
  }

  if (
    error instanceof Error &&
    (/food log update/i.test(error.message) ||
      /at least one field/i.test(error.message))
  ) {
    res.status(400).json({ error: error.message });
    return true;
  }

  return false;
}

async function createSignedFoodImageUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("food-images")
    .createSignedUrl(path, 60 * 60);

  if (error) {
    console.error("Error creating signed food image URL:", error);
    return null;
  }

  return data.signedUrl;
}

function getStoredImagePath(log: {
  image_path?: string | null;
  image_url?: string | null;
}): string | null {
  if (log.image_path) {
    return log.image_path;
  }

  if (log.image_url && !/^https?:\/\//i.test(log.image_url)) {
    return log.image_url;
  }

  return null;
}

async function removeStoredFoodImages(paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  const { error } = await supabase.storage.from("food-images").remove(paths);

  if (error) {
    console.error("Error removing food images from storage:", error);
  }
}

async function ensureUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .upsert([{ id: userId }], { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to initialize user: ${error.message}`);
  }
}

/**
 * Analyzes a food image using GPT-4o and stores results in Supabase
 */
export const analyzeFood = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    let userId: string;
    try {
      userId = getRequiredUserId(req);
    } catch (error) {
      if (sendUserIdError(res, error)) return;
      throw error;
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString("base64");

    // Prepare the image for GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a specialized nutrition analyzer. Your task is to analyze food images and provide accurate nutrition information. 
                    If the image contains food, identify what it is and estimate its calories, protein, fat, and carbs. 
                    If the image does NOT contain food, respond with humor that it's not food.
                    Respond in JSON format with fields: foodName, calories, proteins, fats, carbs, isFood, message.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What food is this and what are its nutrition facts?",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Parse and validate the response
    const content = response.choices[0]?.message?.content || "{}";
    const parsedContent = JSON.parse(content);

    let nutritionData: NutritionResponse;

    try {
      nutritionData = NutritionResponseSchema.parse(parsedContent);
    } catch (error) {
      // If validation fails, provide a fallback response
      nutritionData = {
        foodName: parsedContent.foodName || "Unknown food",
        calories: parsedContent.calories || 0,
        proteins: parsedContent.proteins || 0,
        fats: parsedContent.fats || 0,
        carbs: parsedContent.carbs || 0,
        isFood: parsedContent.isFood ?? true,
        message: parsedContent.message || "Analysis complete",
      };
    }

    // Generate a unique filename for the image in Supabase storage
    const timestamp = Date.now();
    const filename = `${userId}/food_image_${timestamp}.jpg`;

    // Upload the image to Supabase storage
    const { error: storageError } = await supabase.storage
      .from("food-images")
      .upload(filename, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (storageError) {
      console.error("Error uploading to storage:", storageError);
      res.status(500).json({ error: "Error uploading image to storage" });
      return;
    }

    await ensureUser(userId);

    // Store the food log entry in Supabase
    const { data: createdLog, error: logError } = await supabase
      .from("food_logs")
      .insert([
        {
          user_id: userId,
          image_url: filename,
          image_path: filename,
          food_name: nutritionData.foodName,
          calories: nutritionData.calories,
          proteins: nutritionData.proteins,
          fats: nutritionData.fats,
          carbs: nutritionData.carbs,
        },
      ])
      .select("*")
      .single();

    if (logError) {
      console.error("Error storing food log:", logError);
      await removeStoredFoodImages([filename]);
      res.status(500).json({ error: "Error storing food log data" });
      return;
    }

    const [signedLog] = await withSignedImageUrls(
      [createdLog as FoodLogRow],
      createSignedFoodImageUrl,
    );

    res.status(200).json({
      success: true,
      data: nutritionData,
      imageUrl: signedLog.image_url,
      log: signedLog,
    });
  } catch (error) {
    console.error("Error analyzing food:", error);
    res.status(500).json({ error: "Error analyzing food image" });
  }
};

/**
 * Retrieves food logs from Supabase
 */
export const getFoodLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let userId: string;
    try {
      userId = getRequiredUserId(req);
    } catch (error) {
      if (sendUserIdError(res, error)) return;
      throw error;
    }

    // Query to get food logs
    const query = supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching food logs:", error);
      res.status(500).json({ error: "Failed to fetch food logs" });
      return;
    }

    const signedLogs = await withSignedImageUrls(
      (data || []) as FoodLogRow[],
      createSignedFoodImageUrl,
    );

    res.status(200).json(signedLogs);
  } catch (error) {
    console.error("Error fetching food logs:", error);
    res.status(500).json({ error: "Failed to fetch food logs" });
  }
};

/**
 * Clears food logs from Supabase.
 * Can optionally clear only for a specific user if userId is implemented.
 */
export const clearFoodLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let userId: string;
    try {
      userId = getRequiredUserId(req);
    } catch (error) {
      if (sendUserIdError(res, error)) return;
      throw error;
    }

    const { data: existingLogs, error: selectError } = await supabase
      .from("food_logs")
      .select("image_path,image_url")
      .eq("user_id", userId);

    if (selectError) {
      console.error("Supabase select error:", selectError);
      throw new Error("Failed to load food logs for deletion.");
    }

    const storagePaths = (existingLogs || [])
      .map(getStoredImagePath)
      .filter((path): path is string => Boolean(path));

    const { error } = await supabase
      .from("food_logs")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase delete error:", error);
      // Throw the error to be caught by the generic catch block
      throw new Error("Failed to delete food logs from database.");
    }

    await removeStoredFoodImages(storagePaths);

    // Successfully deleted
    // Respond with 200 and a message, or 204 No Content
    res.status(200).json({ message: "Food history cleared successfully." });
    // Or use 204 if you prefer not sending a body: res.status(204).send();
  } catch (error) {
    console.error("Error clearing food logs:", error);
    // Check if error is an instance of Error to safely access message
    const message =
      error instanceof Error ? error.message : "Failed to clear food history";
    res.status(500).json({ message });
  }
};

export const deleteFoodLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let userId: string;
    try {
      userId = getRequiredUserId(req);
    } catch (error) {
      if (sendUserIdError(res, error)) return;
      throw error;
    }

    let scopedFilter: ReturnType<typeof getScopedFoodLogFilter>;
    try {
      scopedFilter = getScopedFoodLogFilter(req.params.id, userId);
    } catch (error) {
      if (sendBadRequestError(res, error)) return;
      throw error;
    }

    const { data: existingLog, error: selectError } = await supabase
      .from("food_logs")
      .select("image_path,image_url")
      .match(scopedFilter)
      .maybeSingle();

    if (selectError) {
      console.error("Supabase select error:", selectError);
      res.status(500).json({ error: "Failed to load food log" });
      return;
    }

    if (!existingLog) {
      res.status(404).json({ error: "Food log not found" });
      return;
    }

    const { error: deleteError } = await supabase
      .from("food_logs")
      .delete()
      .match(scopedFilter);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      res.status(500).json({ error: "Failed to delete food log" });
      return;
    }

    const storagePath = getStoredImagePath(existingLog);
    await removeStoredFoodImages(storagePath ? [storagePath] : []);

    res.status(200).json({ message: "Food log deleted successfully." });
  } catch (error) {
    console.error("Error deleting food log:", error);
    res.status(500).json({ error: "Failed to delete food log" });
  }
};

export const updateFoodLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let userId: string;
    try {
      userId = getRequiredUserId(req);
    } catch (error) {
      if (sendUserIdError(res, error)) return;
      throw error;
    }

    let scopedFilter: ReturnType<typeof getScopedFoodLogFilter>;
    let updatePayload: ReturnType<typeof parseFoodLogUpdate>;

    try {
      scopedFilter = getScopedFoodLogFilter(req.params.id, userId);
      updatePayload = parseFoodLogUpdate(req.body);
    } catch (error) {
      if (sendBadRequestError(res, error)) return;
      throw error;
    }

    const { data: updatedLog, error: updateError } = await supabase
      .from("food_logs")
      .update(updatePayload)
      .match(scopedFilter)
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      res.status(500).json({ error: "Failed to update food log" });
      return;
    }

    if (!updatedLog) {
      res.status(404).json({ error: "Food log not found" });
      return;
    }

    const [signedLog] = await withSignedImageUrls(
      [updatedLog as FoodLogRow],
      createSignedFoodImageUrl,
    );

    res.status(200).json(signedLog);
  } catch (error) {
    console.error("Error updating food log:", error);
    res.status(500).json({ error: "Failed to update food log" });
  }
};
