const bookingModel = require("../models/booking-model");
const feedbackModel = require("../models/feedback-model");
const hotelModel = require("../models/hotel-model");

class HotelService {
  async getHotels() {
    const hotels = hotelModel.find();
    return hotels;
  }

  async getHotel(id) {
    const hotel = hotelModel.findOne({ _id: id });
    return hotel;
  }

  async getApprovedHotels(hotels) {
    return hotels.filter((hotel) => hotel.approve);
  }

  async getUnapprovedHotels(hotels) {
    return hotels.filter((hotel) => !hotel.approve);
  }

  async createHotel(data) {
    const {
      name,
      email,
      contact_number,
      address,
      userId,
      city,
      state,
      pincode,
    } = data;
    const location = {
      city,
      pincode,
      state,
    };
    return await hotelModel.create({
      name,
      user: userId,
      email,
      contact_number,
      location,
      address,
    });
  }

  async isRoomTypeExist(hotel, roomType) {
    let available = false;
    let roomTypeExist = false;
    const { rooms } = hotel;
    for (const room of rooms) {
      if (room.room_type === roomType) {
        available = false;
        if (room.total_room_available != 0) {
          available = true;
        }
        roomTypeExist = true;
        return { available, roomTypeExist };
      }
    }
    return { available, roomTypeExist };
  }

  async getPricePerDay(hotel, roomType) {
    const { rooms } = hotel;
    let price;
    for (const room of rooms) {
      if (room.room_type === roomType) {
        price = room.price_per_nigh;
      }
    }
    // console.log(setroom);
    return Number(price);
  }

  async bookHotel(user, hotelId, roomType, checkIn, checkOut, netPrice, paymentId) {
    // console.log(netPrice);
    return await bookingModel.create({
      user: user._id,
      hotel: hotelId,
      room_type: roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice: netPrice,
      status: "confirmed",
      payment_id: paymentId
    });
  }

  async createFeedback(userId, hotelId, feedback) {
    return await feedbackModel.create({ userId, hotelId, feedback });
  }
}
module.exports = new HotelService();
