import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

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
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (validateForm()) {
      setIsLoading(true);
      try {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate("/profile");
        } else {
          setLoginError(
            result.message || "Login failed. Please check your credentials."
          );
        }
      } catch (error) {
        setLoginError("An unexpected error occurred. Please try again.");
        console.error("Login error:", error);
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            {loginError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {loginError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                required
                error={errors.password}
              />

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember_me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
