import { Request, Response } from 'express';
import { users } from '../data/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = 'supersecretkey';

export const register = async (req: Request, res: Response) => {

    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

    if (users.find(u => u.username === username))
        return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, passwordHash };
    users.push(newUser);

    res.status(201).json({ message: 'User registered', user: { id: newUser.id, username } });

};

export const login = async (req: Request, res: Response) => {

    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) return res.status(401).json({
        message: 'Invalid credentials',
        success: false
    });

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) return res.status(401).json({
        message: 'Invalid credentials',
        success: false
    });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000
    });

    res.json({
        message: 'Login successful',
        username: user.username,
        success: true
    });

};

export const checkSession = (req: Request, res: Response) => {

    const token = req.cookies.token;

    if (!token) return res.status(401).json({ isAuthenticated: false });

    try {
        const decoded = jwt.verify(token, SECRET);
        res.json({ isAuthenticated: true, user: decoded });

    } catch {
        res.status(401).json({ isAuthenticated: false });

    }

};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};
