const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User schema
      required: true,
    },
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel", // Reference to the Hotel schema
      required: true,
    },
    "room_type":{
        type: String,
        required: true
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled"],
      default: "pending",
    },
    payment_id: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema, "bookings");
