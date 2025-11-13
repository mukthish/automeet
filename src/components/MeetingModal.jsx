import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { getAllUsers } from "../services/users";

const MEETING_TYPES = [
  "Team Sync",
  "One-on-One",
  "Client Meeting",
  "Project Review",
  "Brainstorming",
  "Interview",
  "Training",
  "All-Hands",
  "Other"
];

export default function MeetingModal({ show, onClose, onSave, onDelete, selectedSlot, selectedEvent }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [formData, setFormData] = useState({
    agenda: "",
    meeting_type: "Team Sync",
    importance: 5,
    start_time: "",
    end_time: "",
    meeting_link: ""
  });

  // Fetch all users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers();
      if (result.success) {
        setAllUsers(result.users);
      }
    };

    if (show) {
      fetchUsers();
    }
  }, [show]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (selectedEvent) {
      // Editing existing event
      setFormData({
        agenda: selectedEvent.title,
        meeting_type: selectedEvent.meeting_type || "Team Sync",
        importance: selectedEvent.importance || 5,
        start_time: formatDateTimeLocal(selectedEvent.start),
        end_time: formatDateTimeLocal(selectedEvent.end),
        meeting_link: selectedEvent.meeting_link || ""
      });

      // Set existing participants (extract user_id from participant objects)
      // Backend stores participants as: { user_id, predicted_attendance_probability }
      // But may also return populated user details from GET endpoint
      console.log('Selected event participants:', selectedEvent.participants);

      const participantIds = selectedEvent.participants
        ?.map(p => {
          console.log('Processing participant:', p);

          // Handle different participant formats
          if (typeof p === 'string') {
            return p; // Already a user ID string
          }

          if (typeof p === 'object' && p !== null) {
            // Backend format: { user_id, predicted_attendance_probability }
            if (p.user_id) {
              return p.user_id;
            }

            // Populated user details format (from GET): { user_id, name, email, ... }
            if (p.id) {
              return p.id;
            }

            // Corrupted data - skip it
            if (p.name === "Error Loading User") {
              console.warn('Skipping corrupted participant data:', p);
              return null;
            }
          }

          console.warn('Unknown participant format:', p);
          return null;
        })
        .filter(id => id != null && id !== '');

      console.log('Extracted participant IDs:', participantIds);

      // If no valid participants found (corrupted data), default to just the creator
      const finalParticipantIds = participantIds.length > 0 ? participantIds : [user.user_id];

      // Ensure creator is included
      if (!finalParticipantIds.includes(user.user_id)) {
        finalParticipantIds.push(user.user_id);
      }

      console.log('Final participant IDs to set:', finalParticipantIds);
      setSelectedParticipants(finalParticipantIds);
    } else if (selectedSlot) {
      // Creating new event with selected time slot - creator is automatically included
      setFormData({
        agenda: "",
        meeting_type: "Team Sync",
        importance: 5,
        start_time: formatDateTimeLocal(selectedSlot.start),
        end_time: formatDateTimeLocal(selectedSlot.end),
        meeting_link: ""
      });
      setSelectedParticipants([user.user_id]);
    }
  }, [selectedEvent, selectedSlot, user.user_id]);

  // Format date for datetime-local input
  const formatDateTimeLocal = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleParticipantToggle = (userId) => {
    setSelectedParticipants(prev => {
      // Don't allow removing the creator
      if (userId === user.user_id && prev.includes(userId)) {
        return prev;
      }

      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);

    if (endTime <= startTime) {
      alert("End time must be after start time");
      return;
    }

    // Validate participants - filter out null/undefined and ensure at least one participant
    const validParticipants = selectedParticipants.filter(id => id != null && id !== '');

    if (validParticipants.length === 0) {
      alert("At least one participant is required. You must be included in the meeting.");
      return;
    }

    // Ensure creator is always included
    if (!validParticipants.includes(user.user_id)) {
      validParticipants.push(user.user_id);
    }

    setLoading(true);

    // Prepare data for backend
    const meetingData = {
      creator_id: user.user_id,
      meeting_type: formData.meeting_type,
      importance: parseInt(formData.importance),
      start_time: new Date(formData.start_time).getTime(), // Send as timestamp
      end_time: new Date(formData.end_time).getTime(), // Send as timestamp
      agenda: formData.agenda,
      meeting_link: formData.meeting_link,
      participants: validParticipants // Array of valid user IDs
    };

    console.log('Sending meeting data to backend:', meetingData);
    console.log('Valid participants being sent:', validParticipants);

    const result = await onSave(meetingData);
    setLoading(false);

    // If conflict, duplicate, or fatigue warning was detected, don't close the modal - let resolution modals handle it
    if (result?.conflictDetected || result?.duplicateDetected || result?.fatigueWarning) {
      // Modal will be shown, keep this modal open in background
      return;
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      setLoading(true);
      await onDelete(selectedEvent.id);
      setLoading(false);
    }
  };

  if (!show) return null;

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
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1050,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
        onClick={onClose}
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
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #dee2e6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h5 style={{ margin: 0 }}>
              {selectedEvent ? "Edit Meeting" : "Create Meeting"}
            </h5>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6c757d"
              }}
            >
              &times;
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "20px" }}>
              <div className="mb-3">
                <label className="form-label">Meeting Title / Agenda *</label>
                <input
                  type="text"
                  className="form-control"
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g., Weekly Team Sync"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Meeting Type *</label>
                <select
                  className="form-select"
                  name="meeting_type"
                  value={formData.meeting_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {MEETING_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Importance / Priority: {formData.importance}
                </label>
                <input
                  type="range"
                  className="form-range"
                  name="importance"
                  min="1"
                  max="10"
                  value={formData.importance}
                  onChange={handleChange}
                  disabled={loading}
                />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Low (1)</small>
                  <small className="text-muted">High (10)</small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Start Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">End Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Meeting Link</label>
                <input
                  type="url"
                  className="form-control"
                  name="meeting_link"
                  value={formData.meeting_link}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Participants *</label>
                <div
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    padding: "10px",
                    maxHeight: "200px",
                    overflowY: "auto"
                  }}
                >
                  {allUsers.length === 0 ? (
                    <div className="text-muted">Loading users...</div>
                  ) : (
                    allUsers.map((u) => (
                      <div key={u.user_id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`participant-${u.user_id}`}
                          checked={selectedParticipants.includes(u.user_id)}
                          onChange={() => handleParticipantToggle(u.user_id)}
                          disabled={loading || u.user_id === user.user_id}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`participant-${u.user_id}`}
                          style={{ cursor: "pointer", width: "100%" }}
                        >
                          <div>
                            <strong>{u.name}</strong>
                            {u.user_id === user.user_id && (
                              <span className="badge bg-primary ms-2">You</span>
                            )}
                          </div>
                          <small className="text-muted">
                            {u.email} - {u.role} at {u.company}
                          </small>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <small className="text-muted">
                  {selectedParticipants.length} participant(s) selected
                </small>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "20px",
                borderTop: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "space-between",
                gap: "10px"
              }}
            >
              <div>
                {selectedEvent && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
