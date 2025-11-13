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
              ⚠️ Meeting Time Conflict Detected
            </h5>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "20px" }}>
            <p style={{ marginBottom: "20px", fontSize: "1.05em" }}>
              This meeting overlaps with an existing meeting. Based on attendance probabilities,
              we recommend rescheduling {shouldRescheduleNew ? "the new meeting" : "the existing meeting"}.
            </p>

            {/* Conflict Details */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px"
              }}
            >
              <h6 style={{ marginTop: 0 }}>Conflicting Meetings:</h6>

              <div style={{ marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: shouldRescheduleNew ? "#dc3545" : "#28a745" }}>
                    {shouldRescheduleNew ? "New Meeting" : "Higher Priority Meeting"}
                  </strong>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.85em",
                      fontWeight: "bold",
                      backgroundColor: shouldRescheduleNew ? "#f8d7da" : "#d4edda",
                      color: shouldRescheduleNew ? "#721c24" : "#155724"
                    }}
                  >
                    {Math.round(newMeetingProb * 100)}% probability
                  </span>
                </div>
                <div style={{ marginTop: "5px", fontSize: "0.95em" }}>
                  {meetingToReschedule.title || meetingToReschedule.agenda || "Untitled Meeting"}
                </div>
                <div style={{ fontSize: "0.9em", color: "#6c757d", marginTop: "3px" }}>
                  {formatDateTime(meetingToReschedule.start || meetingToReschedule.start_time)} - {formatTime(meetingToReschedule.end || meetingToReschedule.end_time)}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: shouldRescheduleNew ? "#28a745" : "#dc3545" }}>
                    {shouldRescheduleNew ? "Existing Meeting (Higher Priority)" : "Existing Meeting"}
                  </strong>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.85em",
                      fontWeight: "bold",
                      backgroundColor: shouldRescheduleNew ? "#d4edda" : "#f8d7da",
                      color: shouldRescheduleNew ? "#155724" : "#721c24"
                    }}
                  >
                    {Math.round(higherPriorityProb * 100)}% probability
                  </span>
                </div>
                <div style={{ marginTop: "5px", fontSize: "0.95em" }}>
                  {higherPriorityMeeting.title || higherPriorityMeeting.agenda || "Untitled Meeting"}
                </div>
                <div style={{ fontSize: "0.9em", color: "#6c757d", marginTop: "3px" }}>
                  {formatDateTime(higherPriorityMeeting.start || higherPriorityMeeting.start_time)} - {formatTime(higherPriorityMeeting.end || higherPriorityMeeting.end_time)}
                </div>
              </div>
            </div>

            {/* Suggested Reschedule */}
            <div
              style={{
                backgroundColor: "#d1ecf1",
                border: "1px solid #bee5eb",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "10px"
              }}
            >
              <h6 style={{ marginTop: 0, color: "#0c5460" }}>
                💡 Suggested Reschedule:
              </h6>
              <div style={{ fontSize: "1.05em" }}>
                <strong>
                  {formatDateTime(suggestedSlot.start)} - {formatTime(suggestedSlot.end)}
                </strong>
              </div>
              <div style={{ fontSize: "0.9em", color: "#0c5460", marginTop: "8px" }}>
                This is the next available time slot that works for all participants.
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
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAcceptReschedule}
            >
              Accept & Reschedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
