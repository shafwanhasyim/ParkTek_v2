import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BookingCard from "../components/BookingCard";
import Loading from "../components/Loading";
import Card from "../components/Card";
import api from "../api/axios";

const HistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookingHistory();
  }, []);
  const fetchBookingHistory = async () => {
    setIsLoading(true);
    try {
      // Get user bookings - using the user ID from auth/me or just get all user bookings
      const response = await api.get("/bookings/user");

      if (response.data && response.data.data) {
        // Sort bookings by start_time in descending order (newest first)
        const sortedBookings = response.data.data.sort(
          (a, b) => new Date(b.start_time) - new Date(a.start_time)
        );
        setBookings(sortedBookings);
      } else {
        setError("Failed to load booking history");
      }
    } catch (error) {
      console.error("Error fetching booking history:", error);
      setError("An error occurred while fetching your booking history");
    } finally {
      setIsLoading(false);
    }
  };
  const handlePayment = async (bookingId) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/bookings/pay/${bookingId}`);

      if (response.data && response.data.success && response.data.data) {
        // Update the booking in the list
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status: "booked",
                  is_paid: true,
                  ...response.data.data,
                }
              : booking
          )
        );
        alert("Payment successful!");
      } else {
        alert(response.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(
        error.response?.data?.message || "An error occurred during payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/bookings/cancel/${bookingId}`);
      if (response.data && response.data.success && response.data.data) {
        // Update the booking in the list
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "cancelled", ...response.data.data }
              : booking
          )
        );
        alert("Booking cancelled successfully!");
      } else {
        alert(response.data.message || "Cancellation failed");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while cancelling your booking"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (bookingId) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/bookings/complete/${bookingId}`);
      if (response.data && response.data.success && response.data.data) {
        // Update the booking in the list
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "completed", ...response.data.data }
              : booking
          )
        );
        alert("Booking completed successfully!");
      } else {
        alert(response.data.message || "Completion failed");
      }
    } catch (error) {
      console.error("Completion error:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while completing your booking"
      );
    } finally {
      setIsLoading(false);
    }
  };  const filteredBookings = bookings.filter((booking) => {
    // Status filter only
    if (filter !== "all" && booking.status !== filter) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {" "}
        <h1 className="text-3xl font-bold mb-6">Booking History</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Booking Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-700">
                {bookings.length}
              </p>
              <p className="text-sm text-gray-500">Total Bookings</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {bookings.filter((b) => b.status === "pending").length}
              </p>
              <p className="text-sm text-yellow-500">Pending</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">
                {bookings.filter((b) => b.status === "booked").length}
              </p>
              <p className="text-sm text-blue-500">Booked</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">
                {bookings.filter((b) => b.status === "completed").length}
              </p>
              <p className="text-sm text-green-500">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="mb-6">          <div className="mb-3">
            <h3 className="text-lg font-medium mb-2">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                All Statuses
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("booked")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === "booked"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Booked
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === "completed"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter("cancelled")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === "cancelled"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </Card>{" "}        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">
            <span className="font-medium">{filteredBookings.length}</span>{" "}
            {filteredBookings.length === 1 ? "booking" : "bookings"} found
          </p>

          {filteredBookings.length > 0 && filter !== "all" && (
            <p className="text-sm text-gray-500">
              Showing {filter} bookings
            </p>
          )}
        </div>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings match your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPay={handlePayment}
                onCancel={handleCancel}
                onComplete={handleComplete}
                showPayButton={booking.status === "pending" && !booking.is_paid}
                showCancelButton={
                  booking.status === "pending" || booking.status === "booked"
                }
                showCompleteButton={
                  booking.status === "booked" && booking.is_paid
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryPage;
