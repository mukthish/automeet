import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.email && form.password) {
      setIsLoggedIn(true);
      navigate("/calendar");
    } else {
      alert("Please fill all fields");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{
            display: "block",
            width: "100%",
            margin: "10px 0",
            padding: "8px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{
            display: "block",
            width: "100%",
            margin: "10px 0",
            padding: "8px",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "5px",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
