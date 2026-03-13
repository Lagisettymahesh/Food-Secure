const prisma = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

exports.registerUser = async (req, res) => {
    try {
        const { role, email, password, name_or_org } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'A user with this email already exists.' });

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await prisma.user.create({
            data: { role, email, password_hash, name_or_org, is_verified: true }
        });

        res.status(201).json({ message: 'Account created successfully. Please log in.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name_or_org },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, role: user.role, name: user.name_or_org, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};
