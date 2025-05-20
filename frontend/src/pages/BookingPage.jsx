import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Loading from "../components/Loading";
import api from "../api/axios";

const BookingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: "",
    type: "",
    start_time: "",
    end_time: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Get current date and time for form defaults
  useEffect(() => {
    const now = new Date();

    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    const formatDateTime = (date) => {
      return date.toISOString().slice(0, 16);
    };

    // Set default start time to now
    const startTime = formatDateTime(now);

    // Set default end time to 2 hours from now
    const endTime = formatDateTime(
      new Date(now.getTime() + 2 * 60 * 60 * 1000)
    );

    setFormData({
      ...formData,
      start_time: startTime,
      end_time: endTime,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.location) {
      tempErrors.location = "Location is required";
      isValid = false;
    }

    if (!formData.start_time) {
      tempErrors.start_time = "Start time is required";
      isValid = false;
    }

    if (!formData.end_time) {
      tempErrors.end_time = "End time is required";
      isValid = false;
    } else if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      tempErrors.end_time = "End time must be after start time";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setBookingSuccess(false);

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await api.post(
          "/bookings/create-by-location",
          formData
        );
        if (response.data && response.data.success && response.data.data) {
          setBookingData(response.data.data);
          setBookingSuccess(true);
        } else {
          setErrorMessage(response.data.message || "Failed to create booking");
        }
      } catch (error) {
        console.error("Booking error:", error);
        setErrorMessage(
          error.response?.data?.message ||
            "An error occurred while creating your booking"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handlePayment = async (bookingId) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/bookings/pay/${bookingId}`);
      if (response.data && response.data.success && response.data.data) {
        setBookingData({
          ...bookingData,
          ...response.data.data,
          status: "booked",
          is_paid: true,
        });
        alert("Payment successful!");
      } else {
        setErrorMessage(response.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage(
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
        setBookingData({
          ...bookingData,
          ...response.data.data,
          status: "cancelled",
        });
        alert("Booking cancelled successfully!");
      } else {
        setErrorMessage(response.data.message || "Cancellation failed");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      setErrorMessage(
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
        setBookingData({
          ...bookingData,
          ...response.data.data,
          status: "completed",
        });
        alert("Booking completed successfully!");
      } else {
        setErrorMessage(response.data.message || "Completion failed");
      }
    } catch (error) {
      console.error("Completion error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred while completing your booking"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold mb-6">Book a Parking Slot</h1>

        {bookingSuccess ? (
          <div className="max-w-lg mx-auto">
            <Card title="Booking Successful!">
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Booking ID: {bookingData.id}</p>
                  <p>
                    Status:{" "}
                    <span className="capitalize">{bookingData.status}</span>
                  </p>
                  <p>
                    Location:{" "}
                    {bookingData.parking_slot?.location || "Unknown location"}
                  </p>
                  <p>Slot: {bookingData.slot_id}</p>
                  <p>
                    Start: {new Date(bookingData.start_time).toLocaleString()}
                  </p>
                  <p>End: {new Date(bookingData.end_time).toLocaleString()}</p>
                  <p className="font-medium mt-2">
                    Price: ${bookingData.price}
                  </p>
                </div>
                {bookingData.qr_code_url && (
                  <div className="flex flex-col items-center my-4">
                    <p className="mb-2 font-medium">Your QR Code:</p>
                    <img
                      src={bookingData.qr_code_url}
                      alt="Booking QR Code"
                      className="h-48 w-48 object-contain"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Scan this QR code when you arrive at the parking lot
                    </p>
                  </div>
                )}{" "}
                <div className="flex justify-center space-x-4 mt-4">
                  {!bookingData.is_paid && bookingData.status === "pending" && (
                    <Button
                      onClick={() => handlePayment(bookingData.id)}
                      variant="success"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Pay Now"}
                    </Button>
                  )}

                  {(bookingData.status === "pending" ||
                    bookingData.status === "booked") && (
                    <Button
                      onClick={() => handleCancel(bookingData.id)}
                      variant="danger"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Cancel"}
                    </Button>
                  )}

                  {bookingData.is_paid && bookingData.status === "booked" && (
                    <Button
                      onClick={() => handleComplete(bookingData.id)}
                      variant="primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Complete"}
                    </Button>
                  )}
                </div>{" "}
                <div className="flex flex-col md:flex-row justify-center gap-3 mt-4">
                  <Button
                    onClick={() => {
                      setBookingSuccess(false);
                      setBookingData(null);
                      setFormData({
                        location: "",
                        type: "",
                        start_time: "",
                        end_time: "",
                      });
                    }}
                    variant="outline"
                  >
                    Book Another Slot
                  </Button>

                  {bookingData.slot_id && (
                    <Link to={`/slots/${bookingData.slot_id}/bookings`}>
                      <Button variant="outline">View All Slot Bookings</Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            <Card title="Book a Parking Slot">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter parking location"
                  required
                  error={errors.location}
                />

                <div className="mb-4">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="car">Car</option>
                    <option value="motor">Motor</option>
                  </select>
                </div>

                <Input
                  label="Start Time"
                  name="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  error={errors.start_time}
                />

                <Input
                  label="End Time"
                  name="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  error={errors.end_time}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Searching for Slots..." : "Book Parking"}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingPage;
