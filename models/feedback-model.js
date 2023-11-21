const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    hotelId:{
        type: Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    feedback:{
        type: String,
        required: true
    }
},{timestamps: true});
module.exports = mongoose.model('Feedback', feedbackSchema, 'feedbacks');