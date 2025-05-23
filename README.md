# Game to APK Converter Backend

This directory contains the backend server for the Game to APK Converter application.

## Overview

The server handles:
- File uploads
- ZIP extraction and validation
- APK building using Capacitor
- Serving APK files for download

## Running the Server

```bash
# Install dependencies
npm install

# Start the server
npm run server
```

## API Endpoints

- `POST /api/builds/upload` - Upload a ZIP file
- `GET /api/builds/:buildId/status` - Get build status
- `GET /api/builds/:buildId` - Get build details
- `GET /api/builds` - List all builds
- `GET /api/builds/:buildId/download` - Download the APK file

## Actual APK Building

In a production environment, you would need to:

1. Install the Android SDK
2. Install Capacitor and its dependencies
3. Configure your server with the necessary tools

For the full implementation:

1. Extract the uploaded ZIP file
2. Validate that it contains an index.html and other game files
3. Create a new Capacitor project
4. Configure the Capacitor project with appropriate app details
5. Copy the game files to the web directory
6. Add the Android platform
7. Build the APK
8. Save the APK for download

## Deployment Instructions

### Server Requirements

- Node.js v18+
- Android SDK (for building APKs)
- JDK 11+ (required for Android SDK)
- Gradle 7+ (for Android builds)
- At least 4GB RAM
- 20GB+ of storage space

### Setting Up the Build Server

1. Install Node.js and npm
2. Install Android Studio or Android SDK Tools
3. Set up ANDROID_HOME and JAVA_HOME environment variables
4. Clone the repository
5. Install dependencies with `npm install`
6. Start the server with `npm run server`

### Connect Frontend to Backend

Make sure your frontend's `apiService.ts` points to the correct backend URL.
