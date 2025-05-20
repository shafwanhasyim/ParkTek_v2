// filepath: c:\UWIW_4\Big_Brain\SEMESTER_4\SBD\gad\backend\src\routes\parking_slot.route.js
const parkingSlotController = require('../controllers/parking_slot.controller');
const authMiddleware = require('../middlewares/auth');
const express = require('express');
const router = express.Router();

router.post('/add', authMiddleware.authenticateJWT, parkingSlotController.addParkingSlot);
router.get('/', parkingSlotController.getAllParkingSlots);
router.get('/all', authMiddleware.authenticateJWT, parkingSlotController.getAllParkingSlots);
router.put('/update/:id', authMiddleware.authenticateJWT, parkingSlotController.updateParkingSlot);
router.delete('/delete/:id', authMiddleware.authenticateJWT, parkingSlotController.deleteParkingSlot);
router.get('/available', parkingSlotController.countAvailableParkingSlots);
router.post('/available-by-location', parkingSlotController.getAvailableParkingSlotsByLocation);
router.get('/location/:location', parkingSlotController.getParkingSlotsByLocation);
router.get('/type/:type', parkingSlotController.getParkingSlotsByType);
router.get('/:id/bookings', parkingSlotController.getBookingsBySlotId);
router.get('/:id', parkingSlotController.getParkingSlotById);

module.exports = router;
