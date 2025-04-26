import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { z } from "zod";
import dotenv from "dotenv";

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

    const userId = req.body.userId || null; // Optional user ID
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
    const filename = `food_image_${timestamp}.jpg`;

    // Upload the image to Supabase storage
    const { data: storageData, error: storageError } = await supabase.storage
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

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("food-images").getPublicUrl(filename);

    // Store the food log entry in Supabase
    const { data: logData, error: logError } = await supabase
      .from("food_logs")
      .insert([
        {
          user_id: userId,
          image_url: publicUrl,
          food_name: nutritionData.foodName,
          calories: nutritionData.calories,
          proteins: nutritionData.proteins,
          fats: nutritionData.fats,
          carbs: nutritionData.carbs,
        },
      ]);

    if (logError) {
      console.error("Error storing food log:", logError);
      res.status(500).json({ error: "Error storing food log data" });
      return;
    }

    res.status(200).json({
      success: true,
      data: nutritionData,
      imageUrl: publicUrl,
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
    const userId = req.query.userId as string | undefined;

    // Query to get food logs
    let query = supabase
      .from("food_logs")
      .select("*")
      .order("logged_at", { ascending: false });

    // If userId is provided, filter by user
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching food logs:", error);
      res.status(500).json({ error: "Failed to fetch food logs" });
      return;
    }

    res.status(200).json(data || []);
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
    // Optional: Implement user ID check if you want to clear only for a logged-in user
    // const userId = req.user?.id; // Assuming you have user info attached via middleware
    // if (!userId) {
    //   res.status(401).json({ message: 'Unauthorized' });
    //   return;
    // }

    const { error } = await supabase
      .from("food_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Example: delete all rows (adjust filter as needed)
    // .eq('user_id', userId); // Example: delete only for the authenticated user

    if (error) {
      console.error("Supabase delete error:", error);
      // Throw the error to be caught by the generic catch block
      throw new Error("Failed to delete food logs from database.");
    }

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
