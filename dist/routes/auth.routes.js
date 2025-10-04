"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../data/users");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authController = __importStar(require("../controllers/auth.controller"));
const router = (0, express_1.Router)();
const SECRET = 'supersecretkey';

router.use((0, cookie_parser_1.default)());

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });
    if (users_1.users.find(u => u.username === username))
        return res.status(400).json({ message: 'User already exists' });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const newUser = { id: users_1.users.length + 1, username, passwordHash };
    users_1.users.push(newUser);
    res.status(201).json({ message: 'User registered', user: { id: newUser.id, username } });
});

router.post('/login', async (req, res) => {
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
});

router.get('/session', (req, res) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ isAuthenticated: false, message: 'No session' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        res.json({ isAuthenticated: true, user: decoded });
    }
    catch {
        res.status(401).json({ isAuthenticated: false, message: 'Invalid token' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/session', authController.checkSession);
router.post('/logout', authController.logout);

exports.default = router;
