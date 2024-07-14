import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db';
import userRoutes from './src/routes/userRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: true, // Adjust this to the specific origin or use a more restrictive setting
  credentials: true,
}));

// Routes
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
