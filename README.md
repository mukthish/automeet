# AutoMeet - Meeting Management Platform

A modern React-based meeting scheduling and management platform with Firebase authentication and backend integration.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Firebase credentials (see [SETUP.md](SETUP.md) for details)

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:1234`

## Features

- Firebase authentication (signup/login)
- Protected routes
- Calendar view with React Big Calendar
- Create, edit, and delete meetings
- Meeting types and priority levels
- Real-time backend synchronization
- User profile management
- Responsive design with Bootstrap

## Documentation

For detailed setup instructions, see [SETUP.md](SETUP.md)

## Tech Stack

- React 19.2
- Firebase Authentication
- Axios for API calls
- React Router for navigation
- React Big Calendar
- Bootstrap 5
- Parcel bundler

## Backend

Backend repository: https://github.com/amankumar00/automeet-backend

## Project Structure

```
src/
├── config/          # Firebase configuration
├── services/        # API services (auth, meetings)
├── components/      # React components
├── pages/           # Page components
└── App.jsx         # Main app with routing
```

## Scripts

- `npm start` - Start development server
- `npm run build` - Build for production

## License

ISC
