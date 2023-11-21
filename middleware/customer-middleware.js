const tokenService = require("../services/token-service");

async function customerMiddleware(req, res, next) {
  try {
    if(req.user.role !== 'customer' || !req.user){
        throw new Error();
    }
    next();
  } catch (error) {
    res
      .status(401)
      .json({
        error: true,
        message: "Unauthorized user",
        success: false,
        data: {},
      });
  }
}
module.exports = customerMiddleware;
