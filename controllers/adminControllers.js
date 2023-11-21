const hotelService = require("../services/hotel-service");
const userService = require("../services/user-service");

class AdminControllers {
  async getApprovedHotels(req, res) {
    let hotels;
    try {
      hotels = await hotelService.getHotels();
      if (!hotels) throw new Error();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
        success: false,
        data: {},
      });
    }

    const approvedHotels = await hotelService.getApprovedHotels(hotels);
    res.status(200).json({
      error: false,
      message: "here is the list of approved hotels",
      success: true,
      data: approvedHotels,
    });
  }

  async getUnapprovedHotels(req, res) {
    let hotels;
    try {
      hotels = await hotelService.getHotels();
      if (!hotels) throw new Error();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
        success: false,
        data: {},
      });
    }

    const unapprovedHotels = await hotelService.getUnapprovedHotels(hotels);
    console.log(unapprovedHotels);
    res.status(200).json({
      error: false,
      message: "here is the list of unapproved hotels",
      success: false,
      data: unapprovedHotels,
    });
  }

  async approveHotel(req, res) {
    const { id } = req.params;
    let hotel;
    try {
      hotel = await hotelService.getHotel(id);
      if (!hotel) {
        return res.status(400).json({
          error: true,
          message: "Hotel is not Exist",
          success: false,
          data: {},
        });
      }
      if (hotel.approve) {
        return res.status(200).json({
          error: false,
          message: `${hotel._id} is already approved`,
          success: true,
          data: {},
        });
      }
      hotel.approve = true;
      await hotel.save();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
        success: false,
        data: {},
      });
    }

    res.status(200).json({
      error: false,
      message: `${hotel._id} is approved`,
      success: true,
      data: {},
    });
  }

  async unapproveHotel(req, res) {
    const { id } = req.params;
    let hotel;
    try {
      hotel = await hotelService.getHotel(id);
      if (!hotel) {
        return res.status(400).json({
          error: true,
          message: "Hotel is not Exist",
          success: false,
          data: {},
        });
      }
      if (!hotel.approve) {
        return res.status(200).json({
          error: false,
          message: `${hotel._id} is already unapproved`,
          success: true,
          data: {},
        });
      }
      hotel.approve = false;
      await hotel.save();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
        success: false,
        data: {},
      });
    }

    res.status(200).json({
      error: false,
      message: `${hotel._id} is unapproved`,
      success: true,
      data: {},
    });
  }

  async getAllCustomers(req, res) {
    try {
      const customers = await userService.getUsersByRole("customer");
      if (!customers) throw new Error();
      res.status(200).json({
        error: false,
        message: `here is the list of customers`,
        success: true,
        data: customers,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
        success: false,
        data: {},
      });
    }
  }

  async getAllHotelAdmins(req, res) {
    try {
      const hotelAdmins = await userService.getUsersByRole("hotel");
      if (!hotelAdmins) throw new Error();
      res.status(200).json({
        error: false,
        message: `here is the list of hotelAdmins`,
        success: true,
        data: hotelAdmins,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
        success: false,
        data: {},
      });
    }
  }

  async deleteCustomer(req, res) {}

  async deleteHotel(req, res) {}
}
module.exports = new AdminControllers();
