const bookingRepo = require("../repositories/booking.repo");
const parkingSlotRepo = require("../repositories/parking_slot.repo");
const userRepo = require("../repositories/user.repo");
const baseResponse = require("../utils/baseResponse.util");

// Price calculation function - pure business logic, no database interaction
function calculatePrice(startTime, endTime) {
    // Parse the timestamps to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Calculate duration in milliseconds
    const durationMs = endDate - startDate;

    // Convert milliseconds to hours (rounded up)
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    // Calculate price: 3000 for the first hour, 2000 for each additional hour
    let totalPrice = 0;
    if (durationHours <= 0) {
        // Handle invalid duration (end time before or equal to start time)
        return 0;
    } else if (durationHours === 1) {
        totalPrice = 3000;
    } else {
        totalPrice = 3000 + (durationHours - 1) * 2000;
    }

    return totalPrice;
}

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingRepo.getAllBookings();
        return res.status(200).json(baseResponse.success("Bookings fetched successfully", bookings));
    } catch (error) {
        console.error("Error fetching bookings", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getBookingById = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await bookingRepo.getBookingById(id);
        if (!booking) {
            return res.status(404).json(baseResponse.error("Booking not found"));
        }
        return res.status(200).json(baseResponse.success("Booking fetched successfully", booking));
    } catch (error) {
        console.error("Error fetching booking", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getBookingbyUserId = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await bookingRepo.getBookingByUserId(id);
        if (!booking) {
            return res.status(404).json(baseResponse.error("Booking not found"));
        }
        return res.status(200).json(baseResponse.success("Booking fetched successfully", booking));
    } catch (error) {
        console.error("Error fetching booking", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

// Controller endpoint to calculate price
exports.calculateBookingPrice = async (req, res) => {
    const { start_time, end_time } = req.body;

    if (!start_time || !end_time) {
        return res.status(400).json(baseResponse.error("Start time and end time are required"));
    }

    try {
        // Format validation for timestamps
        let formattedStartTime, formattedEndTime;

        try {
            formattedStartTime = new Date(start_time);
            formattedEndTime = new Date(end_time);

            // Check if dates are valid
            if (isNaN(formattedStartTime.getTime()) || isNaN(formattedEndTime.getTime())) {
                return res.status(400).json(baseResponse.error("Invalid date format"));
            }

            // Check if end time is after start time
            if (formattedEndTime <= formattedStartTime) {
                return res.status(400).json(baseResponse.error("End time must be after start time"));
            }

            // Convert to ISO strings for consistency
            formattedStartTime = formattedStartTime.toISOString();
            formattedEndTime = formattedEndTime.toISOString();
        } catch (error) {
            return res.status(400).json(baseResponse.error("Invalid date format"));
        }

        // Calculate price using the business logic function
        const price = calculatePrice(formattedStartTime, formattedEndTime);

        // Calculate duration for the response
        const startDate = new Date(formattedStartTime);
        const endDate = new Date(formattedEndTime);
        const durationMs = endDate - startDate;
        const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

        return res.status(200).json(baseResponse.success("Price calculated successfully", {
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration_hours: durationHours,
            price: price
        }));
    } catch (error) {
        console.error("Error calculating price", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

// Create booking function with price calculation
exports.createBooking = async (req, res) => {
    const user_id = req.user.userId; // Fixed: use userId instead of id to match the JWT payload structure
    const { parking_slot_id, start_time, end_time } = req.body;

    if (!parking_slot_id || !start_time || !end_time) {
        return res.status(400).json(baseResponse.error("All fields are required"));
    }

    try {
        // Format and validate timestamps
        let formattedStartTime, formattedEndTime;

        try {
            formattedStartTime = new Date(start_time);
            formattedEndTime = new Date(end_time);

            // Check if dates are valid
            if (isNaN(formattedStartTime.getTime()) || isNaN(formattedEndTime.getTime())) {
                return res.status(400).json(baseResponse.error("Invalid date format"));
            }

            // Check if end time is after start time
            if (formattedEndTime <= formattedStartTime) {
                return res.status(400).json(baseResponse.error("End time must be after start time"));
            }

            // Convert to ISO strings for consistency
            formattedStartTime = formattedStartTime.toISOString();
            formattedEndTime = formattedEndTime.toISOString();
        } catch (error) {
            return res.status(400).json(baseResponse.error("Invalid date format"));
        }

        // Business logic: Check if parking slot exists
        const parkingSlot = await parkingSlotRepo.getParkingSlotById(parking_slot_id);
        if (!parkingSlot) {
            return res.status(404).json(baseResponse.error("Parking slot not found"));
        }

        // Check if the parking slot is active
        if (!parkingSlot.is_active) {
            return res.status(400).json(baseResponse.error("Parking slot is not available"));
        }

        // Business logic: Check for overlapping bookings
        const overlappingBookings = await bookingRepo.getOverlappingBookings(
            parking_slot_id,
            formattedStartTime,
            formattedEndTime
        );

        if (overlappingBookings.length > 0) {
            return res.status(400).json(baseResponse.error("Parking slot is already booked for the selected time"));
        }

        // Business logic: Calculate price
        const price = calculatePrice(formattedStartTime, formattedEndTime);

        // Data operation: Create booking with the calculated price
        const newBooking = await bookingRepo.createBookingWithPrice(
            user_id,
            parking_slot_id,
            formattedStartTime,
            formattedEndTime,
            'pending',
            price
        );
        // Mark the parking slot as inactive (not available) while the booking is pending
        await parkingSlotRepo.updateParkingSlot(parking_slot_id, {
            ...parkingSlot,
            is_active: false
        });

        try {
            // Generate QR code and upload to Cloudinary
            const qrService = require('../services/qrService');
            const qrCodeUrl = await qrService.generateAndUploadQR(newBooking.id);

            // Update booking with QR code URL
            const updatedBooking = await bookingRepo.updateQRUrl(newBooking.id, qrCodeUrl);

            // Return updated booking data with QR code URL
            return res.status(201).json(baseResponse.success("Booking created successfully", updatedBooking));
        } catch (qrError) {
            // Log QR code generation error but don't fail the request
            console.error("Error generating QR code:", qrError);

            // Still return the booking, even without QR code
            return res.status(201).json(baseResponse.success("Booking created successfully, but QR generation failed", newBooking));
        }
    } catch (error) {
        console.error("Error creating booking", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

// Cancel booking now also updates parking slot availability
exports.cancelBooking = async (req, res) => {
    const user_id = req.user.userId; // Fixed: use userId instead of id to match the JWT payload structure
    const { id } = req.params;

    try {
        const booking = await bookingRepo.getBookingById(id);
        if (!booking) {
            return res.status(404).json(baseResponse.error("Booking not found"));
        }

        if (booking.user_id !== user_id) {
            return res.status(403).json(baseResponse.error("You are not authorized to cancel this booking"));
        }

        const cancelledBooking = await bookingRepo.cancelBooking(id);

        // When a booking is canceled, make the slot active again
        const parkingSlot = await parkingSlotRepo.getParkingSlotById(booking.slot_id);
        if (parkingSlot) {
            await parkingSlotRepo.updateParkingSlot(booking.slot_id, {
                ...parkingSlot,
                is_active: true
            });
        }

        return res.status(200).json(baseResponse.success("Booking cancelled successfully", cancelledBooking));
    } catch (error) {
        console.error("Error cancelling booking", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

// Add this function to handle completed bookings
exports.completeBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await bookingRepo.getBookingById(id);
        if (!booking) {
            return res.status(404).json(baseResponse.error("Booking not found"));
        }

        const completedBooking = await bookingRepo.completeBooking(id);

        // When a booking is completed, make the slot active again
        const parkingSlot = await parkingSlotRepo.getParkingSlotById(booking.slot_id);
        if (parkingSlot) {
            await parkingSlotRepo.updateParkingSlot(booking.slot_id, {
                ...parkingSlot,
                is_active: true
            });
        }

        return res.status(200).json(baseResponse.success("Booking completed successfully", completedBooking));
    } catch (error) {
        console.error("Error completing booking", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

// Create booking by location with price calculation
exports.createBookingByLocation = async (req, res) => {
    const user_id = req.user.userId; // Fixed: use userId instead of id to match the JWT payload structure
    const { location, type, start_time, end_time } = req.body;

    if (!location || !start_time || !end_time) {
        return res.status(400).json(baseResponse.error("Location, start time, and end time are required"));
    }

    try {
        // Format and validate timestamps
        let formattedStartTime, formattedEndTime;

        try {
            formattedStartTime = new Date(start_time);
            formattedEndTime = new Date(end_time);

            // Check if dates are valid
            if (isNaN(formattedStartTime.getTime()) || isNaN(formattedEndTime.getTime())) {
                return res.status(400).json(baseResponse.error("Invalid date format"));
            }

            // Check if end time is after start time
            if (formattedEndTime <= formattedStartTime) {
                return res.status(400).json(baseResponse.error("End time must be after start time"));
            }

            // Convert to ISO strings for consistency
            formattedStartTime = formattedStartTime.toISOString();
            formattedEndTime = formattedEndTime.toISOString();
        } catch (error) {
            return res.status(400).json(baseResponse.error("Invalid date format"));
        }

        // Business logic: Find available slots by location
        const availableSlots = await parkingSlotRepo.getParkingSlotsByLocation(location);
        if (availableSlots.length === 0) {
            return res.status(404).json(baseResponse.error(`No parking slots found at location "${location}"`));
        }

        // Filter by type and active status
        let filteredSlots = availableSlots.filter(slot => slot.is_active);
        if (filteredSlots.length === 0) {
            return res.status(404).json(baseResponse.error(`No available parking slots found at location "${location}"`));
        }

        if (type) {
            filteredSlots = filteredSlots.filter(slot => slot.type === type);
            if (filteredSlots.length === 0) {
                return res.status(404).json(baseResponse.error(`No available ${type} parking slots found at location "${location}"`));
            }
        }

        // Business logic: Find a slot that's not booked for the requested time
        let selectedSlot = null;

        for (const slot of filteredSlots) {
            const overlappingBookings = await bookingRepo.getOverlappingBookings(
                slot.id,
                formattedStartTime,
                formattedEndTime
            );

            if (overlappingBookings.length === 0) {
                selectedSlot = slot;
                break;
            }
        }

        if (!selectedSlot) {
            return res.status(400).json(baseResponse.error(
                `All ${type ? type + " " : ""}parking slots at location "${location}" are booked for the selected time`
            ));
        }

        // Business logic: Calculate price
        const price = calculatePrice(formattedStartTime, formattedEndTime);
        // Data operation: Create booking
        const newBooking = await bookingRepo.createBookingWithPrice(
            user_id,
            selectedSlot.id,
            formattedStartTime,
            formattedEndTime,
            'pending',
            price
        );

        // Mark the parking slot as inactive (not available) while the booking is pending
        await parkingSlotRepo.updateParkingSlot(selectedSlot.id, {
            ...selectedSlot,
            is_active: false
        });

        try {
            // Generate QR code and upload to Cloudinary
            const qrService = require('../services/qrService');
            const qrCodeUrl = await qrService.generateAndUploadQR(newBooking.id);

            // Update booking with QR code URL
            const updatedBooking = await bookingRepo.updateQRUrl(newBooking.id, qrCodeUrl);

            // Return updated booking data with QR code URL
            return res.status(201).json(baseResponse.success("Booking created successfully", {
                ...updatedBooking,
                parking_slot: selectedSlot
            }));
        } catch (qrError) {
            // Log QR code generation error but don't fail the request
            console.error("Error generating QR code:", qrError);

            // Still return the booking, even without QR code
            return res.status(201).json(baseResponse.success("Booking created successfully, but QR generation failed", {
                ...newBooking,
                parking_slot: selectedSlot
            }));
        }
    } catch (error) {
        console.error("Error creating booking by location", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await bookingRepo.getBookingById(id);
        if (!booking) {
            return res.status(404).json(baseResponse.error("Booking not found"));
        }

        await bookingRepo.deleteBooking(id);
        return res.status(200).json(baseResponse.success("Booking deleted successfully"));
    } catch (error) {
        console.error("Error deleting booking", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getQRByBookingId = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId; // Fixed: use userId instead of id to match the JWT payload structure

    try {
        // Find the booking
        const booking = await bookingRepo.getBookingById(id);

        // If no booking found, return 404
        if (!booking) {
            return res.status(404).json(baseResponse.error("Booking not found"));
        }

        // Check if the authenticated user owns the booking
        if (booking.user_id !== userId) {
            return res.status(403).json(baseResponse.error("Forbidden: Access denied"));
        }
        // Return the QR code URL in the specified format
        return res.status(200).json({
            qr_code_url: booking.qr_code_url
        });
    } catch (error) {
        console.error("Error fetching booking QR code:", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
};

exports.getCurrentUserBookings = async (req, res) => {
    const userId = req.user.userId; // Fixed: use userId instead of id to match the JWT payload structure

    try {
        const bookings = await bookingRepo.getBookingByUserId(userId);
        return res.status(200).json(baseResponse.success("User bookings fetched successfully", bookings));
    } catch (error) {
        console.error("Error fetching user bookings", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
};

exports.payBookingById = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if booking exists
        const booking = await bookingRepo.getBookingById(id);
        if (!booking) {
            return res.status(404).json(baseResponse.error("Booking not found"));
        }

        // Check if booking is already paid
        if (booking.is_paid) {
            return res.status(400).json(baseResponse.error("Booking is already paid"));
        }

        // Process payment (in a real app, this would connect to a payment gateway)
        const updatedBooking = await bookingRepo.payBooking(id);

        return res.status(200).json(baseResponse.success("Payment successful", {
            booking_id: updatedBooking.id,
            amount_paid: updatedBooking.price,
            paid_at: updatedBooking.paid_at,
            status: updatedBooking.status
        }));
    } catch (error) {
        console.error("Error processing payment", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}