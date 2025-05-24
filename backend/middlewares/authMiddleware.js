const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    // Decode the token using JWT_SECRET from your environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded successfully: ", decoded);
    req.user = decoded; // Attach the user information to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("❌ Token verification failed: ", err);
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

module.exports = protect;
