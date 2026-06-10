import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function checkAdminAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, '');
  return token === ADMIN_PASSWORD;
}

export function requireAdminAuth(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  if (checkAdminAuth(req)) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Unauthorized. Invalid admin password.' });
}
