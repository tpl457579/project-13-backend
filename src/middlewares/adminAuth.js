import { isAuth } from './auth.js';

export const isAdmin = async (req, res, next) => {
  try {
    await isAuth(req, res, () => {
      console.log("AUTH HEADER:", req.headers.authorization);
      console.log("USER AFTER AUTH:", req.user);
      
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
      }

      if (req.user.role === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
    });
  } catch (error) {
    console.error("Admin Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Auth Error" });
  }
};