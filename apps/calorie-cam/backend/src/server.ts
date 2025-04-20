import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import foodRoutes from "./routes/food";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api", foodRoutes);

// Health check endpoint
app.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "ok", message: "CalorieCam API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;
