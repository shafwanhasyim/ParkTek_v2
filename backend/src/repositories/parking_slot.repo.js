const db = require("../database/pg.database");

exports.getAllParkingSlots = async () => {
    try {
        const result = await db.query("SELECT * FROM parking_slots");
        return result.rows;
    } catch (error) {
        console.error("Error fetching parking slots", error);
        throw error;
    }
}

exports.addParkingSlot = async (parkingSlot) => {
    const { location, type, is_active } = parkingSlot;
    try {
        const result = await db.query(
            "INSERT INTO parking_slots (location, type, is_active) VALUES ($1, $2, $3) RETURNING *",
            [location, type, is_active]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error adding parking slot", error);
        throw error;
    }
}

exports.updateParkingSlot = async (id, parkingSlot) => {
    const { location, type, is_active } = parkingSlot;
    try {
        const result = await db.query(
            "UPDATE parking_slots SET location = $1, type = $2, is_active = $3 WHERE id = $4 RETURNING *",
            [location, type, is_active, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating parking slot", error);
        throw error;
    }
}

exports.deleteParkingSlot = async (id) => {
    try {
        const result = await db.query("DELETE FROM parking_slots WHERE id = $1 RETURNING *", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting parking slot", error);
        throw error;
    }
}

exports.countAvailableParkingSlots = async () => {
    try {
        const result = await db.query("SELECT COUNT(*) FROM parking_slots WHERE is_active = true");
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        console.error("Error counting available parking slots", error);
        throw error;
    }
}

exports.getParkingSlotById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM parking_slots WHERE id = $1", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching parking slot by ID", error);
        throw error;
    }
}

exports.checkParkingSlotAvailability = async (id) => {
    try {
        const result = await db.query("SELECT is_active FROM parking_slots WHERE id = $1", [id]);
        return result.rows[0].is_active;
    } catch (error) {
        console.error("Error checking parking slot availability", error);
        throw error;
    }
}

exports.getParkingSlotsByType = async (type) => {
    try {
        const result = await db.query("SELECT * FROM parking_slots WHERE type = $1", [type]);
        return result.rows;
    } catch (error) {
        console.error("Error fetching parking slots by type", error);
        throw error;
    }
}

exports.getParkingSlotsByLocation = async (location) => {
    try {
        // Using ILIKE for case-insensitive search with wildcards
        const result = await db.query(
            "SELECT * FROM parking_slots WHERE location ILIKE $1",
            [`%${location}%`]
        );
        return result.rows;
    } catch (error) {
        console.error("Error fetching parking slots by location", error);
        throw error;
    }
}

exports.getAvailableParkingSlotsForTimeRange = async (start_time, end_time) => {
    try {
        // Get all active parking slots
        const activeSlots = await db.query(
            "SELECT * FROM parking_slots WHERE is_active = true"
        );

        // Get all bookings that overlap with the requested time period
        const overlappingBookings = await db.query(
            `SELECT * FROM bookings 
             WHERE status != 'cancelled' 
             AND ((start_time <= $1 AND end_time > $1) 
                  OR (start_time < $2 AND end_time >= $2) 
                  OR (start_time >= $1 AND end_time <= $2))`,
            [start_time, end_time]
        );

        // Get IDs of slots that are already booked
        const bookedSlotIds = [...new Set(overlappingBookings.rows.map(booking => booking.slot_id))];

        // Filter out the booked slots
        const availableSlots = activeSlots.rows.filter(slot => !bookedSlotIds.includes(slot.id));

        return availableSlots;
    } catch (error) {
        console.error("Error fetching available parking slots for time range", error);
        throw error;
    }
}

exports.getAvailableParkingSlotsByLocation = async (location, start_time, end_time) => {
    try {
        // First get all parking slots matching the location
        const parkingSlotsResult = await db.query(
            "SELECT * FROM parking_slots WHERE location ILIKE $1",
            [`%${location}%`]
        );

        const parkingSlotsInLocation = parkingSlotsResult.rows;
        if (parkingSlotsInLocation.length === 0) {
            return [];
        }

        // Get all slot IDs at this location
        const slotIds = parkingSlotsInLocation.map(slot => slot.id);

        // For each slot, check if there are bookings that overlap with the requested time
        const availableSlots = [];

        for (const slot of parkingSlotsInLocation) {
            if (!slot.is_active) continue; // Skip inactive slots

            const overlappingBookingsResult = await db.query(
                "SELECT * FROM bookings WHERE slot_id = $1 AND status != 'cancelled' AND ((start_time <= $2 AND end_time > $2) OR (start_time < $3 AND end_time >= $3) OR (start_time >= $2 AND end_time <= $3))",
                [slot.id, start_time, end_time]
            );

            if (overlappingBookingsResult.rows.length === 0) {
                availableSlots.push(slot);
            }
        }

        return availableSlots;
    } catch (error) {
        console.error("Error fetching available parking slots by location", error);
        throw error;
    }
}