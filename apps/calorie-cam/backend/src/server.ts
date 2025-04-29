import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

  // Show the correct URL based on environment
  if (process.env.RAILWAY_STATIC_URL) {
    console.log(
      `Health check available at ${process.env.RAILWAY_STATIC_URL}/health`
    );
  } else if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(
      `Health check available at https://${process.env.RAILWAY_PUBLIC_DOMAIN}/health`
    );
  } else {
    console.log(`Health check available at http://localhost:${PORT}/health`);
  }
});

export default app;
