import React from "react";
import { format } from "date-fns";

export default function FatigueWarningModal({
  show,
  onClose,
  onProceed,
  onCancel,
  fatigueInfo
}) {
  if (!show || !fatigueInfo) return null;

  const {
    totalHoursToday,
    consecutiveMeetings,
    meetingsToday,
    reason
  } = fatigueInfo;

  const formatTime = (date) => {
    return format(new Date(date), "h:mm a");
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          zIndex: 1060,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
        onClick={onCancel}
      >
        {/* Modal Content */}
        <div
          style={{
            backgroundColor: "#2d2d2d",
            borderRadius: "8px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            border: "1px solid #404040"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #404040",
              backgroundColor: "#8b6914"
            }}
          >
            <h5 style={{ margin: 0, color: "#ffffff" }}>
              😴 Meeting Fatigue Warning
            </h5>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "20px" }}>
            <p style={{ marginBottom: "20px", fontSize: "1.05em", color: "#ffffff" }}>
              You might be scheduling too many meetings today. Consider taking a break to avoid burnout.
            </p>

            {/* Fatigue Statistics */}
            <div
              style={{
                backgroundColor: "#1a1a1a",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px",
                border: "1px solid #404040"
              }}
            >
              <h6 style={{ marginTop: 0, marginBottom: "15px", color: "#ffffff" }}>Today's Meeting Load:</h6>

              {reason === "total_hours" && (
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#ff6b6b" }}>⏰ Total Meeting Hours Today:</strong>
                    <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#ff6b6b" }}>
                      {totalHoursToday.toFixed(1)} hours
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9em", color: "#b0b0b0", marginTop: "5px" }}>
                    You've already scheduled 5 or more hours of meetings today.
                  </div>
                </div>
              )}

              {reason === "consecutive_meetings" && (
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#ff6b6b" }}>📅 Consecutive Meetings:</strong>
                    <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#ff6b6b" }}>
                      {consecutiveMeetings} meetings
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9em", color: "#b0b0b0", marginTop: "5px" }}>
                    You have 3 or more meetings scheduled back-to-back without breaks.
                  </div>
                </div>
              )}

              {reason === "both" && (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#ff6b6b" }}>⏰ Total Meeting Hours Today:</strong>
                      <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#ff6b6b" }}>
                        {totalHoursToday.toFixed(1)} hours
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#ff6b6b" }}>📅 Consecutive Meetings:</strong>
                      <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#ff6b6b" }}>
                        {consecutiveMeetings} meetings
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.9em", color: "#b0b0b0" }}>
                    You're overloaded with both long hours and consecutive meetings.
                  </div>
                </>
              )}

              {/* Today's Meetings List */}
              <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #404040" }}>
                <strong style={{ fontSize: "0.95em", color: "#ffffff" }}>
                  Today's Meetings ({meetingsToday.length}):
                </strong>
                <div style={{ marginTop: "10px", maxHeight: "150px", overflowY: "auto" }}>
                  {meetingsToday.map((meeting, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px",
                        marginBottom: "6px",
                        backgroundColor: "#2d2d2d",
                        borderRadius: "4px",
                        border: "1px solid #404040",
                        fontSize: "0.9em"
                      }}
                    >
                      <div style={{ fontWeight: "500", color: "#ffffff" }}>
                        {meeting.title || meeting.agenda || "Untitled Meeting"}
                      </div>
                      <div style={{ fontSize: "0.85em", color: "#b0b0b0" }}>
                        {formatTime(meeting.start)} - {formatTime(meeting.end)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warning Box */}
            <div
              style={{
                backgroundColor: "#4a1f1f",
                border: "1px solid #8b0000",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "10px"
              }}
            >
              <div style={{ fontSize: "0.95em", color: "#ff8888" }}>
                <strong>⚠️ Health Reminder:</strong> Too many meetings can lead to:
                <ul style={{ marginTop: "8px", marginBottom: "0", paddingLeft: "20px" }}>
                  <li>Decreased productivity and focus</li>
                  <li>Mental fatigue and burnout</li>
                  <li>Less time for deep work and breaks</li>
                </ul>
              </div>
            </div>

            {/* Info Box */}
            <div
              style={{
                backgroundColor: "#1a4d2e",
                border: "1px solid #166534",
                padding: "12px",
                borderRadius: "6px"
              }}
            >
              <div style={{ fontSize: "0.95em", color: "#4ade80" }}>
                <strong>💡 Suggestion:</strong> Consider rescheduling this meeting to another day or declining non-essential meetings to preserve your energy and well-being.
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: "20px",
              borderTop: "1px solid #404040",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              backgroundColor: "#1a1a1a"
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                backgroundColor: "#8b0000",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel Meeting
            </button>
            <button
              type="button"
              onClick={onProceed}
              style={{
                backgroundColor: "#ffd700",
                color: "#1a1a1a",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Schedule Anyway
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
