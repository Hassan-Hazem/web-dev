const corsOptions = {
  
  origin: [
    "http://localhost:5173", // Vite default port
    "http://localhost:3000", // React default port (just in case)
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies (essential for sessions/auth if you use cookies later)
  optionsSuccessStatus: 200, 
};

export default corsOptions;