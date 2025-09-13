# Scalar CMS — Full (React + Node.js + Firebase Auth)

This is a full-stack demo of **Scalar CMS** with **Firebase Authentication** (Email/Password + Google Sign-In) and role support (Instructor / Student).

> Important: You must create a Firebase project and provide credentials for the backend to verify ID tokens.

## Key features

- Firebase Authentication (email/password + Google sign-in).
- Backend verifies Firebase ID tokens using Firebase Admin SDK.
- Role support: Instructor or Student. Role is stored in backend (users.json).
- Instructor: create courses and add lectures (reading / quiz).
- Student: browse courses, view lectures sequentially, attempt quizzes, progress tracking.

## Setup steps

### 1) Firebase project

1. Go to https://console.firebase.google.com and create a project.
2. In **Authentication** -> Sign-in method: enable **Email/Password** and **Google**.
3. In **Project settings** -> **General**, find your **Web app** config (firebaseConfig). You'll use it in the frontend.

### 2) Backend: service account (for verifying ID tokens)

1. In Firebase console: Project Settings -> Service accounts -> "Generate new private key".
2. This downloads a `serviceAccountKey.json` file. Place that file in `backend/` directory (next to index.js).
   - **Do NOT** share this file publicly.
3. Install dependencies and start backend:

```bash
cd backend
npm install
node index.js
```

By default backend will run at http://localhost:4000

### 3) Frontend

1. Open `frontend/src/firebaseConfig.example.js` and copy your Firebase web config into it (or create `firebaseConfig.js` from it).
2. Install and start:

```bash
cd frontend
npm install
npm start
```

Frontend runs at http://localhost:3000

### 6) Deploy env files

Backend `.env` example (do not commit to git):

```
MONGO_URI=your-mongodb-uri
PORT=4000
CORS_ORIGIN=https://your-frontend-domain
# paste the service account JSON as one line below
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...@...gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}
```

Frontend `.env` example:

```
REACT_APP_API_BASE=https://your-backend-url
```

### 4) How auth flow works

- Frontend signs in using Firebase Authentication (email/password or Google).
- After sign-in, frontend obtains a Firebase ID token and calls the backend endpoint `/auth/firebase` with `{ idToken, role }`.
- Backend verifies the ID token with Firebase Admin SDK and creates or updates the user record (stores role).
- For protected API calls, frontend must include `Authorization: Bearer <idToken>` header. Backend will verify it.

### 5) Notes & next steps

- This repo uses JSON file persistence in backend/data/\*. For production, replace with Firestore or SQL DB.
- For production, restrict CORS origins and secure service account.
- You must provide `backend/serviceAccountKey.json` to enable token verification. The server falls back to a mock mode if not found (for quick local testing), but real Firebase verification requires the service account.

Enjoy — open issues or ask me to push this to GitHub or to expand features (Firestore, prettier UI, tests).
# scaler-cms
