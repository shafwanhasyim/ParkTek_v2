import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

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

    if (!formData.name) {
      tempErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError("");

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Extract only the needed fields for registration
        const { name, email, password } = formData;
        const registrationData = { name, email, password };

        const result = await register(registrationData);
        if (result.success) {
          // Auto-login after registration
          const loginResult = await login(email, password);
          if (loginResult.success) {
            navigate("/profile");
          } else {
            navigate("/login");
          }
        } else {
          setRegistrationError(
            result.message || "Registration failed. Please try again."
          );
        }
      } catch (error) {
        setRegistrationError("An unexpected error occurred. Please try again.");
        console.error("Registration error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-12 w-auto"
            src="/OnlyLogo.png"
            alt="ParkEase Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            {registrationError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {registrationError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                error={errors.name}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                error={errors.email}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
