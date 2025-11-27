import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import connectDB from './config/database.js';
dotenv.config();


connectDB();

const app = express();



app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);


// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📭 API endpoints available at http://localhost:${PORT}`);
});