const hotelControllers = require("./controllers/hotelControllers");
const authControllers = require("./controllers/authControllers");
const bookingController = require("./controllers/bookingController");
const authMiddleware = require("./middleware/auth-middleware");
const customerMiddleware = require("./middleware/customer-middleware");
const hotelMiddleware = require("./middleware/hotel-middleware");
const adminMiddleware = require("./middleware/admin-middleware");
const adminControllers = require("./controllers/adminControllers");
const { paymentVerification } = require("./controllers/paymentControllers");
const paymentControllers = require("./controllers/paymentControllers");
const router = require("express").Router();

// hotel routes
router.get("/api/get-hotels", hotelControllers.getHotels);
router.get("/api/get-hotel/:id", hotelControllers.getHotel);
router.post(
  "/api/book-hotel/:id",
  authMiddleware,
  customerMiddleware,
  bookingController.bookHotel
);
router.post(
  "/api/feedback/:id",
  authMiddleware,
  customerMiddleware,
  hotelControllers.giveFeedback
);

// user routes
router.post("/api/user-register", authControllers.register);
router.post("/api/user-login", authControllers.login);
router.post("/api/user-logout", authControllers.logout);
router.get("/api/refresh", authControllers.refresh);

// hotel
router.post(
  "/api/hotel/create-hotel",
  authMiddleware,
  hotelMiddleware,
  hotelControllers.createHotel
);
router.post(
  "/api/hotel/add-room/:id",
  authMiddleware,
  hotelMiddleware,
  hotelControllers.addRoomType
);
router.get(
  "/api/hotel/get-all-bookings/:id",
  authMiddleware,
  hotelMiddleware,
  bookingController.getAllConfirmedBooking
);

// admin routets
router.get(
  "/api/admin/approved-hotel",
  authMiddleware,
  adminMiddleware,
  adminControllers.getApprovedHotels
);
router.get(
  "/api/admin/unapproved-hotel",
  authMiddleware,
  adminMiddleware,
  adminControllers.getUnapprovedHotels
);
router.put(
  "/api/admin/approve-hotel/:id",
  authMiddleware,
  adminMiddleware,
  adminControllers.approveHotel
);
router.put(
  "/api/admin/unapprove-hotel/:id",
  authMiddleware,
  adminMiddleware,
  adminControllers.unapproveHotel
);
router.get(
  "/api/admin/customers",
  authMiddleware,
  adminMiddleware,
  adminControllers.getAllCustomers
);
router.get(
  "/api/admin/hotel-admins",
  authMiddleware,
  adminMiddleware,
  adminControllers.getAllHotelAdmins
);

// Rajorpay routes
router.post("/api/checkout/:id",authMiddleware, paymentControllers.checkout);
router.get("/api/get-key", paymentControllers.getKey);
router.post("/api/paymentverification", paymentControllers.paymentVerification);
router.get('/api/user/my-bookings', authMiddleware, customerMiddleware, bookingController.userBookings)
router.get('/api/user/my-booking/:id', authMiddleware, customerMiddleware, bookingController.getBooking)
router.get('/api/user/cancel-booking/:id', authMiddleware, customerMiddleware, bookingController.cancelBooking)
// router.delete(
//   "/api/admin/dlt-hotel/:id",
//   authMiddleware,
//   adminMiddleware,
//   hotelControllers.deleteHotel
// );

// router.delete(
//   "/api/admin/customer/:id",
//   authMiddleware,
//   adminMiddleware,
//   hotelControllers.deleteCustomer
// );

// router.get('/api/get-user')
// router.post('/api/booking/:hotelId/:roomId')

// // hotel routes
// router.post('/api/register-hotel')
// router.post('/api/login-hotel')
// router.post('/api/add-room')
// router.delete('/api/remove-room/:roomId')
// router.put('/api/update-room')
// router.put('/api/update-room')

module.exports = router;
