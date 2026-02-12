export const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    
    // Efficiently find user but only get the fields we need for auth/admin check
    const user = await User.findById(payload.id).select('-password'); 
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // This is what isAdmin needs!
    next();
  } catch (error) {
    // Distinguish between an expired token and a fake one
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ message });
  }
}