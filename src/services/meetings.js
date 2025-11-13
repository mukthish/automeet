import api from './api';

/**
 * Get all meetings for the current user
 */
export const getMeetings = async () => {
  try {
    const response = await api.get('/api/meetings');

    return {
      success: true,
      meetings: response.data.meetings || response.data
    };
  } catch (error) {
    console.error('Get meetings error:', error);
    console.error('Error details:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message,
      meetings: []
    };
  }
};

/**
 * Get a specific meeting by ID
 */
export const getMeetingById = async (meetingId) => {
  try {
    const response = await api.get(`/api/meetings/${meetingId}`);

    return {
      success: true,
      meeting: response.data.meeting || response.data
    };
  } catch (error) {
    console.error('Get meeting error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Create a new meeting
 */
export const createMeeting = async (meetingData) => {
  try {
    const response = await api.post('/api/meetings', meetingData);

    return {
      success: true,
      meeting: response.data.meeting || response.data,
      message: response.data.message || 'Meeting created successfully'
    };
  } catch (error) {
    console.error('Create meeting error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message
    };
  }
};

/**
 * Update an existing meeting
 */
export const updateMeeting = async (meetingId, meetingData) => {
  try {
    console.log('Updating meeting with ID:', meetingId);
    console.log('Update payload:', meetingData);
    const response = await api.put(`/api/meetings/${meetingId}`, meetingData);

    console.log('Update response:', response.data);
    console.log('Updated meeting participants:', response.data.meeting?.participants);

    return {
      success: true,
      meeting: response.data.meeting || response.data,
      message: response.data.message || 'Meeting updated successfully'
    };
  } catch (error) {
    console.error('Update meeting error:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message
    };
  }
};

/**
 * Delete a meeting
 */
export const deleteMeeting = async (meetingId) => {
  try {
    const response = await api.delete(`/api/meetings/${meetingId}`);

    return {
      success: true,
      message: response.data.message || 'Meeting deleted successfully'
    };
  } catch (error) {
    console.error('Delete meeting error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Add participant to a meeting
 */
export const addParticipant = async (meetingId, participantData) => {
  try {
    const response = await api.post(`/api/meetings/${meetingId}/participants`, participantData);

    return {
      success: true,
      participant: response.data.participant || response.data,
      message: response.data.message || 'Participant added successfully'
    };
  } catch (error) {
    console.error('Add participant error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Remove participant from a meeting
 */
export const removeParticipant = async (meetingId, participantId) => {
  try {
    const response = await api.delete(`/api/meetings/${meetingId}/participants/${participantId}`);

    return {
      success: true,
      message: response.data.message || 'Participant removed successfully'
    };
  } catch (error) {
    console.error('Remove participant error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};
