// src/pages/CalendarPage.jsx

import React, { useState, useEffect, useContext } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getMeetings, createMeeting, updateMeeting, deleteMeeting } from "../services/meetings";
import { getAllUsers } from "../services/users";
import MeetingModal from "../components/MeetingModal";
import ConflictResolutionModal from "../components/ConflictResolutionModal";
import MergeMeetingsModal from "../components/MergeMeetingsModal";
import FatigueWarningModal from "../components/FatigueWarningModal";
import { AuthContext } from "../App";
import {
  findConflictingMeetings,
  determineMeetingToReschedule,
  findNextAvailableSlot,
  calculateMeetingProbability,
  findDuplicateMeetings,
  determineMeetingToKeep
} from "../utils/conflictResolver";
import { checkFatigueWarning } from "../utils/fatigueDetector";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom event component to display participants
const EventComponent = ({ event }) => {
  const participantCount = event.participants?.length || 0;

  // Safely extract participant names with better error handling
  // Backend may return:
  // 1. Just { user_id, predicted_attendance_probability }
  // 2. Populated user details { user_id, name, email, ... }
  // 3. String user IDs
  const participantNames = event.participants
    ?.map(p => {
      if (!p) return null;

      // String format - can't display name
      if (typeof p === 'string') return null;

      // Object format
      if (typeof p === 'object') {
        // Skip corrupted data
        if (p.name === "Error Loading User") return null;

        // Populated user details
        if (p.name) return p.name;

        // Just { user_id, predicted_attendance_probability } - can't display name
        return null;
      }

      return null;
    })
    .filter(name => name !== null);

  const displayNames = participantNames.slice(0, 3).join(", ");
  const hasValidNames = participantNames.length > 0;

  // Calculate meeting probability (average of all participants' probabilities)
  const meetingProbability = event.participants && event.participants.length > 0
    ? event.participants.reduce((sum, p) => {
        const prob = typeof p === 'object' && p?.predicted_attendance_probability != null
          ? p.predicted_attendance_probability
          : 0.5; // Default to 50% if not available
        return sum + prob;
      }, 0) / event.participants.length
    : null;

  // Determine color based on probability
  const getProbabilityColor = (prob) => {
    if (prob >= 0.7) return '#28a745'; // Green - high probability
    if (prob >= 0.4) return '#ffc107'; // Yellow - medium probability
    return '#dc3545'; // Red - low probability
  };

  return (
    <div style={{
      fontSize: "0.85em",
      lineHeight: "1.2",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }}>
      <div style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          fontWeight: "600",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {event.title}
        </div>
        {participantCount > 0 && (
          <div style={{
            fontSize: "0.85em",
            opacity: 0.85,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: "2px"
          }}>
            👥 {hasValidNames ? displayNames : `${participantCount} participant${participantCount !== 1 ? 's' : ''}`}
            {hasValidNames && participantNames.length > 3 && ` +${participantNames.length - 3}`}
          </div>
        )}
      </div>
      {meetingProbability !== null && (
        <div style={{
          fontSize: "0.75em",
          fontWeight: "700",
          color: getProbabilityColor(meetingProbability),
          marginLeft: "6px",
          whiteSpace: "nowrap",
          flexShrink: 0
        }}>
          {Math.round(meetingProbability * 100)}%
        </div>
      )}
    </div>
  );
};

