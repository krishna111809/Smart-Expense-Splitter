// backend/utils/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Extract user ID from request's Authorization header
exports.getUserIdFromReq = (req) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
  if (!token) throw new Error("No token");

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (!payload || !payload.id) throw new Error("Invalid token payload");
    return payload.id;
  } catch (err) {
    throw new Error("Invalid token");
  }
};
