const parkingSlotRepo = require('../repositories/parking_slot.repo');
const bookingRepo = require('../repositories/booking.repo');
const baseResponse = require('../utils/baseResponse.util');

exports.getAllParkingSlots = async (req, res) => {
    try {
        // Get all parking slots
        const parkingSlots = await parkingSlotRepo.getAllParkingSlots();

        // Get IDs of currently occupied slots (slots with active bookings at current time)
        const occupiedSlotIds = await bookingRepo.getOccupiedSlotIds();

        // Add is_occupied field to each slot
        // A slot is considered occupied if:
        // 1. It has a current active booking (in occupiedSlotIds) OR
        // 2. It is inactive (is_active = false)
        const slotsWithOccupancy = parkingSlots.map(slot => ({
            ...slot,
            is_occupied: !slot.is_active || occupiedSlotIds.includes(slot.id)
        }));

        return res.status(200).json(baseResponse.success("Parking slots fetched successfully", slotsWithOccupancy));
    } catch (error) {
        console.error("Error fetching parking slots", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.addParkingSlot = async (req, res) => {
    const { location, type, is_active } = req.body;

    if (!location || !type) {
        return res.status(400).json(baseResponse.error("Location and type are required"));
    }

    try {
        // Proper boolean conversion
        let isActiveBoolean;

        if (is_active === undefined || is_active === "") {
            isActiveBoolean = true;  // Default to true if not provided
        } else {
            // Convert various string/boolean/number representations to boolean
            isActiveBoolean = is_active === true ||
                is_active === "true" ||
                is_active === "1" ||
                is_active === 1;
        }

        console.log("Input is_active:", is_active);
        console.log("Converted isActiveBoolean:", isActiveBoolean);

        const newParkingSlot = await parkingSlotRepo.addParkingSlot({
            location,
            type,
            is_active: isActiveBoolean
        });

        return res.status(201).json(baseResponse.success("Parking slot added successfully", newParkingSlot));
    } catch (error) {
        console.error("Error adding parking slot", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.updateParkingSlot = async (req, res) => {
    const { id } = req.params;
    const { location, type, is_active } = req.body;

    if (!location || !type) {
        return res.status(400).json(baseResponse.error("Location and type are required"));
    }

    try {
        const parkingSlot = await parkingSlotRepo.getParkingSlotById(id);
        if (!parkingSlot) {
            return res.status(404).json(baseResponse.error("Parking slot not found"));
        }

        // Proper boolean conversion
        let isActiveBoolean;

        if (is_active === undefined || is_active === "") {
            isActiveBoolean = parkingSlot.is_active;  // Keep existing value if not provided
        } else {
            // Convert various string/boolean/number representations to boolean
            isActiveBoolean = is_active === true ||
                is_active === "true" ||
                is_active === "1" ||
                is_active === 1;
        }

        console.log("Input is_active:", is_active);
        console.log("Converted isActiveBoolean:", isActiveBoolean);

        const updatedParkingSlot = await parkingSlotRepo.updateParkingSlot(id, {
            location,
            type,
            is_active: isActiveBoolean
        });

        return res.status(200).json(baseResponse.success("Parking slot updated successfully", updatedParkingSlot));
    } catch (error) {
        console.error("Error updating parking slot", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.deleteParkingSlot = async (req, res) => {
    const { id } = req.params;

    try {
        const parkingSlot = await parkingSlotRepo.getParkingSlotById(id);
        if (!parkingSlot) {
            return res.status(404).json(baseResponse.error("Parking slot not found"));
        }

        await parkingSlotRepo.deleteParkingSlot(id);
        return res.status(200).json(baseResponse.success("Parking slot deleted successfully"));
    } catch (error) {
        console.error("Error deleting parking slot", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.countAvailableParkingSlots = async (req, res) => {
    try {
        const count = await parkingSlotRepo.countAvailableParkingSlots();
        return res.status(200).json(baseResponse.success("Available parking slots count fetched successfully", { count }));
    } catch (error) {
        console.error("Error counting available parking slots", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getParkingSlotById = async (req, res) => {
    const { id } = req.params;

    try {
        const parkingSlot = await parkingSlotRepo.getParkingSlotById(id);
        if (!parkingSlot) {
            return res.status(404).json(baseResponse.error("Parking slot not found"));
        }

        // Check if the slot is currently occupied
        const occupiedSlotIds = await bookingRepo.getOccupiedSlotIds();
        const slotWithOccupancy = {
            ...parkingSlot,
            is_occupied: occupiedSlotIds.includes(parseInt(id))
        };

        return res.status(200).json(baseResponse.success("Parking slot fetched successfully", slotWithOccupancy));
    } catch (error) {
        console.error("Error fetching parking slot", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getAvailableParkingSlots = async (req, res) => {
    const { start_time, end_time } = req.query;

    if (!start_time || !end_time) {
        return res.status(400).json(baseResponse.error("Start time and end time are required"));
    }

    try {
        const overlappingBookings = await bookingRepo.getOverlappingBookings(start_time, end_time);
        const bookedSlotIds = overlappingBookings.map(booking => booking.parking_slot_id);

        const availableParkingSlots = await parkingSlotRepo.getAllParkingSlots();
        const filteredSlots = availableParkingSlots.filter(slot => !bookedSlotIds.includes(slot.id));

        return res.status(200).json(baseResponse.success("Available parking slots fetched successfully", filteredSlots));
    } catch (error) {
        console.error("Error fetching available parking slots", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.checkParkingSlotAvailability = async (req, res) => {
    const { id } = req.params;
    const { start_time, end_time } = req.query;

    if (!start_time || !end_time) {
        return res.status(400).json(baseResponse.error("Start time and end time are required"));
    }

    try {
        const overlappingBookings = await bookingRepo.getOverlappingBookings(id, start_time, end_time);
        if (overlappingBookings.length > 0) {
            return res.status(200).json(baseResponse.success("Parking slot is not available", { available: false }));
        }
        return res.status(200).json(baseResponse.success("Parking slot is available", { available: true }));
    } catch (error) {
        console.error("Error checking parking slot availability", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getParkingSlotsByType = async (req, res) => {
    const { type } = req.params;

    try {
        const parkingSlots = await parkingSlotRepo.getParkingSlotsByType(type);
        if (parkingSlots.length === 0) {
            return res.status(404).json(baseResponse.error("No parking slots found for this type"));
        }
        return res.status(200).json(baseResponse.success("Parking slots fetched successfully", parkingSlots));
    } catch (error) {
        console.error("Error fetching parking slots by type", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getParkingSlotsByLocation = async (req, res) => {
    const { location } = req.params;

    try {
        const parkingSlots = await parkingSlotRepo.getParkingSlotsByLocation(location);
        if (parkingSlots.length === 0) {
            return res.status(404).json(baseResponse.error("No parking slots found for this location"));
        }
        return res.status(200).json(baseResponse.success("Parking slots fetched successfully", parkingSlots));
    } catch (error) {
        console.error("Error fetching parking slots by location", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getAvailableParkingSlotsByLocation = async (req, res) => {
    const { location, start_time, end_time } = req.body;

    if (!location || !start_time || !end_time) {
        return res.status(400).json(baseResponse.error("Location, start time, and end time are required"));
    }

    try {
        // Format the timestamps correctly
        let formattedStartTime, formattedEndTime;

        try {
            formattedStartTime = new Date(start_time).toISOString();
            formattedEndTime = new Date(end_time).toISOString();
        } catch (error) {
            return res.status(400).json(baseResponse.error("Invalid date format"));
        }

        const availableSlots = await parkingSlotRepo.getAvailableParkingSlotsByLocation(
            location,
            formattedStartTime,
            formattedEndTime
        );

        if (availableSlots.length === 0) {
            return res.status(404).json(baseResponse.error("No available parking slots found at this location"));
        }

        return res.status(200).json(baseResponse.success(
            `Available parking slots at location "${location}" fetched successfully`,
            availableSlots
        ));
    } catch (error) {
        console.error("Error fetching available parking slots by location", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getBookingsBySlotId = async (req, res) => {
    const { id } = req.params;

    try {
        // First check if the slot exists
        const parkingSlot = await parkingSlotRepo.getParkingSlotById(id);
        if (!parkingSlot) {
            return res.status(404).json(baseResponse.error("Parking slot not found"));
        }

        // Check if the slot is currently occupied
        const occupiedSlotIds = await bookingRepo.getOccupiedSlotIds();
        const slotWithOccupancy = {
            ...parkingSlot,
            is_occupied: occupiedSlotIds.includes(parseInt(id))
        };

        // Get all bookings for this slot
        const bookings = await bookingRepo.getBookingsBySlotId(id);

        // Sanitize booking data to remove sensitive information
        const sanitizedBookings = bookings.map(b => ({
            id: b.id,
            start_time: b.start_time,
            end_time: b.end_time,
            status: b.status,
            is_paid: b.is_paid,
            price: b.price,
            created_at: b.created_at,
        }));

        return res.status(200).json(baseResponse.success(
            `Bookings for parking slot #${id} fetched successfully`,
            {
                parking_slot: slotWithOccupancy,
                bookings: sanitizedBookings
            }
        ));
    } catch (error) {
        console.error(`Error fetching bookings for slot ID ${id}:`, error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}