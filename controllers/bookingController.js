const bookingService = require("../services/booking-service");
const hotelService = require("../services/hotel-service");

class BookingControllers {
  async bookHotel(req, res) {
    const hotelId = req.params.id;
    const { roomType, checkIn, checkOut, amount, paymentId } = req.body;
    if (!hotelId || !checkIn || !checkOut || !roomType || !amount) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }
    let hotel;
    try {
      hotel = await hotelService.getHotel(hotelId);
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

    const { available, roomTypeExist } = await hotelService.isRoomTypeExist(
      hotel,
      roomType
    );
    if (!roomTypeExist) {
      return res.status(404).json({
        error: true,
        message: "This type of room is not exist in our hotel",
        success: false,
        data: {},
      });
    }
    if (!available) {
      return res.status(404).json({
        error: true,
        message: "All rooms are booked",
        success: false,
        data: {},
      });
    }

    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const difference = date2.getTime() - date1.getTime();
    const differenceInDays = difference / (1000 * 3600 * 24);
    const pricePerday = await hotelService.getPricePerDay(hotel, roomType);
    const netPrice = pricePerday * differenceInDays;

    if (Number(amount) !== netPrice) {
      return res.status(400).json({
        error: true,
        message:
          "The provided amount does not match the expected amount for this transaction.",
        success: false,
        data: {},
      });
    }

    try {
      const { rooms } = hotel;
      const data = {};
      const newRooms = rooms.filter((room) => room.room_type !== roomType);
      for (const room of rooms) {
        if (room.room_type === roomType) {
          data.room_type = room.room_type;
          data.price_per_nigh = room.price_per_nigh;
          data.total_room_available = room.total_room_available - 1;
          data.room_image = room.room_image;
        }
      }
      newRooms.push(data);
      hotel.rooms = [...newRooms];
      await hotel.save();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error 1",
        success: false,
        data: {},
      });
    }

    let booking;
    try {
      booking = await hotelService.bookHotel(
        req.user,
        hotel._id,
        roomType,
        checkIn,
        checkOut,
        netPrice,
        paymentId
      );
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
        success: false,
        data: {},
      });
    }
    res.status(200).json({
      error: true,
      message: "Pay to confirm your room",
      success: false,
      data: booking,
    });
  }

  async getAllConfirmedBooking(req, res) {
    const id = req.user._id;
    if (!id) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }
    try {
      const bookings = await bookingService.getAllConfirmedBookings(id);
      res.status(200).json({
        error: false,
        message: "Confirmed bookings: ",
        success: true,
        data: bookings,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
        success: false,
        data: {},
      });
    }
  }

  async cancelBooking(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }

    try {
      const booking = await bookingService.getBookingById(id);
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({
          error: true,
          message: "Unauthorized user",
          success: false,
          data: {},
        });
      }
      booking.status = "canceled";
      await booking.save();
      res.status(200).json({
        error: false,
        message: "Confirmed bookings: ",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
        success: false,
        data: {},
      });
    }
  }

  async getBooking(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }

    try {
      const booking = await bookingService.getBookingById(id);

      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({
          error: true,
          message: "Unauthorized user",
          success: false,
          data: {},
        });
      }

      const {
        _id,
        hotel,
        room_type,
        checkInDate,
        checkOutDate,
        totalPrice,
        status,
      } = booking;

      const data = {
        _id,
        room_type,
        checkInDate,
        checkOutDate,
        totalPrice,
        status,
      };

      let roomUrl;
      const { rooms } = hotel;
      for (let room of rooms) {
        if (room.room_type === room_type) {
          roomUrl = room.room_image;
        }
      }
      data.roomUrl = roomUrl;
      data.hotelName = hotel.name;
      data.hotelAddress = hotel.address;
      data.hotelEmail = hotel.email;
      data.hotelContactNumber = hotel.contact_number;

      res.status(200).json({
        error: false,
        message: "Confirmed bookings: ",
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
        success: false,
        data: {},
      });
    }
  }

  async userBookings(req, res) {
    const id = req.user._id;
    if (!id) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }
    try {
      const bookings = await bookingService.getAllBookings(id);

      const sendData = [];
      for (let booking of bookings) {
        const { _id, hotel, status, checkInDate, checkOutDate } = booking;
        const data = {
          _id,
          hotelID: hotel._id,
          hotelName: hotel.name,
          status,
          checkInDate,
          checkOutDate,
        };
        sendData.push(data);
      }

      res.status(200).json({
        error: false,
        message: "bookings: ",
        success: true,
        data: sendData,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
        success: false,
        data: {},
      });
    }
  }

  async getAllCanceledBookings(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }
    try {
      const bookings = bookingService.getAllCanceledBookings(id);
      res.status(200).json({
        error: true,
        message: "Pay to confirm your room",
        success: false,
        data: bookings,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
        success: false,
        data: {},
      });
    }
  }
}
module.exports = new BookingControllers();
