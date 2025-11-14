import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../App";
import { signUp } from "../services/auth";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(
        form.email,
        form.password,
        form.name,
        form.company,
        form.role
      );

      if (result.success) {
        setUser(result.user);
        navigate("/calendar");
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Signup page error:", err);
      setError(`An unexpected error occurred: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "30px", backgroundColor: "#2d2d2d", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
      <h2 style={{ color: "#ffffff", textAlign: "center", marginBottom: "30px" }}>Sign Up</h2>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ marginBottom: "20px", backgroundColor: "#4a1f1f", border: "1px solid #6b2929", color: "#ff8888" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label" style={{ color: "#b0b0b0" }}>Full Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="John Doe"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #404040", color: "#ffffff", padding: "10px" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ color: "#b0b0b0" }}>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="john@example.com"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #404040", color: "#ffffff", padding: "10px" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ color: "#b0b0b0" }}>Company</label>
          <input
            type="text"
            className="form-control"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="TechCorp"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #404040", color: "#ffffff", padding: "10px" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ color: "#b0b0b0" }}>Role</label>
          <input
            type="text"
            className="form-control"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Software Engineer"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #404040", color: "#ffffff", padding: "10px" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ color: "#b0b0b0" }}>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="At least 6 characters"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #404040", color: "#ffffff", padding: "10px" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ color: "#b0b0b0" }}>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Re-enter your password"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #404040", color: "#ffffff", padding: "10px" }}
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
              Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p style={{ color: "#b0b0b0" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#ffd700", textDecoration: "none" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
