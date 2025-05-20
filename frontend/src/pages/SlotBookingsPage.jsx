import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Loading from "../components/Loading";
import Button from "../components/Button";
import api from "../api/axios";

const SlotBookingsPage = () => {
  const { id } = useParams();
  const [slotData, setSlotData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSlotBookings();
  }, [id]);
  const fetchSlotBookings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/slots/${id}/bookings`);

      if (response.data && response.data.data && response.data.data.bookings) {
        setSlotData(response.data.data.parking_slot);
        setBookings(response.data.data.bookings);
      } else {
        setError("Failed to load slot booking data");
      }
    } catch (error) {
      console.error("Error fetching slot bookings:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while fetching the slot bookings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      booked: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Bookings for Slot #{id}</h1>
          <Link to="/slots">
            <Button variant="outline">Back to Slots</Button>
          </Link>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}{" "}
        {slotData ? (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Slot Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {slotData.location}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {slotData.type}
                </p>
              </div>
              <div>
                {" "}
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      !slotData.is_active
                        ? "bg-red-100 text-red-800"
                        : slotData.is_occupied
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {!slotData.is_active
                      ? "Inactive"
                      : slotData.is_occupied
                      ? "Occupied"
                      : "Available"}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        ) : (
          !error &&
          !isLoading && (
            <Card className="mb-6 p-4 bg-yellow-50 border border-yellow-100">
              <p className="text-yellow-700">Slot information not available</p>
            </Card>
          )
        )}{" "}
        <h2 className="text-2xl font-semibold mb-4">Booking Timeline</h2>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : !Array.isArray(bookings) ? (
          <div className="text-center py-8">
            <p className="text-red-500">Invalid booking data received</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No bookings found for this parking slot
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className={`
                ${
                  booking.status === "cancelled"
                    ? "border-gray-300"
                    : booking.status === "completed"
                    ? "border-blue-300"
                    : booking.status === "booked"
                    ? "border-green-500"
                    : "border-yellow-500"
                } 
                border-l-4
              `}
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Booking #{booking.id}</h3>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <span className="text-sm text-gray-600">Start:</span>{" "}
                      {formatDate(booking.start_time)}
                    </p>
                    <p>
                      <span className="text-sm text-gray-600">End:</span>{" "}
                      {formatDate(booking.end_time)}
                    </p>
                  </div>
                  <div>
                    {" "}
                    <p>
                      <span className="text-sm text-gray-600">Price:</span> $
                      {booking.price || 0}
                      {booking.is_paid && (
                        <span className="ml-2 text-xs text-green-600">
                          Paid
                        </span>
                      )}
                    </p>
                    {booking.created_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Booked on:{" "}
                        {new Date(booking.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SlotBookingsPage;
