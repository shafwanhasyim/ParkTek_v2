const db = require("../database/pg.database");

exports.getAllBookings = async () => {
    try {
        const result = await db.query("SELECT * FROM bookings");
        return result.rows;
    } catch (error) {
        console.error("Error fetching bookings", error);
        throw error;
    }
}

exports.getBookingById = async (id) => {
    try {
        const result = await db.query("SELECT * FROM bookings WHERE id = $1", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching booking by ID", error);
        throw error;
    }
}

exports.getBookingByUserId = async (user_id) => {
    try {
        const result = await db.query("SELECT * FROM bookings WHERE user_id = $1", [user_id]);
        return result.rows;
    } catch (error) {
        console.error("Error fetching booking by user ID", error);
        throw error;
    }
}

exports.createBooking = async (user_id, parking_slot_id, start_time, end_time, price) => {
    const status = 'pending';
    try {
        const result = await db.query(
            "INSERT INTO bookings (user_id, slot_id, start_time, end_time, status, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [user_id, parking_slot_id, start_time, end_time, status, price]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error creating booking", error);
        throw error;
    }
}

exports.deleteBooking = async (id) => {
    try {
        const result = await db.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting booking", error);
        throw error;
    }
}

exports.updateBooking = async (id, booking) => {
    const { user_id, parking_slot_id, start_time, end_time, status } = booking;
    try {
        const result = await db.query(
            "UPDATE bookings SET user_id = $1, parking_slot_id = $2, start_time = $3, end_time = $4, status = $5 WHERE id = $6 RETURNING *",
            [user_id, parking_slot_id, start_time, end_time, status, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating booking", error);
        throw error;
    }
}

exports.cancelBooking = async (id) => {
    try {
        const result = await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error cancelling booking", error);
        throw error;
    }
}

exports.payBooking = async (id) => {
    try {
        const result = await db.query(
            "UPDATE bookings SET paid_at = NOW(), is_paid = true, status = 'booked' WHERE id = $1 RETURNING *",
            [id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error paying booking", error);
        throw error;
    }
}

exports.getOverlappingBookings = async (parking_slot_id, start_time, end_time) => {
    try {
        const result = await db.query(
            "SELECT * FROM bookings WHERE slot_id = $1 AND status IN ('pending', 'booked') AND ((start_time <= $2 AND end_time >= $2) OR (start_time <= $3 AND end_time >= $3) OR (start_time >= $2 AND end_time <= $3))",
            [parking_slot_id, start_time, end_time]
        );
        return result.rows;
    } catch (error) {
        console.error("Error fetching overlapping bookings", error);
        throw error;
    }
}

exports.completeBooking = async (id) => {
    try {
        const result = await db.query("UPDATE bookings SET status = 'completed' WHERE id = $1 RETURNING *", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error completing booking", error);
        throw error;
    }
}

exports.createBookingByLocation = async (user_id, location, type, start_time, end_time) => {
    try {
        // Get available slots at the location for the time period
        let query = "SELECT * FROM parking_slots WHERE location ILIKE $1";
        const queryParams = [`%${location}%`];
        if (type) {
            query += " AND type = $2";
            queryParams.push(type);
        }
        query += " AND is_active = true";
        const result = await db.query(query, queryParams);
        const availableSlots = result.rows;
        if (availableSlots.length === 0) {
            return { success: false, message: `No available parking slots found at location "${location}"` };
        }
        // Check each slot for availability during the requested time
        let selectedSlot = null;
        for (const slot of availableSlots) {
            const overlappingBookingsResult = await db.query(
                "SELECT * FROM bookings WHERE slot_id = $1 AND status != 'cancelled' AND ((start_time <= $2 AND end_time > $2) OR (start_time < $3 AND end_time >= $3) OR (start_time >= $2 AND end_time <= $3))",
                [slot.id, start_time, end_time]
            );
            if (overlappingBookingsResult.rows.length === 0) {
                selectedSlot = slot;
                break;
            }
        }
        if (!selectedSlot) {
            return { success: false, message: `All parking slots at location "${location}" are booked for the selected time` };
        }
        // Create the booking with the selected slot
        const status = 'pending';
        const bookingResult = await db.query(
            "INSERT INTO bookings (user_id, slot_id, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user_id, selectedSlot.id, start_time, end_time, status]
        );
        return {
            success: true,
            booking: bookingResult.rows[0],
            parking_slot: selectedSlot
        };
    } catch (error) {
        console.error("Error creating booking by location", error);
        throw error;
    }
}

// For creating a booking with a price
exports.createBookingWithPrice = async (user_id, slot_id, start_time, end_time, status, price) => {
    try {
        const result = await db.query(
            "INSERT INTO bookings (user_id, slot_id, start_time, end_time, status, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [user_id, slot_id, start_time, end_time, status, price]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error creating booking", error);
        throw error;
    }
}

// To update a parking slot's active status
exports.updateSlotActiveStatus = async (slot_id, is_active) => {
    try {
        const result = await db.query(
            "UPDATE parking_slots SET is_active = $1 WHERE id = $2 RETURNING *",
            [is_active, slot_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating parking slot active status", error);
        throw error;
    }
}

// To update the QR code URL for a booking
exports.updateQRUrl = async (bookingId, qrCodeUrl) => {
    try {
        const result = await db.query(
            "UPDATE bookings SET qr_code_url = $1 WHERE id = $2 RETURNING *",
            [qrCodeUrl, bookingId]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating booking QR code URL", error);
        throw error;
    }
}

// To get bookings for a specific parking slot
exports.getBookingsBySlotId = async (slot_id) => {
    try {
        const result = await db.query(
            "SELECT * FROM bookings WHERE slot_id = $1 ORDER BY start_time",
            [slot_id]
        );
        return result.rows;
    } catch (error) {
        console.error("Error fetching bookings by slot ID", error);
        throw error;
    }
}

// To get IDs of slots that are currently occupied
exports.getOccupiedSlotIds = async (currentTimestamp = new Date()) => {
    try {
        const formattedTimestamp = currentTimestamp instanceof Date
            ? currentTimestamp.toISOString()
            : new Date(currentTimestamp).toISOString();

        // Get all slots that have active bookings (pending or booked) where current time is 
        // between start and end time
        const result = await db.query(
            `SELECT DISTINCT slot_id FROM bookings 
             WHERE status IN ('pending', 'booked') 
             AND $1 BETWEEN start_time AND end_time`,
            [formattedTimestamp]
        );

        return result.rows.map(row => row.slot_id);
    } catch (error) {
        console.error("Error fetching occupied slot IDs", error);
        throw error;
    }
}