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
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h2>Sign Up</h2>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ marginBottom: "20px" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="John Doe"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="john@example.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Company</label>
          <input
            type="text"
            className="form-control"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="TechCorp"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <input
            type="text"
            className="form-control"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Software Engineer"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="At least 6 characters"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Re-enter your password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#007bff" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
