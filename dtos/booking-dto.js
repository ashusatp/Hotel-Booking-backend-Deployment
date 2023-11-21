class BookingDto{
    id;
    createdAt;
    username;
    bookings;
    hotelID;

    constructor(user){
        this.hotelID = user.hotelId;
        this.id = user._id;
        this.username = user.username;
        this.bookings = user.bookings;
        this.createdAt = user.createdAt
    }
}

module.exports = BookingDto;