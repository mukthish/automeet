import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import logo from "../assets/logo.png";

export default function Header() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        background: "#007bff",
        color: "white",
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <img src={logo} alt="AutoMeet Logo" style={{ height: "40px" }} />
        <h2 style={{ marginLeft: "10px" }}>AutoMeet</h2>
      </div>

      <nav>
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              style={{
                color: "white",
                marginRight: "15px",
                textDecoration: "none",
              }}
            >
              Login
            </Link>
            <Link
              to="/login"
              style={{ color: "white", textDecoration: "none" }}
            >
              Signup
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid white",
              color: "white",
              padding: "6px 12px",
              borderRadius: "5px",
            }}
          >
            Sign Out
          </button>
        )}
      </nav>
    </header>
  );
}
