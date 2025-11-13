# AutoMeet Frontend - Setup Guide

This guide will help you set up and run the AutoMeet frontend with backend integration.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Backend API running (https://github.com/amankumar00/automeet-backend)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 19.2.0
- Firebase SDK 12.5.0
- Axios 1.13.2
- React Router DOM
- React Big Calendar
- date-fns

### 2. Configure Environment Variables

Create a `.env` file in the root directory by copying from the example:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values:

```env
# Backend API URL
REACT_APP_BACKEND_URL=https://automeet-backend.onrender.com

# Firebase Configuration
# Get these from Firebase Console: https://console.firebase.google.com/
# Project Settings > General > Your apps > Firebase SDK snippet > Config
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 3. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click on the web app icon `</>`
6. Copy the `firebaseConfig` object values to your `.env` file

### 4. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click on **Sign-in method** tab
3. Enable **Email/Password** authentication
4. Save changes

### 5. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:1234` (Parcel default port)

## Features Implemented

### Authentication
- **Signup**: Create new account with Firebase + backend profile
- **Login**: Authenticate and fetch user profile
- **Logout**: Sign out and clear session
- **Protected Routes**: Calendar page requires authentication
- **Session Persistence**: Auto-login on page refresh

### Calendar Management
- **View Meetings**: Fetch and display all user meetings
- **Create Meeting**: Add new meetings with full details
- **Edit Meeting**: Update existing meetings
- **Delete Meeting**: Remove meetings
- **Meeting Modal**: Rich form with:
  - Title/Agenda
  - Meeting Type (Team Sync, One-on-One, etc.)
  - Priority/Importance (1-10 scale)
  - Start & End Time
  - Meeting Link (Zoom, Google Meet, etc.)

### UI/UX
- Bootstrap 5 styling
- Loading spinners for async operations
- Error messages and alerts
- User profile display in header
- Responsive design

## Project Structure

```
automeet/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase initialization
│   ├── services/
│   │   ├── api.js               # Axios instance with interceptors
│   │   ├── auth.js              # Auth service (signup, login, logout)
│   │   └── meetings.js          # Meeting CRUD operations
│   ├── components/
│   │   ├── Header.jsx           # Navigation header with user info
│   │   ├── Footer.jsx           # Footer component
│   │   └── MeetingModal.jsx     # Meeting create/edit modal
│   ├── pages/
│   │   ├── LandingPage.jsx      # Home page
│   │   ├── LoginPage.jsx        # Login form
│   │   ├── SignupPage.jsx       # Signup form
│   │   └── CalendarPage.jsx     # Calendar with meetings
│   ├── App.jsx                  # Main app with routing & auth context
│   └── index.jsx                # Entry point
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
└── index.html                   # HTML template
```

## API Integration

### Backend Endpoints Used

#### Authentication
- `POST /api/auth/signup` - Create user profile
- `POST /api/auth/login` - Get user profile
- `GET /api/auth/me` - Get current user

#### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Authentication Flow

1. User signs up → Firebase creates auth account → Backend creates user profile
2. User logs in → Firebase authenticates → Backend returns user data
3. Firebase ID token is automatically added to all API requests via Axios interceptor
4. Token is stored in localStorage for session persistence

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that your Firebase API key in `.env` is correct
- Make sure you've enabled Email/Password authentication in Firebase Console

### "Network Error" or "CORS Error"
- Ensure backend is running and accessible
- Check `REACT_APP_BACKEND_URL` in `.env` file
- Verify backend allows CORS from your frontend origin

### "401 Unauthorized"
- Your Firebase token may be expired
- Try logging out and logging back in
- Check that Firebase Admin SDK is configured correctly in backend

### Meetings not loading
- Check browser console for errors
- Verify backend `/api/meetings` endpoint is working
- Ensure you're logged in (token is valid)

## Building for Production

```bash
npm run build
```

This will create a `dist` folder with production-ready files.

## Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Netlify: Site settings > Build & deploy > Environment
- Vercel: Project settings > Environment Variables
- Render: Dashboard > Environment

## Next Steps

### Potential Enhancements
1. **Participants Management**: Add UI to manage meeting participants
2. **Calendar Filters**: Filter by meeting type, importance
3. **Search**: Search meetings by title/agenda
4. **Notifications**: Email/push notifications for upcoming meetings
5. **Profile Page**: Edit user profile (name, company, role)
6. **Meeting Analytics**: Dashboard with meeting statistics
7. **Recurring Meetings**: Support for recurring meeting patterns
8. **Timezone Support**: Handle different timezones

## Support

For issues or questions:
- Backend repo: https://github.com/amankumar00/automeet-backend
- Frontend issues: Check browser console for errors
- Firebase issues: Check Firebase Console > Authentication logs

## License

ISC
