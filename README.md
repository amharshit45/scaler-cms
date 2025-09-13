# Scaler CMS: Online Learning Platform

This is a full-stack live project of Scaler CMS — An online learning platform.

Tech Stack: React.js, Node.js, Firebase Auth

### Key Features

- Roles: Student and Instructor
- Instructor: Create courses, and add lectures [Reading/Quiz]
- Student: Browse courses, view lectures sequentially, attempt quizzes, progress tracking.
- Firebase Auth: Email/Password + Google Sign-in.
- Backend verifies Firebase ID tokens using Firebase Admin SDK.

### Live Demo

// This will have images and a video link

---

### Setup Firebase

1. Go to https://console.firebase.google.com/.
2. Click **Add Project** → give it a name (e.g. `scaler-cms`).
3. Choose/disable Google Analytics as you like. 
4. Click **Create Project**.
5. In your new project’s dashboard, go to **Build → Authentication → Sign-in method**.
6. Enable **Email/Password**. 
7. Enable **Google**. 
8. Go to **Project Settings → General → Your Apps**. 
9. Click **</> Add app** if you haven’t already. Choose **Web App**. 
10. Register (any name, e.g. ScalerCMS Frontend).
11. Copy the **firebaseConfig** object (looks like `{apiKey, authDomain, projectId, ...}`) — you’ll paste this into `frontend/src/firebaseConfig.js` later.
12. Go to **Project Settings → Service Accounts**.
13. In the Firebase Admin SDK section, click **“Generate new private key”**.
14. This downloads a file like `scaler-cms-firebase-adminsdk-xxxxx.json`.
15. Put that file in the backend folder, usually as `backend/serviceAccountKey.json` or use `.env` as described in the project README.

⚠️ **Never commit this file to GitHub.**

1. Open frontend/src/firebaseConfig.example.js and copy your Firebase web config into it (or create firebaseConfig.js from it).

### Backend

```bash
cd backend
npm install 
node index.js
```

By default backend will run at [http://localhost:4000](http://localhost:4000/).

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at [http://localhost:3000](http://localhost:3000/).

---

### .env Files

Backend:

```markdown
MONGO_URI = your-mongodb-uri
PORT = 4000
CORS_ORIGIN = https://your-frontend-domain
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...@...gserviceaccount.com","client_id":"...","auth_uri":"[https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/](https://accounts.google.com/o/oauth2/auth%22,%22token_uri%22:%22https://oauth2.googleapis.com/token%22,%22auth_provider_x509_cert_url%22:%22https://www.googleapis.com/oauth2/v1/certs%22,%22client_x509_cert_url%22:%22https://www.googleapis.com/robot/v1/metadata/x509/)..."}
```

Frontend:

```markdown
REACT_APP_API_BASE=https://your-backend-url
```

---

### How auth flow works

- Frontend signs in using Firebase Authentication (email/password or Google).
- After sign-in, frontend obtains a Firebase ID token and calls the backend endpoint /auth/firebase with { idToken, role }.
- Backend verifies the ID token with Firebase Admin SDK and creates or updates the user record (stores role).
- For protected API calls, frontend must include Authorization: Bearer <idToken> header. Backend will verify it.
