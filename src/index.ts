import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:4200',
        credentials: true,
    })
);

app.use('/api/auth', authRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
