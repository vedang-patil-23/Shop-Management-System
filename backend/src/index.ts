import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './database';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

const PORT = process.env.PORT || 3000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(console.error);

