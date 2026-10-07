

# FitPlan AI – Personalized Workout Generator 🏋️‍♂️✨

FitPlan AI is a modern, full-stack, AI-implemented fitness platform that generates personalized workout routines in real-time based on fitness goals, session durations, and user experience levels.

---

## 📌 Project Overview
Finding the right workout routine is often complicated by generic routines that don't match an individual's available time or current conditioning. **FitPlan AI** solves this with an instant, rule-based AI recommendation engine delivered through a microservices-inspired architecture:
- **React.js (Vite)** frontend with high-end fitness startup aesthetics.
- **Node.js (Express.js)** API gateway mediating requests, handling validation, and enforcing CORS policies.
- **FastAPI (Python)** rule-based personalization and recommendation engine tailoring exercise selections, set volumes, and trainer tips.

---

## 💡 Problem Statement
- **Time Constraints:** Most fitness routines require 45–60 minutes, leading busy individuals to skip workouts altogether.
- **Generic Plans:** Off-the-shelf workout apps often fail to calibrate volume, rest periods, and movement progressions according to beginner, intermediate, or advanced capabilities.
- **Overcomplicated Architectures:** Many AI projects suffer from latency and unpredictability by querying heavy LLMs or ML models for deterministic rules.

---

## 🚀 Solution
FitPlan AI delivers an ultra-fast, deterministic rule-based AI personalization engine in FastAPI, exposed securely through a Node.js Express API Gateway and consumed by a modern, responsive React interface.

Users select:
1. **Fitness Goal:** Weight Loss (cardio & HIIT), Muscle Gain (hypertrophy & bodyweight strength), General Fitness (functional stamina & mobility).
2. **Available Time:** 10 min (1 round), 20 min (2 rounds), 30 min (3 rounds), or 45 min (4 rounds).
3. **Experience Level:** Beginner, Intermediate, or Advanced.

FitPlan AI outputs an optimized routine with exact exercise names, durations/reps, target rounds, interval rest periods, and actionable trainer tips.

---

## ✨ Features
- **Deterministic Personalization Engine:** 9 distinct multi-exercise combinations with calibrated volume and time logic.
- **Three-Tier Architecture:** Complete decoupling between presentation, gateway, and recommendation layers.
- **Interactive Workout Mode:** Live checkbox tracking on each exercise card with progress bar calculation.
- **Creatine & Nutrition AI Protocol:** Interactive dosage calculator with bodyweight range slider, Fast Saturation (Loading) vs Steady state toggles, daily hydration water targets, and timeline workflow.
- **Smart Fitness Hardware & Telemetry Hub:** Biometric Heart Rate Zone calculator (Zones 1–5 based on age formula), PPG optical sensor stats, smart jump rope, and heavy knurled dumbbell showcase.
- **High-Definition Visual Design:** Commercial fitness photography featuring dumbbells, weightlifting athletes, nutrition flatlays, and connected wearables.
- **Responsive Startup UI:** Built with clean modern typography, energetic fitness green accents, soft cards, micro-animations, and mobile optimization.
- **Health Checks & Graceful Error Handling:** Dedicated `/health` and `/api/health` endpoints on both backends.

---

## 🏗️ Architecture

```
User (Browser)
     │
     ▼
┌───────────────────────────────────────────────┐
│              React.js Frontend                │
│       Vite Dev Server (Port 5173)             │
└───────────────────────┬───────────────────────┘
                        │
                        │ HTTP POST /api/generate-workout
                        ▼
┌───────────────────────────────────────────────┐
│         Node.js + Express API Gateway         │
│          Express Server (Port 5000)           │
│     - Input Schema Validation                 │
│     - CORS Security Enforcement               │
│     - FastAPI Service Proxying                │
└───────────────────────┬───────────────────────┘
                        │
                        │ HTTP POST /generate-workout
                        ▼
┌───────────────────────────────────────────────┐
│            FastAPI Python Backend             │
│            Uvicorn Server (Port 8000)         │
│     - Rule-Based Personalization Engine       │
│     - Round & Time Scaling Logic              │
│     - Exercise Catalog & Trainer Tips         │
└───────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack
- **Frontend:**
  - React 18
  - Vite 5
  - Vanilla CSS (Glassmorphism, animations, responsive grid)
- **API Gateway:**
  - Node.js (v24+)
  - Express.js (v4)
  - CORS middleware
  - Native `fetch`
- **AI / Personalization Backend:**
  - Python 3.13+
  - FastAPI
  - Uvicorn
  - Pydantic v2

---

## 📂 Project Structure

```
FitPlanAI/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       └── components/
│           ├── Navbar.jsx
│           ├── Hero.jsx
│           ├── WorkoutForm.jsx
│           └── WorkoutResult.jsx
│
├── node-backend/
│   ├── package.json
│   └── server.js
│
├── fastapi-backend/
│   ├── requirements.txt
│   └── main.py
│
├── venv/                       # Root Python Virtual Environment
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.10+ recommended)
- Git / PowerShell / Bash

