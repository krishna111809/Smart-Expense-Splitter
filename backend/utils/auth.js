const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret_change_me";

exports.getUserIdFromReq = (req) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

  if (!token) throw new Error("No token!");
  
  const payload = jwt.verify(token, JWT_SECRET);
  return payload.id;
};