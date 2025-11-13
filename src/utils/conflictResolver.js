// src/utils/conflictResolver.js

/**
 * Check if two time ranges overlap
 */
export const timesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Calculate meeting probability (average of participants' probabilities)
 */
export const calculateMeetingProbability = (participants) => {
  if (!participants || participants.length === 0) return 0.5;

  const sum = participants.reduce((acc, p) => {
    const prob = typeof p === 'object' && p?.predicted_attendance_probability != null
      ? p.predicted_attendance_probability
      : 0.5;
    return acc + prob;
  }, 0);

  return sum / participants.length;
};

/**
 * Find conflicting meetings for a given time range
 * @param {Date} startTime - Start time of the meeting to check
 * @param {Date} endTime - End time of the meeting to check
 * @param {Array} existingMeetings - Array of existing meetings
 * @param {String} excludeMeetingId - Meeting ID to exclude (for updates)
 * @returns {Array} Array of conflicting meetings
 */
export const findConflictingMeetings = (startTime, endTime, existingMeetings, excludeMeetingId = null) => {
  console.log('findConflictingMeetings called with:', {
    startTime,
    endTime,
    existingMeetingsCount: existingMeetings.length,
    excludeMeetingId
  });

  return existingMeetings.filter(meeting => {
    // Skip the meeting being edited
    if (excludeMeetingId && meeting.id === excludeMeetingId) {
      console.log('Skipping meeting being edited:', meeting.id);
      return false;
    }

    // Handle both start/end and start_time/end_time formats
    const meetingStart = new Date(meeting.start || meeting.start_time);
    const meetingEnd = new Date(meeting.end || meeting.end_time);

    console.log('Checking meeting:', {
      id: meeting.id,
      title: meeting.agenda || meeting.title,
      meetingStart,
      meetingEnd
    });

    const overlaps = timesOverlap(startTime, endTime, meetingStart, meetingEnd);
    console.log('Overlaps?', overlaps);

    return overlaps;
  });
};

/**
 * Find all meetings for specific participants
 * @param {Array} participantIds - Array of participant user IDs
 * @param {Array} allMeetings - All meetings in the system
 * @returns {Array} Meetings involving any of the participants
 */
export const getMeetingsForParticipants = (participantIds, allMeetings) => {
  return allMeetings.filter(meeting => {
    // Check if any of the participants are in this meeting
    return meeting.participants?.some(p => {
      const userId = typeof p === 'string' ? p : (p?.user_id || p?.id);
      return participantIds.includes(userId);
    });
  });
};

/**
 * Find the next available time slot that doesn't conflict with any participant's meetings
 * @param {Date} preferredStart - Preferred start time
 * @param {Number} durationMs - Meeting duration in milliseconds
 * @param {Array} participantIds - Array of participant user IDs
 * @param {Array} allMeetings - All meetings in the system
 * @param {String} excludeMeetingId - Meeting ID to exclude (for updates)
 * @returns {Object} { start: Date, end: Date } or null if no slot found
 */
export const findNextAvailableSlot = (preferredStart, durationMs, participantIds, allMeetings, excludeMeetingId = null) => {
  console.log('findNextAvailableSlot called with:', {
    preferredStart,
    durationMs,
    participantIds,
    allMeetingsCount: allMeetings.length,
    excludeMeetingId
  });

  // Get all meetings for these participants
  const participantMeetings = getMeetingsForParticipants(participantIds, allMeetings)
    .filter(m => excludeMeetingId ? m.id !== excludeMeetingId : true)
    .map(m => ({
      id: m.id,
      title: m.agenda || m.title,
      start: new Date(m.start || m.start_time),
      end: new Date(m.end || m.end_time)
    }))
    .sort((a, b) => a.start - b.start); // Sort by start time

  console.log('Participant meetings to check:', participantMeetings);

  // Try to find a slot, starting from preferred start time
  let candidateStart = new Date(preferredStart);
  const maxAttempts = 100; // Limit search to prevent infinite loops
  let attempts = 0;

  while (attempts < maxAttempts) {
    const candidateEnd = new Date(candidateStart.getTime() + durationMs);

    console.log(`Attempt ${attempts + 1}: Checking slot ${candidateStart.toLocaleString()} - ${candidateEnd.toLocaleString()}`);

    // Check if this slot conflicts with any participant meetings
    const hasConflict = participantMeetings.some(meeting =>
      timesOverlap(candidateStart, candidateEnd, meeting.start, meeting.end)
    );

    console.log('Has conflict?', hasConflict);

    if (!hasConflict) {
      // Found an available slot
      console.log('✅ Found available slot:', candidateStart, '-', candidateEnd);
      return {
        start: candidateStart,
        end: candidateEnd
      };
    }

    // Find the next meeting that conflicts and move past it
    const conflictingMeeting = participantMeetings.find(meeting =>
      timesOverlap(candidateStart, candidateEnd, meeting.start, meeting.end)
    );

    if (conflictingMeeting) {
      console.log('Conflicting with:', conflictingMeeting.title, 'ending at', conflictingMeeting.end);
      // Move candidate start to end of conflicting meeting
      candidateStart = new Date(conflictingMeeting.end);
      console.log('Moving candidate start to:', candidateStart);
    } else {
      // No conflict found but hasConflict was true - move forward by 30 minutes
      console.log('No specific conflict found, moving forward 30 minutes');
      candidateStart = new Date(candidateStart.getTime() + 30 * 60 * 1000);
    }

    attempts++;
  }

  // No available slot found within reasonable search
  return null;
};

/**
 * Determine which meeting should be rescheduled based on probability
 * @param {Object} newMeeting - The meeting being created/updated
 * @param {Array} conflictingMeetings - Array of conflicting meetings
 * @returns {Object} { shouldRescheduleNew: boolean, meetingToReschedule: Object, higherPriorityMeeting: Object }
 */
export const determineMeetingToReschedule = (newMeeting, conflictingMeetings) => {
  const newMeetingProb = calculateMeetingProbability(newMeeting.participants);

  // Find the conflicting meeting with highest probability
  let highestProbMeeting = conflictingMeetings[0];
  let highestProb = calculateMeetingProbability(highestProbMeeting.participants);

  conflictingMeetings.forEach(meeting => {
    const prob = calculateMeetingProbability(meeting.participants);
    if (prob > highestProb) {
      highestProb = prob;
      highestProbMeeting = meeting;
    }
  });

  // If new meeting has lower probability, reschedule it
  if (newMeetingProb < highestProb) {
    return {
      shouldRescheduleNew: true,
      meetingToReschedule: newMeeting,
      higherPriorityMeeting: highestProbMeeting,
      newMeetingProb,
      higherPriorityProb: highestProb
    };
  }

  // If new meeting has higher probability, reschedule the existing one
  return {
    shouldRescheduleNew: false,
    meetingToReschedule: highestProbMeeting,
    higherPriorityMeeting: newMeeting,
    newMeetingProb,
    higherPriorityProb: highestProb
  };
};

/**
 * Check if two sets of participants are the same
 * @param {Array} participants1 - First set of participants
 * @param {Array} participants2 - Second set of participants
 * @returns {boolean} True if participants are the same
 */
export const haveSameParticipants = (participants1, participants2) => {
  if (!participants1 || !participants2) {
    console.log('One or both participant arrays are null/undefined');
    return false;
  }

  console.log('Comparing participants:', {
    participants1,
    participants2
  });

  // Extract user IDs from both sets
  const ids1 = participants1.map(p => {
    if (typeof p === 'string') return p;
    return p?.user_id || p?.id;
  }).filter(id => id != null).sort();

  const ids2 = participants2.map(p => {
    if (typeof p === 'string') return p;
    return p?.user_id || p?.id;
  }).filter(id => id != null).sort();

  console.log('Extracted and sorted IDs:', {
    ids1,
    ids2,
    lengths: { ids1: ids1.length, ids2: ids2.length }
  });

  if (ids1.length !== ids2.length) {
    console.log('Participant counts do not match');
    return false;
  }

  // Compare sorted arrays
  const match = ids1.every((id, index) => id === ids2[index]);
  console.log('Participants match?', match);
  return match;
};

/**
 * Find duplicate meetings (same agenda and participants)
 * @param {Object} newMeeting - The meeting being created/updated
 * @param {Array} existingMeetings - Array of existing meetings
 * @param {String} excludeMeetingId - Meeting ID to exclude (for updates)
 * @returns {Array} Array of duplicate meetings
 */
export const findDuplicateMeetings = (newMeeting, existingMeetings, excludeMeetingId = null) => {
  console.log('=== CHECKING FOR DUPLICATE MEETINGS ===');
  console.log('New meeting:', {
    agenda: newMeeting.agenda || newMeeting.title,
    participants: newMeeting.participants
  });

  const newAgenda = (newMeeting.agenda || newMeeting.title || '').toLowerCase().trim();

  return existingMeetings.filter(meeting => {
    // Skip the meeting being edited
    if (excludeMeetingId && meeting.id === excludeMeetingId) {
      return false;
    }

    const existingAgenda = (meeting.agenda || meeting.title || '').toLowerCase().trim();

    // Check if agendas match
    const agendaMatches = existingAgenda === newAgenda;

    // Check if participants match
    const participantsMatch = haveSameParticipants(newMeeting.participants, meeting.participants);

    console.log('Comparing with meeting:', {
      id: meeting.id,
      agenda: existingAgenda,
      agendaMatches,
      participantsMatch
    });

    return agendaMatches && participantsMatch;
  });
};

/**
 * Determine which meeting should be kept when merging
 * @param {Object} newMeeting - The meeting being created/updated
 * @param {Array} duplicateMeetings - Array of duplicate meetings
 * @returns {Object} { shouldKeepNew: boolean, meetingToKeep: Object, meetingToDelete: Object }
 */
export const determineMeetingToKeep = (newMeeting, duplicateMeetings) => {
  const newMeetingProb = calculateMeetingProbability(newMeeting.participants);

  // Find the duplicate meeting with highest probability
  let highestProbMeeting = duplicateMeetings[0];
  let highestProb = calculateMeetingProbability(highestProbMeeting.participants);

  duplicateMeetings.forEach(meeting => {
    const prob = calculateMeetingProbability(meeting.participants);
    if (prob > highestProb) {
      highestProb = prob;
      highestProbMeeting = meeting;
    }
  });

  // If new meeting has higher probability, keep it
  if (newMeetingProb >= highestProb) {
    return {
      shouldKeepNew: true,
      meetingToKeep: newMeeting,
      meetingToDelete: highestProbMeeting,
      newMeetingProb,
      existingMeetingProb: highestProb
    };
  }

  // If existing meeting has higher probability, keep it
  return {
    shouldKeepNew: false,
    meetingToKeep: highestProbMeeting,
    meetingToDelete: newMeeting,
    newMeetingProb,
    existingMeetingProb: highestProb
  };
};
