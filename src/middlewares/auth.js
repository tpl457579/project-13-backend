import jwt from 'jsonwebtoken'
import User from '../api/models/users.js'


export const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('🔑 Auth header received:', authHeader); // Add this

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No auth header or wrong format'); // Add this
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    console.log('✅ Token verified, payload:', payload); // Add this
    
    const user = await User.findById(payload.id).select('-password'); 
    console.log('👤 User found:', user?.role); // Add this
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Token error:', error.message); // Add this
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ message });
  }
}