export default function CalendarPage() {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Conflict resolution state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [suggestedSlot, setSuggestedSlot] = useState(null);
  const [pendingMeetingData, setPendingMeetingData] = useState(null);
  const [allMeetingsData, setAllMeetingsData] = useState([]); // Store raw meetings for conflict checking

  // Merge meetings state
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeInfo, setMergeInfo] = useState(null);

  // Fatigue warning state
  const [showFatigueModal, setShowFatigueModal] = useState(false);
  const [fatigueInfo, setFatigueInfo] = useState(null);

  // Fetch all users for populating participant details
  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers();
      if (result.success) {
        setAllUsers(result.users);
        console.log('Fetched all users:', result.users);
      } else {
        console.error('Failed to fetch users:', result.error);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Fetch meetings from backend when user is available AND users are loaded
  useEffect(() => {
    if (user && allUsers.length > 0) {
      fetchMeetings();
    }
  }, [user, allUsers]);

  const fetchMeetings = async () => {
    setLoading(true);

    try {
      const result = await getMeetings();

      if (result.success) {
        console.log('Current user ID:', user.user_id);
        console.log('All meetings from backend:', result.meetings);

        // Filter meetings where user is creator or participant
        const userMeetings = result.meetings.filter(meeting => {
          // Check if user is the creator
          if (meeting.creator_id === user.user_id) {
            return true;
          }

          // Check if user is a participant
          const isParticipant = meeting.participants?.some(p => {
            if (typeof p === 'string') return p === user.user_id;
            return p?.user_id === user.user_id || p?.id === user.user_id;
          });

          return isParticipant;
        });

        console.log(`Filtered to ${userMeetings.length} meetings for user ${user.user_id}`);

        // Transform backend meetings to calendar events format
        const transformedEvents = userMeetings.map((meeting) => {
          console.log('📊 Meeting data from backend:', meeting);
          console.log('📊 Meeting ID:', meeting.id);
          console.log('📊 Meeting agenda:', meeting.agenda || meeting.title);
          console.log('📊 Participants structure:', meeting.participants);
          console.log('📊 Participants type:', typeof meeting.participants, Array.isArray(meeting.participants) ? 'array' : 'not array');

          // Populate participant details from allUsers
          const populatedParticipants = meeting.participants?.map(p => {
            console.log('📋 Processing participant:', p, 'Type:', typeof p);

            // Skip corrupted "Error Loading User" entries from backend
            if (p?.name === "Error Loading User") {
              console.warn('⚠️ Skipping corrupted participant in meeting:', p);
              return null;
            }

            // Extract user_id from different formats
            let userId;
            let probability;

            if (typeof p === 'string') {
              console.log('📋 Participant is STRING format:', p);
              userId = p;
              probability = undefined; // String format doesn't have probability
            } else if (p?.user_id) {
              console.log('📋 Participant is OBJECT with user_id:', p.user_id);
              userId = p.user_id;
              probability = p.predicted_attendance_probability;
            } else if (p?.id) {
              console.log('📋 Participant is OBJECT with id:', p.id);
              userId = p.id;
              probability = p.predicted_attendance_probability;
            } else {
              console.warn('⚠️ Cannot extract user_id from participant:', p);
              return null;
            }

            // Find user details from allUsers
            const userDetails = allUsers.find(u => u.user_id === userId);

            console.log(`✅ Participant ${userId} extracted - probability:`, probability);

            if (userDetails) {
              // Return populated participant with user details
              const result = {
                user_id: userId,
                name: userDetails.name,
                email: userDetails.email,
                company: userDetails.company,
                role: userDetails.role,
                predicted_attendance_probability: probability
              };
              console.log('✅ Populated participant with details:', result);
              return result;
            }

            console.warn('⚠️ User not found for user_id:', userId);
            // If user not found, return with just user_id
            const result = {
              user_id: userId,
              predicted_attendance_probability: probability
            };
            console.log('✅ Populated participant without user details:', result);
            return result;
          }).filter(p => p !== null) || [];

          console.log('📊 Final populated participants for meeting:', populatedParticipants);

          return {
            id: meeting.id,
            title: meeting.agenda || meeting.title || "Untitled Meeting",
            start: new Date(meeting.start_time),
            end: new Date(meeting.end_time),
            meeting_type: meeting.meeting_type,
            importance: meeting.importance,
            meeting_link: meeting.meeting_link,
            participants: populatedParticipants,
            // Store full meeting data
            _rawData: meeting
          };
        });
        setEvents(transformedEvents);
        setAllMeetingsData(result.meetings); // Store raw meetings for conflict checking
        setError("");
      } else {
        // Handle specific backend errors
        if (result.error.includes("user_id")) {
          console.error("Backend authentication error - user context not available when fetching meetings");
          // Don't show error to user, just log it - they can still create meetings
          console.log("You can still create new meetings");
          setError("");
        } else {
          setError(result.error || "Failed to load meetings");
        }
        setEvents([]);
      }
    } catch (err) {
      console.error("Unexpected error fetching meetings:", err);
      setError("Failed to load meetings");
      setEvents([]);
    }

    setLoading(false);
  };

  // Handle selecting a time slot (click + drag)
  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setShowModal(true);
  };

  // Handle clicking an event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowModal(true);
  };

  // Handle saving meeting (create or update) with conflict detection
  const handleSaveMeeting = async (meetingData) => {
    console.log('🚀 handleSaveMeeting CALLED');
    console.log('Meeting data received:', meetingData);

    const meetingStart = new Date(meetingData.start_time);
    const meetingEnd = new Date(meetingData.end_time);

    // Check for fatigue warning FIRST (before conflict/duplicate detection)
    console.log('=== FATIGUE DETECTION START ===');
    const fatigue = checkFatigueWarning(
      {
        start: meetingStart,
        end: meetingEnd,
        start_time: meetingData.start_time,
        end_time: meetingData.end_time,
        agenda: meetingData.agenda,
        title: meetingData.agenda
      },
      allMeetingsData,
      user.user_id
    );

    if (fatigue) {
      console.log('😴 FATIGUE WARNING - Showing modal');
      setPendingMeetingData(meetingData);
      setFatigueInfo(fatigue);
      setShowFatigueModal(true);
      return { fatigueWarning: true }; // Indicate fatigue warning was shown
    }

    console.log('=== CONFLICT DETECTION START ===');
    console.log('Meeting to save:', {
      agenda: meetingData.agenda,
      start: meetingStart,
      end: meetingEnd,
      participants: meetingData.participants
    });

    // Get ALL meetings from backend for conflict checking (not just user's meetings)
    // We need to check conflicts with ALL participants' meetings
    const allMeetingsResult = await getMeetings();
    const allSystemMeetings = allMeetingsResult.success ? allMeetingsResult.meetings : [];

    console.log('All meetings from backend:', allSystemMeetings.length);
    console.log('All meetings data:', allSystemMeetings);

    // Find meetings involving the participants
    const participantMeetings = allSystemMeetings.filter(meeting => {
      return meeting.participants?.some(p => {
        const userId = typeof p === 'string' ? p : (p?.user_id || p?.id);
        return meetingData.participants.includes(userId);
      });
    });

    console.log('Meetings involving participants:', participantMeetings.length);
    console.log('Participant meetings:', participantMeetings);

    // Check for conflicts
    const conflicts = findConflictingMeetings(
      meetingStart,
      meetingEnd,
      participantMeetings,
      selectedEvent?.id // Exclude current meeting if updating
    );

    console.log('Conflicts found:', conflicts.length);
    if (conflicts.length > 0) {
      console.log('Conflicts detected:', conflicts);
      console.log('⚠️ CONFLICT PATH - WILL RETURN EARLY');

      // Prepare new meeting object for conflict resolution
      const newMeetingForConflict = {
        title: meetingData.agenda,
        agenda: meetingData.agenda,
        start: meetingStart,
        end: meetingEnd,
        start_time: meetingData.start_time,
        end_time: meetingData.end_time,
        participants: meetingData.participants.map(userId => ({
          user_id: userId,
          predicted_attendance_probability: 0.5 // Default for now
        }))
      };

      // Populate participant probabilities from allUsers if available
      newMeetingForConflict.participants = newMeetingForConflict.participants.map(p => {
        // Try to find probability from existing event if updating
        if (selectedEvent) {
          const existingParticipant = selectedEvent.participants?.find(
            ep => (ep.user_id || ep.id) === p.user_id
          );
          if (existingParticipant?.predicted_attendance_probability != null) {
            return {
              ...p,
              predicted_attendance_probability: existingParticipant.predicted_attendance_probability
            };
          }
        }
        return p;
      });

      const resolution = determineMeetingToReschedule(newMeetingForConflict, conflicts);

      // Find next available slot
      const duration = meetingEnd - meetingStart;
      const nextSlot = findNextAvailableSlot(
        meetingStart,
        duration,
        meetingData.participants,
        participantMeetings,
        selectedEvent?.id
      );

      if (!nextSlot) {
        alert("Could not find an available time slot for all participants. Please choose a different time.");
        return;
      }

      // Store pending meeting data and show conflict modal
      setPendingMeetingData(meetingData); // Store original meeting data without extra fields
      setConflictInfo(resolution);
      setSuggestedSlot(nextSlot);
      setShowConflictModal(true);
      return { conflictDetected: true }; // Indicate conflict was found
    }

    console.log('✅ NO CONFLICTS - PROCEEDING TO DUPLICATE CHECK');
    console.log('=== DUPLICATE DETECTION START ===');
    console.log('allSystemMeetings count:', allSystemMeetings.length);
    console.log('Meeting agenda to check:', meetingData.agenda);
    console.log('Meeting participants to check:', meetingData.participants);

    // Check for duplicate meetings (same agenda and participants)
    const newMeetingForDuplicateCheck = {
      title: meetingData.agenda,
      agenda: meetingData.agenda,
      start: meetingStart,
      end: meetingEnd,
      start_time: meetingData.start_time,
      end_time: meetingData.end_time,
      participants: meetingData.participants.map(userId => ({
        user_id: userId,
        predicted_attendance_probability: 0.5 // Default for now
      }))
    };

    // Populate participant probabilities
    newMeetingForDuplicateCheck.participants = newMeetingForDuplicateCheck.participants.map(p => {
      if (selectedEvent) {
        const existingParticipant = selectedEvent.participants?.find(
          ep => (ep.user_id || ep.id) === p.user_id
        );
        if (existingParticipant?.predicted_attendance_probability != null) {
          return {
            ...p,
            predicted_attendance_probability: existingParticipant.predicted_attendance_probability
          };
        }
      }
      return p;
    });

    console.log('📋 About to call findDuplicateMeetings with:', {
      newMeeting: newMeetingForDuplicateCheck,
      existingMeetingsCount: allSystemMeetings.length,
      excludeId: selectedEvent?.id
    });

    const duplicates = findDuplicateMeetings(
      newMeetingForDuplicateCheck,
      allSystemMeetings,
      selectedEvent?.id
    );

    console.log('📋 findDuplicateMeetings returned:', duplicates.length, 'duplicates');
    if (duplicates.length > 0) {
      console.log('✅ Duplicate meetings found:', duplicates);
      console.log('🔄 DUPLICATE PATH - WILL SHOW MERGE MODAL');
      const mergeDetermination = determineMeetingToKeep(newMeetingForDuplicateCheck, duplicates);

      setPendingMeetingData(meetingData);
      setMergeInfo(mergeDetermination);
      setShowMergeModal(true);
      return { duplicateDetected: true }; // Indicate duplicate was found
    }

    console.log('✅ NO DUPLICATES - PROCEEDING TO SAVE');
    // No conflicts or duplicates, proceed with save
    await saveMeetingToBackend(meetingData);
    return { conflictDetected: false, duplicateDetected: false }; // Indicate no issues
  };

  // Actual save to backend
  const saveMeetingToBackend = async (meetingData) => {
    let result;

    if (selectedEvent) {
      // Update existing meeting
      result = await updateMeeting(selectedEvent.id, meetingData);
    } else {
      // Create new meeting
      result = await createMeeting(meetingData);
    }

    if (result.success) {
      setShowModal(false);
      setSelectedSlot(null);
      setSelectedEvent(null);

      // Small delay before refreshing to let backend process
      setTimeout(async () => {
        await fetchMeetings();
      }, 500);
    } else {
      alert(result.error || "Failed to save meeting");
    }
  };

  // Handle accepting the reschedule suggestion
  const handleAcceptReschedule = async () => {
    if (!pendingMeetingData || !suggestedSlot || !conflictInfo) return;

    console.log('=== ACCEPT RESCHEDULE ===');
    console.log('Pending meeting data:', pendingMeetingData);
    console.log('Suggested slot:', suggestedSlot);
    console.log('Conflict info:', conflictInfo);

    const { shouldRescheduleNew, meetingToReschedule } = conflictInfo;

    if (shouldRescheduleNew) {
      // Reschedule the new meeting being created/updated
      const rescheduledData = {
        ...pendingMeetingData,
        start_time: suggestedSlot.start.getTime(),
        end_time: suggestedSlot.end.getTime()
      };

      console.log('Rescheduled data to save:', rescheduledData);

      setShowConflictModal(false);
      await saveMeetingToBackend(rescheduledData);
    } else {
      // Need to reschedule the existing meeting
      // First save the new meeting with original time
      await saveMeetingToBackend(pendingMeetingData);

      // Then update the conflicting meeting
      const existingMeetingToUpdate = meetingToReschedule;
      const duration = new Date(existingMeetingToUpdate.end || existingMeetingToUpdate.end_time) -
                      new Date(existingMeetingToUpdate.start || existingMeetingToUpdate.start_time);

      // Find next available slot for the existing meeting
      const participantIds = existingMeetingToUpdate.participants?.map(p =>
        typeof p === 'string' ? p : (p?.user_id || p?.id)
      ).filter(id => id != null) || [];

      const nextSlotForExisting = findNextAvailableSlot(
        new Date(existingMeetingToUpdate.end || existingMeetingToUpdate.end_time),
        duration,
        participantIds,
        allMeetingsData,
        existingMeetingToUpdate.id
      );

      if (nextSlotForExisting) {
        const updateData = {
          creator_id: existingMeetingToUpdate.creator_id,
          meeting_type: existingMeetingToUpdate.meeting_type,
          importance: existingMeetingToUpdate.importance,
          start_time: nextSlotForExisting.start.getTime(),
          end_time: nextSlotForExisting.end.getTime(),
          agenda: existingMeetingToUpdate.agenda || existingMeetingToUpdate.title,
          meeting_link: existingMeetingToUpdate.meeting_link || "",
          participants: participantIds
        };

        await updateMeeting(existingMeetingToUpdate.id, updateData);
      }

      setShowConflictModal(false);

      // Refresh meetings
      setTimeout(async () => {
        await fetchMeetings();
      }, 500);
    }

    // Clear conflict state
    setPendingMeetingData(null);
    setConflictInfo(null);
    setSuggestedSlot(null);
  };

  // Handle canceling the reschedule
  const handleCancelReschedule = () => {
    setShowConflictModal(false);
    setPendingMeetingData(null);
    setConflictInfo(null);
    setSuggestedSlot(null);
    // Keep the modal open so user can adjust time
  };

  // Handle accepting the merge suggestion
  const handleAcceptMerge = async () => {
    if (!pendingMeetingData || !mergeInfo) return;

    console.log('=== ACCEPT MERGE ===');
    console.log('Merge info:', mergeInfo);

    const { shouldKeepNew, meetingToDelete } = mergeInfo;

    if (shouldKeepNew) {
      // Keep the new meeting, delete the existing one
      console.log('Keeping new meeting, deleting existing:', meetingToDelete.id);

      // First save the new meeting
      await saveMeetingToBackend(pendingMeetingData);

      // Then delete the existing duplicate
      await deleteMeeting(meetingToDelete.id);
    } else {
      // Keep the existing meeting, don't save the new one
      console.log('Keeping existing meeting, cancelling new meeting creation');
      // Just close modals without saving
    }

    setShowMergeModal(false);
    setShowModal(false); // Close the meeting modal too
    setPendingMeetingData(null);
    setMergeInfo(null);

    // Refresh meetings
    setTimeout(async () => {
      await fetchMeetings();
    }, 500);
  };

  // Handle canceling the merge
  const handleCancelMerge = () => {
    setShowMergeModal(false);
    setPendingMeetingData(null);
    setMergeInfo(null);
    // Keep the meeting modal open so user can adjust
  };

  // Handle proceeding with meeting despite fatigue warning
  const handleProceedDespiteFatigue = async () => {
    if (!pendingMeetingData) return;

    console.log('=== USER PROCEEDING DESPITE FATIGUE WARNING ===');
    setShowFatigueModal(false);
    setFatigueInfo(null);

    // Continue with normal conflict/duplicate detection flow
    await continueWithConflictAndDuplicateDetection(pendingMeetingData);
  };

  // Handle canceling the meeting due to fatigue
  const handleCancelDueToFatigue = () => {
    console.log('=== USER CANCELLED MEETING DUE TO FATIGUE ===');
    setShowFatigueModal(false);
    setFatigueInfo(null);
    setPendingMeetingData(null);
    // Keep the meeting modal open so user can adjust or cancel
  };

  // Continue with conflict and duplicate detection (called after fatigue warning is dismissed)
  const continueWithConflictAndDuplicateDetection = async (meetingData) => {
    const meetingStart = new Date(meetingData.start_time);
    const meetingEnd = new Date(meetingData.end_time);

    console.log('=== CONFLICT DETECTION START (after fatigue check) ===');
    console.log('Meeting to save:', {
      agenda: meetingData.agenda,
      start: meetingStart,
      end: meetingEnd,
      participants: meetingData.participants
    });

    // Get ALL meetings from backend for conflict checking
    const allMeetingsResult = await getMeetings();
    const allSystemMeetings = allMeetingsResult.success ? allMeetingsResult.meetings : [];

    // Find meetings involving the participants
    const participantMeetings = allSystemMeetings.filter(meeting => {
      return meeting.participants?.some(p => {
        const userId = typeof p === 'string' ? p : (p?.user_id || p?.id);
        return meetingData.participants.includes(userId);
      });
    });

    // Check for conflicts
    const conflicts = findConflictingMeetings(
      meetingStart,
      meetingEnd,
      participantMeetings,
      selectedEvent?.id
    );

    console.log('Conflicts found:', conflicts.length);
    if (conflicts.length > 0) {
      console.log('Conflicts detected:', conflicts);
      console.log('⚠️ CONFLICT PATH - WILL RETURN EARLY');

      // Prepare new meeting object for conflict resolution
      const newMeetingForConflict = {
        title: meetingData.agenda,
        agenda: meetingData.agenda,
        start: meetingStart,
        end: meetingEnd,
        start_time: meetingData.start_time,
        end_time: meetingData.end_time,
        participants: meetingData.participants.map(userId => ({
          user_id: userId,
          predicted_attendance_probability: 0.5
        }))
      };

      // Populate participant probabilities
      newMeetingForConflict.participants = newMeetingForConflict.participants.map(p => {
        if (selectedEvent) {
          const existingParticipant = selectedEvent.participants?.find(
            ep => (ep.user_id || ep.id) === p.user_id
          );
          if (existingParticipant?.predicted_attendance_probability != null) {
            return {
              ...p,
              predicted_attendance_probability: existingParticipant.predicted_attendance_probability
            };
          }
        }
        return p;
      });

      const resolution = determineMeetingToReschedule(newMeetingForConflict, conflicts);

      // Find next available slot
      const duration = meetingEnd - meetingStart;
      const nextSlot = findNextAvailableSlot(
        meetingStart,
        duration,
        meetingData.participants,
        participantMeetings,
        selectedEvent?.id
      );

      if (!nextSlot) {
        alert("Could not find an available time slot for all participants. Please choose a different time.");
        return;
      }

      // Show conflict modal
      setPendingMeetingData(meetingData);
      setConflictInfo(resolution);
      setSuggestedSlot(nextSlot);
      setAllMeetingsData(allSystemMeetings);
      setShowConflictModal(true);
      return;
    }

    console.log('✅ NO CONFLICTS - PROCEEDING TO DUPLICATE CHECK');
    console.log('=== DUPLICATE DETECTION START ===');
    console.log('allSystemMeetings count:', allSystemMeetings.length);
    console.log('Meeting agenda to check:', meetingData.agenda);
    console.log('Meeting participants to check:', meetingData.participants);

    // Check for duplicate meetings
    const newMeetingForDuplicateCheck = {
      title: meetingData.agenda,
      agenda: meetingData.agenda,
      start: meetingStart,
      end: meetingEnd,
      start_time: meetingData.start_time,
      end_time: meetingData.end_time,
      participants: meetingData.participants.map(userId => ({
        user_id: userId,
        predicted_attendance_probability: 0.5
      }))
    };

    // Populate participant probabilities
    newMeetingForDuplicateCheck.participants = newMeetingForDuplicateCheck.participants.map(p => {
      if (selectedEvent) {
        const existingParticipant = selectedEvent.participants?.find(
          ep => (ep.user_id || ep.id) === p.user_id
        );
        if (existingParticipant?.predicted_attendance_probability != null) {
          return {
            ...p,
            predicted_attendance_probability: existingParticipant.predicted_attendance_probability
          };
        }
      }
      return p;
    });

    console.log('📋 About to call findDuplicateMeetings with:', {
      newMeeting: newMeetingForDuplicateCheck,
      existingMeetingsCount: allSystemMeetings.length,
      excludeId: selectedEvent?.id
    });

    const duplicates = findDuplicateMeetings(
      newMeetingForDuplicateCheck,
      allSystemMeetings,
      selectedEvent?.id
    );

    console.log('📋 findDuplicateMeetings returned:', duplicates.length, 'duplicates');
    if (duplicates.length > 0) {
      console.log('✅ Duplicate meetings found:', duplicates);
      console.log('🔄 DUPLICATE PATH - WILL SHOW MERGE MODAL');
      const mergeDetermination = determineMeetingToKeep(newMeetingForDuplicateCheck, duplicates);

      setPendingMeetingData(meetingData);
      setMergeInfo(mergeDetermination);
      setShowMergeModal(true);
      return;
    }

    console.log('✅ NO DUPLICATES - PROCEEDING TO SAVE');
    // No conflicts or duplicates, proceed with save
    await saveMeetingToBackend(meetingData);
  };

  // Handle deleting meeting
  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      const result = await deleteMeeting(meetingId);

      if (result.success) {
        // Refresh meetings list
        await fetchMeetings();
        setShowModal(false);
        setSelectedEvent(null);
      } else {
        alert(result.error || "Failed to delete meeting");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading meetings...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2>My Calendar</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedSlot({ start: new Date(), end: new Date(Date.now() + 3600000) });
            setSelectedEvent(null);
            setShowModal(true);
          }}
        >
          Create Meeting
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        components={{
          event: EventComponent
        }}
        style={{
          height: "650px",
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      />

      {showModal && (
        <MeetingModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSlot(null);
            setSelectedEvent(null);
          }}
          onSave={handleSaveMeeting}
          onDelete={handleDeleteMeeting}
          selectedSlot={selectedSlot}
          selectedEvent={selectedEvent}
        />
      )}

      {showConflictModal && (
        <ConflictResolutionModal
          show={showConflictModal}
          onClose={handleCancelReschedule}
          onAcceptReschedule={handleAcceptReschedule}
          onCancel={handleCancelReschedule}
          conflictInfo={conflictInfo}
          suggestedSlot={suggestedSlot}
        />
      )}

      {showMergeModal && (
        <MergeMeetingsModal
          show={showMergeModal}
          onClose={handleCancelMerge}
          onAcceptMerge={handleAcceptMerge}
          onCancel={handleCancelMerge}
          mergeInfo={mergeInfo}
        />
      )}

      {/* Fatigue Warning Modal */}
      {showFatigueModal && (
        <FatigueWarningModal
          show={showFatigueModal}
          onClose={handleCancelDueToFatigue}
          onProceed={handleProceedDespiteFatigue}
          onCancel={handleCancelDueToFatigue}
          fatigueInfo={fatigueInfo}
        />
      )}
    </div>
  );
}