### 1. Python Virtual Environment & FastAPI Dependencies
From the repository root:
```powershell
# Create venv if not already created
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install FastAPI dependencies
cd fastapi-backend
pip install -r requirements.txt
cd ..
```

### 2. Node.js Backend Dependencies
```powershell
cd node-backend
npm install
cd ..
```

### 3. Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## 🚀 Running the Project

The application runs using three terminal windows:

### Terminal 1: FastAPI Backend
```powershell
cd fastapi-backend
..\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```
- **Service URL:** `http://127.0.0.1:8000`
- **Swagger Docs:** `http://127.0.0.1:8000/docs`

### Terminal 2: Node.js API Gateway
```powershell
cd node-backend
node server.js
```
- **Service URL:** `http://127.0.0.1:5000`

### Terminal 3: React Frontend
```powershell
cd frontend
npm run dev
```
- **Application URL:** `http://localhost:5173`

---

## 📡 API Endpoints

### 1. Node.js API Gateway (`http://127.0.0.1:5000`)
- `GET /api/health` — Verifies gateway health and connection to FastAPI URL.
- `POST /api/generate-workout` — Receives client request, validates, and forwards to FastAPI.

### 2. FastAPI Personalization Engine (`http://127.0.0.1:8000`)
- `GET /health` — Returns `{"status": "healthy"}`.
- `POST /generate-workout` — Rule-based workout personalization.

#### Example Request
```json
POST /generate-workout
Content-Type: application/json

{
  "goal": "weight_loss",
  "time": 20,
  "experience": "beginner"
}
```

#### Example Response
```json
{
  "title": "Beginner Weight Loss Workout",
  "time": 20,
  "rounds": 2,
  "rest": "30 seconds",
  "experience": "beginner",
  "goal": "weight_loss",
  "exercises": [
    {
      "name": "Jumping Jacks",
      "duration": "30 sec"
    },
    {
      "name": "Bodyweight Squats",
      "duration": "12 reps"
    },
    {
      "name": "Mountain Climbers",
      "duration": "20 sec"
    },
    {
      "name": "Glute Bridges",
      "duration": "12 reps"
    },
    {
      "name": "High Knees",
      "duration": "30 sec"
    }
  ],
  "tip": "Keep your intensity steady and focus on maintaining good form."
}
```

---

## 🧪 Validation & Rule Logic

### Round Calculations
- **10 min:** 1 Round
- **20 min:** 2 Rounds
- **30 min:** 3 Rounds
- **45 min:** 4 Rounds

### Input Validation
- `goal`: Must be one of `["weight_loss", "muscle_gain", "general_fitness"]`.
- `experience`: Must be one of `["beginner", "intermediate", "advanced"]`.
- `time`: Must be one of `[10, 20, 30, 45]`.
- Invalid inputs return `HTTP 400 Bad Request` with structured error details.

---

## 🔮 Future Improvements
1. **Audio Interval Timer:** Voice-prompt countdowns for exercise and rest intervals.
2. **Video Demonstrations:** Embedded GIF / WebM demonstration animations for each exercise.
3. **Calorie & Metric Tracking:** Integration with fitness trackers (Apple HealthKit / Google Fit).
4. **Workout PDF Export:** Downloadable, printable offline workout summaries.

---

## 📄 License & Disclaimer
Workout suggestions are for general fitness purposes only. Exercise within your ability and stop if you experience pain or discomfort.
