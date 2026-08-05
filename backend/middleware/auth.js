import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'omniaudit_jwt_secret_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Attach demo fallback user if no token provided so public testing works smoothly
    req.user = { id: 'demo_user_id', name: 'Demo Auditor', email: 'auditor@omniaudit.ai' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}
