import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import corsOptions from "./config/corsConfig.js";
import connectDB from "./config/database.js";
import communityRoutes from "./routes/communityRoutes.js";
<<<<<<< Updated upstream
=======
import voteRoutes from "./routes/voteRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

>>>>>>> Stashed changes
// --- Swagger Imports ---
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

connectDB();

const app = express();

// --- Passport Imports ---
import passport from 'passport';
import './config/passport.js';

app.use(passport.initialize());

app.use(express.json());
app.use(cors(corsOptions));
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
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes); 
app.use("/api/communities", communityRoutes);
<<<<<<< Updated upstream
=======
app.use("/api/votes", voteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/search", searchRoutes);
>>>>>>> Stashed changes
// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📭 API endpoints available at http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
