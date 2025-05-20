const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth');
const express = require('express');
const router = express.Router();

router.post('/add', authMiddleware.authenticateJWT, bookingController.createBooking);
router.get('/all', authMiddleware.authenticateJWT, bookingController.getAllBookings);
router.get('/qr/:id', authMiddleware.authenticateJWT, bookingController.getQRByBookingId);
router.get('/user', authMiddleware.authenticateJWT, bookingController.getCurrentUserBookings); // New route for current user bookings
router.get('/user/:id', bookingController.getBookingbyUserId);
router.get('/:id', authMiddleware.authenticateJWT, bookingController.getBookingById);
router.post('/cancel/:id', authMiddleware.authenticateJWT, bookingController.cancelBooking);
router.post('/complete/:id', authMiddleware.authenticateJWT, bookingController.completeBooking);
router.post('/create-by-location', authMiddleware.authenticateJWT, bookingController.createBookingByLocation);
router.post('/calculate-price', bookingController.calculateBookingPrice);
router.delete('/delete/:id', authMiddleware.authenticateJWT, bookingController.deleteBooking);
router.post('/pay/:id', authMiddleware.authenticateJWT, bookingController.payBookingById);

module.exports = router;