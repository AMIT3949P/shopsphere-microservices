const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_change_in_production';

const PUBLIC_ROUTES = [
  { method: 'POST', path: '/api/users/register' },
  { method: 'POST', path: '/api/users/login' },
  { method: 'GET', path: '/api/products' },
  { method: 'GET', path: '/api/health' },
];

const isPublicRoute = (req) => {
  if (req.method === 'GET' && req.path.startsWith('/api/products')) {
    return true;
  }
  return PUBLIC_ROUTES.some(
    (route) => route.method === req.method && req.path === route.path
  );
};

const verifyGatewayAuth = (req, res, next) => {
  delete req.headers['x-user-id'];
  delete req.headers['x-user-role'];
  delete req.headers['x-user-email'];

  if (isPublicRoute(req)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = { verifyGatewayAuth };
