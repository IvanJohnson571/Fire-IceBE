import { Router } from 'express';
import { users } from '../data/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const SECRET = 'supersecretkey';

router.post('/register', async (req, res) => {

    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, passwordHash };
    users.push(newUser);

    res.json({ message: 'User registered', user: { id: newUser.id, username } });

});

router.post('/login', async (req, res) => {

    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });

    res.json({ token, username: user.username });

});

export default router;
