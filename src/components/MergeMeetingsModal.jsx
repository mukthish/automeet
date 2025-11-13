import React from "react";
import { format } from "date-fns";

export default function MergeMeetingsModal({
  show,
  onClose,
  onAcceptMerge,
  onCancel,
  mergeInfo
}) {
  if (!show || !mergeInfo) return null;

  const {
    shouldKeepNew,
    meetingToKeep,
    meetingToDelete,
    newMeetingProb,
    existingMeetingProb
  } = mergeInfo;

  const formatDateTime = (date) => {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  const formatTime = (date) => {
    return format(new Date(date), "h:mm a");
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 0.7) return '#28a745'; // Green
    if (prob >= 0.4) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
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
              backgroundColor: "#d1ecf1"
            }}
          >
            <h5 style={{ margin: 0, color: "#0c5460" }}>
              🔄 Duplicate Meeting Detected
            </h5>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "20px" }}>
            <p style={{ marginBottom: "20px", fontSize: "1.05em" }}>
              A meeting with the same agenda and participants already exists.
              Would you like to merge these meetings and keep the one with higher attendance probability?
            </p>

            {/* Meeting Details */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px"
              }}
            >
              <h6 style={{ marginTop: 0 }}>Duplicate Meetings:</h6>

              {/* Meeting to Keep */}
              <div
                style={{
                  marginBottom: "15px",
                  padding: "12px",
                  backgroundColor: shouldKeepNew ? "#d4edda" : "#d1ecf1",
                  borderRadius: "6px",
                  border: `2px solid ${shouldKeepNew ? '#28a745' : '#17a2b8'}`
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ color: "#155724", fontSize: "1.1em" }}>
                    ✓ {shouldKeepNew ? "New Meeting (Will Be Kept)" : "Existing Meeting (Will Be Kept)"}
                  </strong>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "0.9em",
                      fontWeight: "bold",
                      backgroundColor: "white",
                      color: getProbabilityColor(shouldKeepNew ? newMeetingProb : existingMeetingProb)
                    }}
                  >
                    {Math.round((shouldKeepNew ? newMeetingProb : existingMeetingProb) * 100)}% probability
                  </span>
                </div>
                <div style={{ fontSize: "1.05em", fontWeight: "500", marginBottom: "4px" }}>
                  {meetingToKeep.title || meetingToKeep.agenda || "Untitled Meeting"}
                </div>
                <div style={{ fontSize: "0.95em", color: "#495057" }}>
                  {formatDateTime(meetingToKeep.start || meetingToKeep.start_time)} - {formatTime(meetingToKeep.end || meetingToKeep.end_time)}
                </div>
              </div>

              {/* Meeting to Delete */}
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "6px",
                  border: "2px solid #dc3545"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ color: "#721c24", fontSize: "1.1em" }}>
                    ✗ {shouldKeepNew ? "Existing Meeting (Will Be Deleted)" : "New Meeting (Will Be Cancelled)"}
                  </strong>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "0.9em",
                      fontWeight: "bold",
                      backgroundColor: "white",
                      color: getProbabilityColor(shouldKeepNew ? existingMeetingProb : newMeetingProb)
                    }}
                  >
                    {Math.round((shouldKeepNew ? existingMeetingProb : newMeetingProb) * 100)}% probability
                  </span>
                </div>
                <div style={{ fontSize: "1.05em", fontWeight: "500", marginBottom: "4px" }}>
                  {meetingToDelete.title || meetingToDelete.agenda || "Untitled Meeting"}
                </div>
                <div style={{ fontSize: "0.95em", color: "#495057" }}>
                  {formatDateTime(meetingToDelete.start || meetingToDelete.start_time)} - {formatTime(meetingToDelete.end || meetingToDelete.end_time)}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div
              style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "10px"
              }}
            >
              <div style={{ fontSize: "0.95em", color: "#856404" }}>
                <strong>💡 Note:</strong> Both meetings have the same agenda and participants.
                Keeping the meeting with higher probability will avoid confusion.
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
              onClick={onAcceptMerge}
            >
              Merge Meetings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
