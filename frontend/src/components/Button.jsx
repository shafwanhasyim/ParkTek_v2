import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  fullWidth = false,
}) => {
  const baseClasses =
    "py-2 px-4 rounded font-medium focus:outline-none transition-colors duration-200";

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50",
    outline:
      "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
