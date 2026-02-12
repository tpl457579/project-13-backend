import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';

const app = express();

// 1. Initialize Database but DON'T block the server start
connectDB(); 

// 2. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// 3. Routes
import productsRouter from './src/api/routes/products.js';
import usersRouter from './src/api/routes/users.js';
import dogsRouter from './src/api/routes/dogs.js';
import catsRouter from './src/api/routes/cats.js';

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/dogs', dogsRouter);
app.use('/api/v1/cats', catsRouter);

// 4. Load Cron
import './src/utils/cron.js';

app.get('/', (req, res) => {
  res.send('API is running');
});

// 5. Error Handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// 6. Start Server immediately
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});