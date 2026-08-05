import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'omniaudit_jwt_secret_key_2026';

// Zod schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organization: z.string().optional(),
  stateCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { name, email, password, organization, stateCode = '27' } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const sampleGstin = `${stateCode}AAAAA${Math.floor(1000 + Math.random() * 9000)}A1Z${Math.floor(1 + Math.random() * 9)}`;

    const user = new User({ 
      name: name.trim(), 
      email: cleanEmail, 
      password, 
      organization: organization ? organization.trim() : 'OmniAudit Enterprise',
      stateCode,
      gstin: sampleGstin
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        stateCode: user.stateCode,
        gstin: user.gstin
      }
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { email, password } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });

    // Fallback for default demo auditor login if account was wiped by in-memory restart
    if (!user && cleanEmail === 'auditor@omniaudit.ai') {
      user = new User({
        name: 'Demo Auditor',
        email: 'auditor@omniaudit.ai',
        password: 'demo1234',
        organization: 'OmniAudit Enterprise',
        stateCode: '27',
        gstin: '27BBBBM8888M2Z4'
      });
      await user.save();
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        stateCode: user.stateCode || '27',
        gstin: user.gstin
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.id === 'demo_user_id') {
      return res.json({
        user: {
          id: 'demo_user_id',
          name: 'Demo Auditor',
          email: 'auditor@omniaudit.ai',
          organization: 'OmniAudit Enterprise',
          stateCode: '27',
          gstin: '27BBBBM8888M2Z4'
        }
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

/**
 * PUT /api/auth/update-state
 * Allows user to dynamically switch their organization state code
 */
router.put('/update-state', authenticateToken, async (req, res) => {
  try {
    const { stateCode } = req.body;
    if (!stateCode) {
      return res.status(400).json({ error: 'State code is required' });
    }

    if (req.user.id !== 'demo_user_id') {
      const user = await User.findById(req.user.id);
      if (user) {
        user.stateCode = stateCode;
        user.gstin = `${stateCode}AAAAA${Math.floor(1000 + Math.random() * 9000)}A1Z${Math.floor(1 + Math.random() * 9)}`;
        await user.save();
      }
    }

    return res.json({ message: 'Enterprise state updated successfully', stateCode });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update enterprise state' });
  }
});

export default router;
