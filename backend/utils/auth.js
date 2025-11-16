const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret_change_me";

// Middleware to protect routes
exports.getUserIdFromReq = (req) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
  if (!token) throw new Error("No token");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || !payload.id) throw new Error("Invalid token payload");
    return payload.id;
  } catch (err) {
    throw new Error("Invalid token");
  }
};
