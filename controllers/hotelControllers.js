const userModel = require("../models/user-model");
const hotelService = require("../services/hotel-service");

class HotelControllers {
  async getHotels(req, res) {
    let hotels;
    try {
      hotels = await hotelService.getHotels();
    } catch (error) {
      return res.status(500).json({
        message: "error",
        error: "Internal server Error",
      });
    }
    res.status(200).json({
      message: "success",
      data: hotels,
    });
  }

  async getHotel(req, res) {
    const hotelId = req.params.id;
    let hotel;
    try {
      hotel = await hotelService.getHotel(hotelId);
      if (!hotel) {
        return res.status(404).json({
          message: "error",
          error: "Resource not found",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "error",
        error: "Internal server Error",
      });
    }

    res.status(200).json({
      message: "success",
      data: hotel,
    });
  }

  async createHotel(req, res) {
    if (req.user.activated) {
      return res.status(409).json({
        error: true,
        message: "Hotel is alredy added",
        success: false,
        data: {},
      });
    }
    const { name, contact_number, email, address, pincode, state, city } =
      req.body;
    console.log(req.body);
    const userId = req.user._id;

    if (
      !name ||
      !email ||
      !contact_number ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !userId
    ) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }

    let userById;
    try {
      userById = await userModel.findById(userId);
      if(!userById) throw new Error();
    } catch (error) {
      res.status(401).json({
        error: true,
        message: "Invalid token",
        success: false,
        data: {},
      });
    }

    let hotel;
    try {
      hotel = await hotelService.createHotel({
        name,
        email,
        contact_number,
        address,
        userId,
        city,
        state,
        pincode,
      });
      userById.hotelId = hotel.id;
      userById.activated = true;
      await userById.save();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: error.message,
        success: false,
        data: {},
      });
    }


    res.status(200).json({
      error: false,
      message: `your hotel id is ${hotel._id}`,
      success: true,
      data: hotel,
    });
  }

  async giveFeedback(req, res) {
    const { id } = req.params;
    const { feedback } = req.body;
    let hotel;
    try {
      hotel = await hotelService.getHotel(id);
      if (!hotel) {
        return res.status(404).json({
          error: true,
          message: "The request is missing a required parameter",
          success: false,
          data: {},
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error 1",
        success: false,
        data: {},
      });
    }
    let feed;
    try {
      feed = await hotelService.createFeedback(req.user._id, id, feedback);
      hotel.feedbacks.push(feed._id);
      await hotel.save();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error 1",
        success: false,
        data: {},
      });
    }

    res.status(200).json({
      error: true,
      message: "thank you for your feedback!!",
      success: false,
      data: feed,
    });
  }

  async addRoomType(req, res) {
    const { id } = req.params;
    const { roomTypeName, price, roomAvailable, url } = req.body;
    if (!id || !roomTypeName || !price || !roomAvailable || !url) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }

    try {
      const hotel = await hotelService.getHotel(id);
      if (!hotel) {
        return res.status(404).json({
          error: true,
          message: `hotel not found`,
          success: false,
          data: {},
        });
      }
      
      if((hotel.user).toString() !== (req.user._id).toString()){
        return res.status(401).json({
          error: true,
          message: "Unauthorized user",
          success: false,
          data: {},
        });
      }

      // console.log(hotel);
      const data = {
        room_type: roomTypeName,
        price_per_nigh: price,
        total_room_available: roomAvailable,
        room_image: url,
      };

      hotel.rooms.push(data);
      await hotel.save();

      res.status(200).json({
        error: false,
        message: `room added successfully`,
        success: true,
        data: hotel,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error",
        error: "Internal server Error",
      });
    }
  }

  async modifyRoomType(req, res) {
    const { id } = req.params;
    const { roomTypeName, price, url, roomAvailable } = req.body;
    if (!id && !roomTypeName && !price && !roomAvailable && !url) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }

    try {
      const hotel = hotelService.getHotel(id);
      if (!hotel) {
        return res.status(404).json({
          error: true,
          message: `hotel not found`,
          success: false,
          data: {},
        });
      }
      const { roomTypeExist } = await hotelService.isRoomTypeExist(
        hotel,
        roomTypeName
      );
      if (!roomTypeExist) {
        return res.status(404).json({
          error: true,
          message: `Room type not found`,
          success: false,
          data: {},
        });
      }

      const { rooms } = hotel;

      const newRooms = rooms.filter((room) => room.room_type !== roomTypeName);
      const data = {
        room_type: roomTypeName,
        price_per_nigh: price,
        total_room_available: roomAvailable,
        room_image: url,
      };
      newRooms.push(data);

      hotel.rooms = [...newRooms];
      await hotel.save();

      res.status(200).json({
        error: false,
        message: `room added successfully`,
        success: true,
        data: hotel,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error",
        error: "Internal server Error",
      });
    }
  }

  async modifyRoomAvailability(req, res) {
    const { id } = req.params;
    const { roomTypeName, roomAvailable } = req.body;
    if (!id || !roomAvailable) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }

    try {
      const hotel = hotelService.getHotel(id);
      if (!hotel) {
        return res.status(404).json({
          error: true,
          message: `hotel not found`,
          success: false,
          data: {},
        });
      }
      const { roomTypeExist } = await hotelService.isRoomTypeExist(
        hotel,
        roomTypeName
      );
      if (!roomTypeExist) {
        return res.status(404).json({
          error: true,
          message: `Room type not found`,
          success: false,
          data: {},
        });
      }

      const { rooms } = hotel;

      const newRooms = rooms.filter((room) => room.room_type !== roomTypeName);

      const data = {
        room_type: roomTypeName,
        total_room_available: roomAvailable,
      };

      for (const room of rooms) {
        if (room.room_type === roomType) {
          data.price_per_nigh = room.price_per_nigh;
          data.room_image = room.room_image;
        }
      }

      newRooms.push(data);

      hotel.rooms = [...newRooms];
      await hotel.save();

      res.status(200).json({
        error: false,
        message: `room added successfully`,
        success: true,
        data: hotel,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error",
        error: "Internal server Error",
      });
    }
  }
}
module.exports = new HotelControllers();
