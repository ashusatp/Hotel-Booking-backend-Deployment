async function hotelMiddleware(req, res, next) {
    try {
      if (req.user.role !== "hotel" || !req.user) {
        throw new Error();
      }
      next();
    } catch (error) {
      res.status(401).json({
        error: true,
        message: "Unauthorized user",
        success: false,
        data: {},
      });
    }
  }
  module.exports = hotelMiddleware;
  