import { Router } from "express";
import multer from "multer";
import { analyzeFood, getFoodLogs } from "../controllers/food.controller";

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

export default router;
