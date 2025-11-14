import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "10px",
        background: "#0d0d0d",
        fontSize: "14px",
        color: "#b0b0b0",
        borderTop: "2px solid #2d2d2d",
      }}
    >
      © {new Date().getFullYear()} AutoMeet — All rights reserved.
    </footer>
  );
}
