# ORS Student Incident Tracking System — Frontend

This repository contains the React frontend for the ORS Student Incident Tracking System.

## Prerequisites

- Node 18+ and npm
- Git

## Setup instructions

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Confirm `.env` contains your backend API URL:

```env
VITE_API_URL=http://localhost/ors-backend/api
```

If your backend uses a different local URL, update this value accordingly.

### 3. Start the frontend

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 4. Test login

Use one of the role accounts below and verify the app redirects to the correct dashboard:

- OSAS
  - `maria.santos@school.edu`
  - `Passw0rd!23`
- Guidance Office
  - `noah.delgado@school.edu`
  - `Guidance123!`
- Chaplain
  - `peter.cruz@school.edu`
  - `Chaplain123!`
- Department Head
  - `elena.cruz@school.edu`
  - `Head123!`
- Teacher
  - `christian.reyes@school.edu`
  - `Teacher123!`

### 5. Verify role routing

The frontend redirects each role to its own dashboard:

- `OSAS` → `/osas`
- `Guidance Office` → `/guidance`
- `Chaplain` → `/chaplain`
- `Department Head` → `/chairperson`
- `Teacher` → `/teacher`

### 6. Protect local env files

Do not commit `.env` files.
This repo ignores:

- `.env`
- `.env.local`

If you create additional local config files, add them to `.gitignore` before committing.

## Notes for classmates

This repository only contains the frontend.
For backend setup instructions, see the backend repository README.
