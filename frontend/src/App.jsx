import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import ParkingSlotPage from "./pages/ParkingSlotPage";
import SlotBookingsPage from "./pages/SlotBookingsPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/slots" element={<ParkingSlotPage />} />
            <Route path="/slots/:id/bookings" element={<SlotBookingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
