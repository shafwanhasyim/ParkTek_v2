import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loading from "../components/Loading";
import api from "../api/axios";

const ParkingSlotPage = () => {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    availability: "all",
  });

  useEffect(() => {
    fetchParkingSlots();
  }, []);
  const fetchParkingSlots = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/slots");

      if (response.data && response.data.data) {
        setSlots(response.data.data);
      } else {
        setError("Failed to load parking slots data");
      }
    } catch (error) {
      console.error("Error fetching parking slots:", error);
      setError("An error occurred while fetching parking slots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  const filteredSlots = slots.filter((slot) => {
    // Filter by location
    if (
      filters.location &&
      !slot.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Filter by type
    if (filters.type && slot.type !== filters.type) {
      return false;
    }
    
    // Filter by availability
    if (filters.availability === "available" && (!slot.is_active || slot.is_occupied)) {
      return false;
    }
    if (filters.availability === "occupied" && (slot.is_active && !slot.is_occupied)) {
      return false;
    }

    return true;
  });

  // Group slots by location for better organization
  const slotsByLocation = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.location]) {
      acc[slot.location] = [];
    }
    acc[slot.location].push(slot);
    return acc;
  }, {});

  // Get unique locations and types for filters
  const locations = [...new Set(slots.map((slot) => slot.location))];
  const types = [...new Set(slots.map((slot) => slot.type))];

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
        <h1 className="text-3xl font-bold mb-6">Parking Slots</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}        <div className="mb-6">
          <Card>
            <h2 className="text-xl font-semibold mb-3">Parking Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">
                  {slots.filter(s => s.is_active && !s.is_occupied).length}
                </p>
                <p className="text-sm text-green-500">Available</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-700">
                  {slots.length - slots.filter(s => s.is_active && !s.is_occupied).length}
                </p>
                <p className="text-sm text-yellow-500">Occupied</p>
              </div>
            </div>
          </Card>
        </div>
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Location
              </label>
              <select
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Type
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="availability"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Availability
              </label>{" "}              <select
                id="availability"
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
          </div>
        </Card>{" "}        <div className="mb-4">
          <p className="text-lg">
            {filteredSlots.length} slots found •{" "}
            {filteredSlots.filter((s) => s.is_active && !s.is_occupied).length}{" "}
            available • {filteredSlots.length - filteredSlots.filter((s) => s.is_active && !s.is_occupied).length} occupied
          </p>
        </div>
        {Object.keys(slotsByLocation).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No parking slots matching your criteria
            </p>
          </div>
        ) : (
          Object.entries(slotsByLocation).map(([location, slots]) => (
            <div key={location} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{location}</h2>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot) => (                  <Card
                    key={slot.id}
                    className={`${
                      slot.is_active && !slot.is_occupied
                        ? "border-green-500 border-l-4"
                        : "border-yellow-500 border-l-4"
                    } hover:shadow-lg transition-shadow duration-200`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">Slot #{slot.id}</h3>                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          slot.is_active && !slot.is_occupied
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {slot.is_active && !slot.is_occupied
                          ? "Available"
                          : "Occupied"}
                      </span>
                    </div>                    <div
                      className={`mb-3 p-2 ${
                        slot.is_active && !slot.is_occupied
                          ? "bg-green-50"
                          : "bg-yellow-50"
                      } rounded-lg`}
                    >
                      <p className="mb-1">
                        <span className="font-medium">Type:</span> {slot.type}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {slot.is_active && !slot.is_occupied
                          ? "Ready for booking"
                          : "Currently unavailable"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {slot.is_active && !slot.is_occupied && (
                        <Link
                          to="/booking"
                          state={{
                            preselectedLocation: location,
                            preselectedType: slot.type,
                          }}
                        >
                          <Button variant="primary">Book This Slot</Button>
                        </Link>
                      )}

                      <Link to={`/slots/${slot.id}/bookings`}>
                        <Button variant="outline">View Bookings</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ParkingSlotPage;
