import { isAuth } from './auth.js';

export const isAdmin = async (req, res, next) => {
  // Wrap isAuth in a way that respects the Express flow
  try {
    await isAuth(req, res, () => {
      // Check if isAuth successfully identified a user
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
      }

      // Check if that user has the admin role
      if (req.user.role === 'admin') {
        next(); // Move to the controller
      } else {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
    });
  } catch (error) {
    console.error("Admin Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Auth Error" });
    console.log("AUTH HEADER:", req.headers.authorization)
console.log("USER AFTER AUTH:", req.user)

  }
};