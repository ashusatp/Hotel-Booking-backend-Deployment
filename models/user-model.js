const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Trim leading and trailing whitespace
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    profilePicture: {
      type: String,
    },
    hotelId:{
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
      unique: true,
    },
    activated:{
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "hotel"], // Define possible roles
      default: "customer", // Default role for new users
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking", // Reference to Booking schema
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema, "users");
