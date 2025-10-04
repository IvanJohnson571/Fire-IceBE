"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.checkSession = exports.login = exports.register = void 0;
const users_1 = require("../data/users");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = 'supersecretkey';
const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });
    if (users_1.users.find(u => u.username === username))
        return res.status(400).json({ message: 'User already exists' });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const newUser = { id: users_1.users.length + 1, username, passwordHash };
    users_1.users.push(newUser);
    res.status(201).json({ message: 'User registered', user: { id: newUser.id, username } });
};
exports.register = register;
const login = async (req, res) => {
    const { username, password } = req.body;
    const user = users_1.users.find(u => u.username === username);
    if (!user)
        return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000
    });
    res.json({ message: 'Login successful', username: user.username });
};
exports.login = login;
const checkSession = (req, res) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ isAuthenticated: false });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        res.json({ isAuthenticated: true, user: decoded });
    }
    catch {
        res.status(401).json({ isAuthenticated: false });
    }
};
exports.checkSession = checkSession;
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};
exports.logout = logout;
