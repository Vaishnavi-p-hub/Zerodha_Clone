
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    // 4. Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    // 5. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 6. Attach authenticated user ID
    req.userId = decoded.userId;

    // 7. Continue to controller
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
};

/**
 * Get authenticated user's profile
 */
const getProfile = async (req, res) => {
  try {
    // Find user using the ID from verified JWT
    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

module.exports = protect;