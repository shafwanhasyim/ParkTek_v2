import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg mb-4">You are not logged in.</p>
          <Button onClick={() => navigate("/login")} variant="primary">
            Go to Login
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <div className="max-w-lg mx-auto">
          <Card>
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium mb-2">Account Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">User ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-medium">Member Since:</span>{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
                {user.phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {user.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/booking")}
              >
                Create New Booking
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate("/history")}
              >
                View Booking History
              </Button>

              <Button variant="outline" fullWidth>
                Edit Profile
              </Button>

              <Button variant="danger" fullWidth onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
