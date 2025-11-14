import React from "react";
import { format } from "date-fns";

export default function ConflictResolutionModal({
  show,
  onClose,
  onAcceptReschedule,
  onCancel,
  conflictInfo,
  suggestedSlot
}) {
  if (!show || !conflictInfo || !suggestedSlot) return null;

  const {
    shouldRescheduleNew,
    meetingToReschedule,
    higherPriorityMeeting,
    newMeetingProb,
    higherPriorityProb
  } = conflictInfo;

  const formatDateTime = (date) => {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

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
              backgroundColor: "#8b0000"
            }}
          >
            <h5 style={{ margin: 0, color: "#ffffff" }}>
              ⚠️ Meeting Time Conflict Detected
            </h5>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "20px" }}>
            <p style={{ marginBottom: "20px", fontSize: "1.05em", color: "#ffffff" }}>
              This meeting overlaps with an existing meeting. Based on attendance probabilities,
              we recommend rescheduling {shouldRescheduleNew ? "the new meeting" : "the existing meeting"}.
            </p>

            {/* Conflict Details */}
            <div
              style={{
                backgroundColor: "#1a1a1a",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px",
                border: "1px solid #404040"
              }}
            >
              <h6 style={{ marginTop: 0, color: "#ffffff" }}>Conflicting Meetings:</h6>

              <div style={{ marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: shouldRescheduleNew ? "#ff6b6b" : "#4ade80" }}>
                    {shouldRescheduleNew ? "New Meeting" : "Higher Priority Meeting"}
                  </strong>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.85em",
                      fontWeight: "bold",
                      backgroundColor: shouldRescheduleNew ? "#8b0000" : "#166534",
                      color: "#ffffff"
                    }}
                  >
                    {Math.round(newMeetingProb * 100)}% probability
                  </span>
                </div>
                <div style={{ marginTop: "5px", fontSize: "0.95em", color: "#ffffff" }}>
                  {meetingToReschedule.title || meetingToReschedule.agenda || "Untitled Meeting"}
                </div>
                <div style={{ fontSize: "0.9em", color: "#b0b0b0", marginTop: "3px" }}>
                  {formatDateTime(meetingToReschedule.start || meetingToReschedule.start_time)} - {formatTime(meetingToReschedule.end || meetingToReschedule.end_time)}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: shouldRescheduleNew ? "#4ade80" : "#ff6b6b" }}>
                    {shouldRescheduleNew ? "Existing Meeting (Higher Priority)" : "Existing Meeting"}
                  </strong>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.85em",
                      fontWeight: "bold",
                      backgroundColor: shouldRescheduleNew ? "#166534" : "#8b0000",
                      color: "#ffffff"
                    }}
                  >
                    {Math.round(higherPriorityProb * 100)}% probability
                  </span>
                </div>
                <div style={{ marginTop: "5px", fontSize: "0.95em", color: "#ffffff" }}>
                  {higherPriorityMeeting.title || higherPriorityMeeting.agenda || "Untitled Meeting"}
                </div>
                <div style={{ fontSize: "0.9em", color: "#b0b0b0", marginTop: "3px" }}>
                  {formatDateTime(higherPriorityMeeting.start || higherPriorityMeeting.start_time)} - {formatTime(higherPriorityMeeting.end || higherPriorityMeeting.end_time)}
                </div>
              </div>
            </div>

            {/* Suggested Reschedule */}
            <div
              style={{
                backgroundColor: "#1a4d2e",
                border: "1px solid #166534",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "10px"
              }}
            >
              <h6 style={{ marginTop: 0, color: "#4ade80" }}>
                💡 Suggested Reschedule:
              </h6>
              <div style={{ fontSize: "1.05em", color: "#ffffff" }}>
                <strong>
                  {formatDateTime(suggestedSlot.start)} - {formatTime(suggestedSlot.end)}
                </strong>
              </div>
              <div style={{ fontSize: "0.9em", color: "#b0b0b0", marginTop: "8px" }}>
                This is the next available time slot that works for all participants.
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
                backgroundColor: "transparent",
                color: "#b0b0b0",
                border: "1px solid #404040",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAcceptReschedule}
              style={{
                backgroundColor: "#4ade80",
                color: "#1a1a1a",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Accept & Reschedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
