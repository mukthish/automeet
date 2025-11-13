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
          backgroundColor: "rgba(0,0,0,0.6)",
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
            backgroundColor: "white",
            borderRadius: "8px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #dee2e6",
              backgroundColor: "#fff3cd"
            }}
          >
            <h5 style={{ margin: 0, color: "#856404" }}>
              😴 Meeting Fatigue Warning
            </h5>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "20px" }}>
            <p style={{ marginBottom: "20px", fontSize: "1.05em" }}>
              You might be scheduling too many meetings today. Consider taking a break to avoid burnout.
            </p>

            {/* Fatigue Statistics */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px"
              }}
            >
              <h6 style={{ marginTop: 0, marginBottom: "15px" }}>Today's Meeting Load:</h6>

              {reason === "total_hours" && (
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#dc3545" }}>⏰ Total Meeting Hours Today:</strong>
                    <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#dc3545" }}>
                      {totalHoursToday.toFixed(1)} hours
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9em", color: "#6c757d", marginTop: "5px" }}>
                    You've already scheduled 5 or more hours of meetings today.
                  </div>
                </div>
              )}

              {reason === "consecutive_meetings" && (
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#dc3545" }}>📅 Consecutive Meetings:</strong>
                    <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#dc3545" }}>
                      {consecutiveMeetings} meetings
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9em", color: "#6c757d", marginTop: "5px" }}>
                    You have 3 or more meetings scheduled back-to-back without breaks.
                  </div>
                </div>
              )}

              {reason === "both" && (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#dc3545" }}>⏰ Total Meeting Hours Today:</strong>
                      <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#dc3545" }}>
                        {totalHoursToday.toFixed(1)} hours
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#dc3545" }}>📅 Consecutive Meetings:</strong>
                      <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#dc3545" }}>
                        {consecutiveMeetings} meetings
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.9em", color: "#6c757d" }}>
                    You're overloaded with both long hours and consecutive meetings.
                  </div>
                </>
              )}

              {/* Today's Meetings List */}
              <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #dee2e6" }}>
                <strong style={{ fontSize: "0.95em", color: "#495057" }}>
                  Today's Meetings ({meetingsToday.length}):
                </strong>
                <div style={{ marginTop: "10px", maxHeight: "150px", overflowY: "auto" }}>
                  {meetingsToday.map((meeting, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px",
                        marginBottom: "6px",
                        backgroundColor: "white",
                        borderRadius: "4px",
                        border: "1px solid #dee2e6",
                        fontSize: "0.9em"
                      }}
                    >
                      <div style={{ fontWeight: "500", color: "#495057" }}>
                        {meeting.title || meeting.agenda || "Untitled Meeting"}
                      </div>
                      <div style={{ fontSize: "0.85em", color: "#6c757d" }}>
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
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "10px"
              }}
            >
              <div style={{ fontSize: "0.95em", color: "#721c24" }}>
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
                backgroundColor: "#d1ecf1",
                border: "1px solid #bee5eb",
                padding: "12px",
                borderRadius: "6px"
              }}
            >
              <div style={{ fontSize: "0.95em", color: "#0c5460" }}>
                <strong>💡 Suggestion:</strong> Consider rescheduling this meeting to another day or declining non-essential meetings to preserve your energy and well-being.
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: "20px",
              borderTop: "1px solid #dee2e6",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px"
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel Meeting
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={onProceed}
            >
              Schedule Anyway
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
