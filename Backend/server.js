import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/database.js";

// --- Swagger Imports ---
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// --- Swagger Configuration ---
// Load the OpenAPI spec (ensure 'swagger.yaml' exists in Backend folder)
const swaggerDocument = YAML.load("./swagger.yaml");

// Expose raw JSON for tooling / easier debugging
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerDocument);
});

// Serve interactive UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customSiteTitle: "Reddit Clone API Docs",
  })
);

// --- Routes ---
app.use("/api/auth", authRoutes);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📭 API endpoints available at http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
