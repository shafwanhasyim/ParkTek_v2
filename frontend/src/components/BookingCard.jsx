import React, { useState, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";

const BookingCard = ({
  booking,
  onPay,
  onCancel,
  onComplete,
  showPayButton = false,
  showCancelButton = false,
  showCompleteButton = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    // Check if booking is active, upcoming, or past
    const updateTimeStatus = () => {
      const now = new Date();
      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);

      // Determine if booking is active, upcoming, or past
      const isActiveNow =
        now >= startTime &&
        now <= endTime &&
        ["pending", "booked"].includes(booking.status);
      const isUpcomingNow =
        now < startTime && ["pending", "booked"].includes(booking.status);
      const isPastNow =
        now > endTime || ["cancelled", "completed"].includes(booking.status);

      setIsActive(isActiveNow);
      setIsUpcoming(isUpcomingNow);
      setIsPast(isPastNow);

      // Calculate time remaining if active
      if (isActiveNow) {
        const timeLeft = endTime - now;
        setTimeRemaining(timeLeft);
      } else if (isUpcomingNow) {
        const timeUntilStart = startTime - now;
        setTimeRemaining(timeUntilStart);
      }
    };

    updateTimeStatus();
    const timer = setInterval(updateTimeStatus, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [booking]);

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

  const formatTimeRemaining = (ms) => {
    if (!ms) return "";

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
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
  return (
    <Card
      className={`mb-4 ${
        isActive
          ? "border-l-4 border-blue-500"
          : isUpcoming
          ? "border-l-4 border-purple-500"
          : ""
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex-grow">
          <div className="flex justify-between mb-2">
            <div>
              <h4 className="text-lg font-semibold">Booking #{booking.id}</h4>
              <p className="text-sm text-gray-600">Slot: {booking.slot_id}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {getStatusBadge(booking.status)}
              {!booking.is_paid && booking.status === "pending" && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                  Unpaid
                </span>
              )}
              {isActive && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Active
                </span>
              )}
              {isUpcoming && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Upcoming
                </span>
              )}
            </div>
          </div>

          <div className="mb-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Start:</span>{" "}
              {formatDate(booking.start_time)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">End:</span>{" "}
              {formatDate(booking.end_time)}
            </p>

            {isActive && timeRemaining && (
              <p className="text-sm font-medium text-blue-700 mt-1">
                Time remaining: {formatTimeRemaining(timeRemaining)}
              </p>
            )}

            {isUpcoming && timeRemaining && (
              <p className="text-sm font-medium text-purple-700 mt-1">
                Starts in: {formatTimeRemaining(timeRemaining)}
              </p>
            )}
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">
              Price: ${booking.price || 0}
            </p>
            {booking.is_paid && (
              <p className="text-xs text-green-600">
                Paid on {formatDate(booking.paid_at)}
              </p>
            )}
            {!booking.is_paid && booking.status === "pending" && (
              <p className="text-xs text-red-600">Payment required</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {showPayButton &&
              !booking.is_paid &&
              booking.status === "pending" && (
                <Button onClick={() => onPay(booking.id)} variant="success">
                  Pay Now
                </Button>
              )}

            {showCancelButton &&
              (booking.status === "pending" || booking.status === "booked") && (
                <Button onClick={() => onCancel(booking.id)} variant="danger">
                  Cancel Booking
                </Button>
              )}

            {showCompleteButton &&
              booking.is_paid &&
              booking.status === "booked" && (
                <Button
                  onClick={() => onComplete(booking.id)}
                  variant="primary"
                >
                  Complete
                </Button>
              )}
          </div>
        </div>

        {booking.qr_code_url && (
          <div className="mt-4 md:mt-0 md:ml-4">
            <img
              src={booking.qr_code_url}
              alt="Booking QR Code"
              className="h-24 w-24 object-contain"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default BookingCard;
