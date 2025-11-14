import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../App";
import { login } from "../services/auth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form.email, form.password);

      if (result.success) {
        setUser(result.user);
        navigate("/calendar");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", backgroundColor: "#2d2d2d", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
      <h2 style={{ color: "#ffffff", textAlign: "center", marginBottom: "30px" }}>Login</h2>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ marginBottom: "20px", backgroundColor: "#4a1f1f", border: "1px solid #6b2929", color: "#ff8888" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={loading}
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #404040",
              color: "#ffffff",
              padding: "10px"
            }}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #404040",
              color: "#ffffff",
              padding: "10px"
            }}
          />
        </div>

        <style>{`
          .form-control::placeholder {
            color: #888888 !important;
            opacity: 1;
          }
        `}</style>

        <button
          type="submit"
          className="btn w-100"
          disabled={loading}
          style={{ backgroundColor: "#ffd700", color: "#1a1a1a", border: "none", padding: "10px", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600" }}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
                style={{ borderColor: "#1a1a1a", borderRightColor: "transparent" }}
              ></span>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p style={{ color: "#b0b0b0" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#ffd700", textDecoration: "none" }}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
