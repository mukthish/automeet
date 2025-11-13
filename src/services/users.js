import api from './api';

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');

    return {
      success: true,
      users: response.data.users || response.data
    };
  } catch (error) {
    console.error('Get users error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      users: []
    };
  }
};

/**
 * Get a specific user by ID
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);

    return {
      success: true,
      user: response.data.user || response.data
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};
