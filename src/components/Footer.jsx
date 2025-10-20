import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "10px",
        background: "#f1f1f1",
        fontSize: "14px",
        color: "#555",
      }}
    >
      © {new Date().getFullYear()} AutoMeet — All rights reserved.
    </footer>
  );
}
