// src/utils/fatigueDetector.js

/**
 * Check if a date is today
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Calculate total meeting hours for a given date
 * @param {Array} meetings - Array of meetings
 * @param {Date} date - Date to check (defaults to today)
 * @returns {Number} Total hours of meetings
 */
export const calculateTotalMeetingHours = (meetings, date = new Date()) => {
  const targetDate = new Date(date);

  const todaysMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.start || meeting.start_time);
    return (
      meetingDate.getDate() === targetDate.getDate() &&
      meetingDate.getMonth() === targetDate.getMonth() &&
      meetingDate.getFullYear() === targetDate.getFullYear()
    );
  });

  const totalMs = todaysMeetings.reduce((sum, meeting) => {
    const start = new Date(meeting.start || meeting.start_time);
    const end = new Date(meeting.end || meeting.end_time);
    return sum + (end - start);
  }, 0);

  // Convert milliseconds to hours
  return totalMs / (1000 * 60 * 60);
};

/**
 * Check if two meetings are back-to-back (within 15 minutes of each other)
 * @param {Object} meeting1 - First meeting
 * @param {Object} meeting2 - Second meeting
 * @returns {Boolean} True if meetings are back-to-back
 */
const areBackToBack = (meeting1, meeting2) => {
  const end1 = new Date(meeting1.end || meeting1.end_time);
  const start2 = new Date(meeting2.start || meeting2.start_time);

  // If second meeting starts within 15 minutes of first meeting ending, they're back-to-back
  const diffMinutes = (start2 - end1) / (1000 * 60);
  return diffMinutes >= 0 && diffMinutes <= 15;
};

/**
 * Find the longest chain of consecutive meetings
 * @param {Array} meetings - Array of meetings (must be sorted by start time)
 * @returns {Number} Length of longest consecutive meeting chain
 */
export const findLongestConsecutiveChain = (meetings) => {
  if (meetings.length === 0) return 0;

  // Sort meetings by start time
  const sortedMeetings = [...meetings].sort((a, b) => {
    const startA = new Date(a.start || a.start_time);
    const startB = new Date(b.start || b.start_time);
    return startA - startB;
  });

  let maxChain = 1;
  let currentChain = 1;

  for (let i = 1; i < sortedMeetings.length; i++) {
    if (areBackToBack(sortedMeetings[i - 1], sortedMeetings[i])) {
      currentChain++;
      maxChain = Math.max(maxChain, currentChain);
    } else {
      currentChain = 1;
    }
  }

  return maxChain;
};

/**
 * Get all meetings for the current user on a specific date
 * @param {Array} allMeetings - All meetings in the system
 * @param {String} userId - User ID to filter by
 * @param {Date} date - Date to check (defaults to today)
 * @returns {Array} User's meetings on the specified date
 */
export const getUserMeetingsForDate = (allMeetings, userId, date = new Date()) => {
  const targetDate = new Date(date);

  return allMeetings.filter(meeting => {
    // Check if meeting is on the target date
    const meetingDate = new Date(meeting.start || meeting.start_time);
    const isOnDate = (
      meetingDate.getDate() === targetDate.getDate() &&
      meetingDate.getMonth() === targetDate.getMonth() &&
      meetingDate.getFullYear() === targetDate.getFullYear()
    );

    if (!isOnDate) return false;

    // Check if user is involved in this meeting
    if (meeting.creator_id === userId) return true;

    // Check if user is a participant
    const isParticipant = meeting.participants?.some(p => {
      const participantId = typeof p === 'string' ? p : (p?.user_id || p?.id);
      return participantId === userId;
    });

    return isParticipant;
  });
};

/**
 * Check if user should receive a fatigue warning
 * @param {Object} newMeeting - The meeting being created
 * @param {Array} existingMeetings - All existing meetings
 * @param {String} userId - Current user ID
 * @returns {Object|null} Fatigue info if warning needed, null otherwise
 */
export const checkFatigueWarning = (newMeeting, existingMeetings, userId) => {
  console.log('=== CHECKING FATIGUE WARNING ===');
  console.log('New meeting:', newMeeting);
  console.log('User ID:', userId);

  // Get the date of the new meeting
  const newMeetingDate = new Date(newMeeting.start_time || newMeeting.start);

  // Only check fatigue for meetings scheduled today
  if (!isToday(newMeetingDate)) {
    console.log('Meeting is not scheduled for today, skipping fatigue check');
    return null;
  }

  // Get all user's meetings for today (including the new one)
  const todaysMeetings = getUserMeetingsForDate(existingMeetings, userId, newMeetingDate);

  // Add the new meeting to the list for calculation
  const allMeetingsIncludingNew = [
    ...todaysMeetings,
    {
      start: newMeetingDate,
      end: new Date(newMeeting.end_time || newMeeting.end),
      start_time: newMeeting.start_time,
      end_time: newMeeting.end_time,
      title: newMeeting.agenda || newMeeting.title,
      agenda: newMeeting.agenda || newMeeting.title
    }
  ];

  console.log('Total meetings today (including new):', allMeetingsIncludingNew.length);

  // Calculate total hours
  const totalHours = calculateTotalMeetingHours(allMeetingsIncludingNew, newMeetingDate);
  console.log('Total meeting hours today:', totalHours);

  // Find consecutive meetings
  const consecutiveCount = findLongestConsecutiveChain(allMeetingsIncludingNew);
  console.log('Longest consecutive meeting chain:', consecutiveCount);

  // Check if thresholds are exceeded
  const hoursExceeded = totalHours >= 5;
  const consecutiveExceeded = consecutiveCount >= 3;

  if (hoursExceeded || consecutiveExceeded) {
    console.log('⚠️ FATIGUE WARNING TRIGGERED');

    let reason;
    if (hoursExceeded && consecutiveExceeded) {
      reason = "both";
    } else if (hoursExceeded) {
      reason = "total_hours";
    } else {
      reason = "consecutive_meetings";
    }

    return {
      totalHoursToday: totalHours,
      consecutiveMeetings: consecutiveCount,
      meetingsToday: allMeetingsIncludingNew.map(m => ({
        title: m.title || m.agenda || "Untitled Meeting",
        start: m.start || m.start_time,
        end: m.end || m.end_time
      })),
      reason
    };
  }

  console.log('✅ No fatigue warning needed');
  return null;
};
