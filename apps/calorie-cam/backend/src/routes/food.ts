import { Router } from "express";
import multer from "multer";
import {
  analyzeFood,
  clearFoodLogs,
  deleteFoodLog,
  getFoodLogs,
  updateFoodLog,
} from "../controllers/food.controller";

const router = Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Route for analyzing food images
router.post("/upload-food-image", upload.single("image") as any, analyzeFood);

// Route for fetching food logs
router.get("/food-logs", getFoodLogs);

// Route for editing or deleting a single food log
router.patch("/food-logs/:id", updateFoodLog);
router.delete("/food-logs/:id", deleteFoodLog);

// Route for deleting all food logs for the current device user
router.delete("/food-logs", clearFoodLogs);

export default router;
