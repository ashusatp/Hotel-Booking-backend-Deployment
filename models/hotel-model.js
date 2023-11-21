const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user:{
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approve: {
      type: Boolean,
      default: false,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: 'India'
      },
    },
    address: {
      type: String,
      required: true,
    },
    contact_number: {
      type: String,
      required: true,
      unique: true,
    },
    rooms: {
      type: Array,
      items: {
        room_type: {
          type: String,
        },
        price_per_nigh: {
          type: Number,
        },
        total_room_available: {
          type: Number,
        },
        room_image: {
          type: String,
        },
      },
    },
    images: {
      type: Array,
      items: {
        type: String,
      },
    },
    feedbacks: {
      type: Array,
      items: {
        type: Schema.Types.ObjectId,
        ref: 'Feedback'
      },
    },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hotel", hotelSchema, "hotels");
