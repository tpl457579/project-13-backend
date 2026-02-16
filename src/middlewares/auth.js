export const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('🔍 Auth Header:', authHeader); // Add this

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No token or invalid format'); // Add this
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🎫 Token:', token); // Add this

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    console.log('✅ Payload:', payload); // Add this
    
    const user = await User.findById(payload.id).select('-password'); 
    console.log('👤 User found:', user); // Add this
    
    if (!user) {
      console.log('❌ User not found in DB'); // Add this
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    console.log('✅ req.user set:', req.user); // Add this
    next();
  } catch (error) {
    console.log('❌ Token verification error:', error.message); // Add this
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ message });
  }
}