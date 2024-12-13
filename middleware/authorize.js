import jwt from 'jsonwebtoken'

// Middleware untuk otorisasi berdasarkan peran
const authorize = (roles = []) => {
  // roles bisa berupa string tunggal atau array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    try {
      // Ambil token dari header Authorization
      const authHeader = req.header('Authorization');
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
      }

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;

      // Cek apakah pengguna memiliki peran yang diizinkan
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: You do not have permission to perform this action." });
      }

      next(); // Jika valid, lanjutkan ke handler berikutnya
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  };
};

export default authorize;