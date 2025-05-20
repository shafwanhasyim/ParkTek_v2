import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img className="h-8 w-auto" src="/OnlyLogo.png" alt="App Logo" />
            </Link>
            <div className="ml-4 text-xl font-bold text-white">ParkTek</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/booking"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Book Now
                </Link>
                <Link
                  to="/slots"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Parking Slots
                </Link>
                <Link
                  to="/history"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  History
                </Link>
                <Link
                  to="/profile"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/booking"
                  className="text-white block px-3 py-2 rounded-md hover:bg-blue-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Book Now
                </Link>
                <Link
                  to="/slots"
                  className="text-white block px-3 py-2 rounded-md hover:bg-blue-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Parking Slots
                </Link>
                <Link
                  to="/history"
                  className="text-white block px-3 py-2 rounded-md hover:bg-blue-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  History
                </Link>
                <Link
                  to="/profile"
                  className="text-white block px-3 py-2 rounded-md hover:bg-blue-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-white block w-full text-left px-3 py-2 rounded-md hover:bg-blue-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white block px-3 py-2 rounded-md hover:bg-blue-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white block px-3 py-2 rounded-md hover:bg-blue-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
