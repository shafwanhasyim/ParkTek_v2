import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <div className="bg-blue-50 min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Welcome to</span>
                <span className="block text-blue-600">Parktek</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg">
                The easiest way to find and book parking spots in your area.
                Save time and avoid the hassle of finding parking with our
                simple booking system.
              </p>
              <div className="mt-8 sm:flex">
                {isAuthenticated ? (
                  <div className="rounded-md shadow">
                    <Link to="/booking">
                      <Button variant="primary" className="w-full px-8 py-3">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md shadow">
                      <Link to="/login">
                        <Button variant="primary" className="w-full px-8 py-3">
                          Login
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link to="/register">
                        <Button variant="outline" className="w-full px-8 py-3">
                          Register
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
              <img
                className="h-64 w-auto"
                src="/Logo_Name_White.png"
                alt="Parktek Logo"
              />
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose Parktek?
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-blue-600 mb-3">
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Save Time</h3>
                <p className="mt-2 text-gray-500">
                  Book your spot in advance and avoid driving around looking for
                  parking.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-blue-600 mb-3">
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 14a1 1 0 01-1 1H5a1 1 0 01-1-1V7h12v9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Seamless Booking
                </h3>
                <p className="mt-2 text-gray-500">
                  Easy booking process with instant confirmation and QR code
                  access.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-blue-600 mb-3">
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Secure Parking
                </h3>
                <p className="mt-2 text-gray-500">
                  All parking slots are monitored and secure for your peace of
                  mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
