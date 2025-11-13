import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

/**
 * Sign up a new user with Firebase and create their profile in the backend
 */
export const signUp = async (email, password, name, company, role) => {
  let firebaseUser = null;

  try {
    // Step 1: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = userCredential.user;

    // Step 2: Get ID token
    const token = await firebaseUser.getIdToken();

    // Step 3: Create user profile in backend
    console.log('Creating backend profile...');
    const response = await api.post('/api/auth/signup', {
      name,
      company,
      role,
      past_meetings: 0,
      past_attended: 0
    });

    console.log('Backend signup response:', response.data);

    // Store token in localStorage
    localStorage.setItem('authToken', token);

    return {
      success: true,
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    // If Firebase user was created but backend failed, delete the Firebase user
    if (firebaseUser && error.response) {
      console.log('Backend failed, cleaning up Firebase user...');
      try {
        await firebaseUser.delete();
        console.log('Firebase user deleted successfully');
      } catch (deleteError) {
        console.error('Failed to delete Firebase user:', deleteError);
      }
    }

    // Handle specific Firebase errors
    let errorMessage = 'An error occurred during signup';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message;
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Login user with Firebase and fetch their profile from backend
 */
export const login = async (email, password) => {
  try {
    // Step 1: Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Get ID token
    const token = await user.getIdToken();

    // Step 3: Get user profile from backend
    const response = await api.post('/api/auth/login');

    // Store token in localStorage
    localStorage.setItem('authToken', token);

    return {
      success: true,
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    console.error('Login error:', error);

    // Handle specific Firebase errors
    let errorMessage = 'An error occurred during login';

    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message;
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Logout user and clear local storage
 */
export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get current user profile from backend
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');

    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null && localStorage.getItem('authToken') !== null;
};
