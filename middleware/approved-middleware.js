const hotelService = require("../services/hotel-service");

async function approvedHotelMiddleware(req, res, next) {
  try {
    if (!req.user) {
      throw new Error();
    }

    let hotel = await hotelService.getHotel(req.user._id);
    if (!hotel) throw new Error();
    if (!hotel.approve) throw new Error();
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
module.exports = approvedHotelMiddleware;
