import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";
import SignupPage from "./pages/SignupPage";
import { onAuthStateChange, getCurrentUser } from "./services/auth";

export const AuthContext = createContext();

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from backend
        // But only if we don't already have a user (to avoid refetching during signup)
        if (!user) {
          try {
            // Add a delay to allow signup/login to complete backend profile creation
            // This prevents race condition where Firebase auth completes before backend signup
            await new Promise(resolve => setTimeout(resolve, 1000));

            const result = await getCurrentUser();
            if (result.success) {
              setUser(result.user);
            } else {
              console.error("Failed to fetch user profile:", result.error);
              // Don't set user to null immediately - they might be in the middle of signing up
              // Just log the error and let signup/login handle setting the user
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      <BrowserRouter>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            backgroundColor: "#1a1a1a",
          }}
        >
          <Header />

          <main style={{ flex: 1, padding: "20px", backgroundColor: "#1a1a1a" }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
