from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="FitPlan AI Personalization Engine",
    description="Rule-based adaptive fitness recommendation engine for FitPlan AI",
    version="2.0.0"
)

# CORS configuration - Allow Node.js API gateway and local development origins
allowed_origins = [
    "http://127.0.0.1:5000",
    "http://localhost:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Custom exception handler to return 400 for validation errors as required by spec
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = exc.errors()
    msg = error_details[0]["msg"] if error_details else "Invalid request data"
    return JSONResponse(
        status_code=400,
        content={"detail": f"Validation error: {msg}"}
    )

class WorkoutRequest(BaseModel):
    goal: str
    time: int
    experience: str
    equipment: Optional[str] = "dumbbells"
    previous_muscle_group: Optional[str] = None
    energy_level: Optional[int] = 4
    soreness_level: Optional[int] = 2
    is_rest_day_candidate: Optional[bool] = False

class Exercise(BaseModel):
    name: str
    duration: str
    muscle_group: Optional[str] = "Full Body"
    sets: Optional[int] = 3
    reps: Optional[str] = "12 reps"
    rest_seconds: Optional[int] = 45
    difficulty: Optional[str] = "Moderate"
    estimated_calories: Optional[int] = 55
    instructions: Optional[str] = "Execute with controlled tempo and full range of motion."
    safety_tips: Optional[str] = "Keep spine neutral and exhale on exertion."

class WorkoutResponse(BaseModel):
    title: str
    muscle_group: Optional[str] = "Full Body"
    time: int
    rounds: int
    rest: str
    estimated_calories: Optional[int] = 280
    experience: str
    goal: str
    equipment: Optional[str] = "dumbbells"
    exercises: List[Exercise]
    tip: str
    recovery_recommendation: Optional[str] = "Drink 500ml water and refuel with post-workout protein."

# Time to Rounds Mapping
TIME_ROUND_MAPPING: Dict[int, int] = {
    10: 1,
    20: 2,
    30: 3,
    45: 4
}

# Rule-Based Workout Catalog with Rich Adaptive Metadata
WORKOUT_DATABASE: Dict[str, Dict[str, Dict[str, Any]]] = {
    "weight_loss": {
        "beginner": {
            "title": "Beginner Weight Loss Workout",
            "muscle_group": "Cardio & Full Body",
            "rest": "30 seconds",
            "estimated_calories": 210,
            "exercises": [
                {
                    "name": "Jumping Jacks",
                    "duration": "30 sec",
                    "muscle_group": "Cardio / Full Body",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 40,
                    "instructions": "Jump with feet wide and arms overhead, landing softly on the balls of your feet.",
                    "safety_tips": "Avoid stiff knees upon landing to protect joints."
                },
                {
                    "name": "Bodyweight Squats",
                    "duration": "12 reps",
                    "muscle_group": "Quadriceps & Glutes",
                    "sets": 3,
                    "reps": "12 reps",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 45,
                    "instructions": "Hinge at hips, bend knees to 90 degrees, and push through heels to stand.",
                    "safety_tips": "Keep knees tracking over toes without caving inward."
                },
                {
                    "name": "Mountain Climbers",
                    "duration": "20 sec",
                    "muscle_group": "Core & Shoulders",
                    "sets": 3,
                    "reps": "20 sec",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 40,
                    "instructions": "Hold a high plank and drive knees alternately towards chest with steady rhythm.",
                    "safety_tips": "Keep hips level with shoulders; do not pike upward."
                },
                {
                    "name": "Glute Bridges",
                    "duration": "12 reps",
                    "muscle_group": "Hamstrings & Glutes",
                    "sets": 3,
                    "reps": "12 reps",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 35,
                    "instructions": "Lie flat with knees bent, squeeze glutes, and lift hips toward ceiling.",
                    "safety_tips": "Avoid hyperextending the lower back at top."
                },
                {
                    "name": "High Knees",
                    "duration": "30 sec",
                    "muscle_group": "Cardio & Hip Flexors",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 50,
                    "instructions": "Jog in place lifting knees to hip height while pumping arms rhythmically.",
                    "safety_tips": "Maintain upright posture without leaning back."
                }
            ],
            "tip": "Keep your intensity steady and focus on maintaining good form."
        },
        "intermediate": {
            "title": "Intermediate Weight Loss Workout",
            "muscle_group": "HIIT Conditioning",
            "rest": "30 seconds",
            "estimated_calories": 320,
            "exercises": [
                {
                    "name": "Jumping Jacks",
                    "duration": "45 sec",
                    "muscle_group": "Cardio / Full Body",
                    "sets": 3,
                    "reps": "45 sec",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 60,
                    "instructions": "Maintain high cadence jumping jacks with full overhead arm extension.",
                    "safety_tips": "Land light and absorb impact through ankles."
                },
                {
                    "name": "Squats",
                    "duration": "15 reps",
                    "muscle_group": "Quadriceps & Glutes",
                    "sets": 3,
                    "reps": "15 reps",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 65,
                    "instructions": "Lower down below parallel with chest proud, drive up aggressively.",
                    "safety_tips": "Brace core throughout the entire descent."
                },
                {
                    "name": "Mountain Climbers",
                    "duration": "30 sec",
                    "muscle_group": "Core & Cardio",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 60,
                    "instructions": "Rapid alternating knee drives with hands firmly stacked under shoulders.",
                    "safety_tips": "Breathe rhythmically to maintain lactate clearance."
                },
                {
                    "name": "Lunges",
                    "duration": "12 reps each leg",
                    "muscle_group": "Glutes & Quads",
                    "sets": 3,
                    "reps": "12 each leg",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 70,
                    "instructions": "Step forward with torso upright, lowering back knee 1 inch off floor.",
                    "safety_tips": "Maintain 90-degree angles in both knees."
                },
                {
                    "name": "High Knees",
                    "duration": "45 sec",
                    "muscle_group": "Cardio & Calves",
                    "sets": 3,
                    "reps": "45 sec",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 65,
                    "instructions": "Drive knees high at 85% sprint speed for maximal calorie burn.",
                    "safety_tips": "Keep core tight and stay on balls of feet."
                }
            ],
            "tip": "Push through the burn during intervals and stay well hydrated."
        },
        "advanced": {
            "title": "Advanced Weight Loss HIIT Workout",
            "muscle_group": "High-Metabolic Circuit",
            "rest": "20 seconds",
            "estimated_calories": 440,
            "exercises": [
                {
                    "name": "Burpees",
                    "duration": "45 sec",
                    "muscle_group": "Full Body / Cardio",
                    "sets": 4,
                    "reps": "45 sec",
                    "rest_seconds": 20,
                    "difficulty": "Advanced",
                    "estimated_calories": 95,
                    "instructions": "Drop into pushup, snap feet to hands, and jump explosively with arms overhead.",
                    "safety_tips": "Do not sag lower back at bottom of pushup."
                },
                {
                    "name": "Jump Squats",
                    "duration": "15 reps",
                    "muscle_group": "Explosive Lower Body",
                    "sets": 4,
                    "reps": "15 reps",
                    "rest_seconds": 20,
                    "difficulty": "Advanced",
                    "estimated_calories": 85,
                    "instructions": "Squat deeply and launch straight up with maximum vertical jump.",
                    "safety_tips": "Land softly with bent knees into next repetition."
                },
                {
                    "name": "Mountain Climbers",
                    "duration": "45 sec",
                    "muscle_group": "Core & Shoulder Endurance",
                    "sets": 4,
                    "reps": "45 sec",
                    "rest_seconds": 20,
                    "difficulty": "Advanced",
                    "estimated_calories": 85,
                    "instructions": "Sustained high-velocity knee drives with locked torso stability.",
                    "safety_tips": "Press palms hard into floor to engage serratus anterior."
                },
                {
                    "name": "Walking Lunges",
                    "duration": "15 reps each leg",
                    "muscle_group": "Glutes & Hamstrings",
                    "sets": 4,
                    "reps": "15 each leg",
                    "rest_seconds": 20,
                    "difficulty": "Advanced",
                    "estimated_calories": 85,
                    "instructions": "Continuous forward traveling lunges with upright posture.",
                    "safety_tips": "Keep front shin vertical upon each step."
                },
                {
                    "name": "High Knees",
                    "duration": "60 sec",
                    "muscle_group": "Peak Anaerobic Output",
                    "sets": 4,
                    "reps": "60 sec",
                    "rest_seconds": 20,
                    "difficulty": "Advanced",
                    "estimated_calories": 90,
                    "instructions": "Max sprint effort knees to chest for final metabolic burnout.",
                    "safety_tips": "Maintain rhythmic nasal-oral respiration."
                }
            ],
            "tip": "Maintain peak heart rate with explosive movements and short transitions."
        }
    },
    "muscle_gain": {
        "beginner": {
            "title": "Beginner Muscle Building Blueprint",
            "muscle_group": "Full Body Hypertrophy",
            "rest": "45 seconds",
            "estimated_calories": 240,
            "exercises": [
                {
                    "name": "Incline / Knee Push-ups",
                    "duration": "10 reps",
                    "muscle_group": "Chest & Triceps",
                    "sets": 3,
                    "reps": "10 reps",
                    "rest_seconds": 45,
                    "difficulty": "Beginner",
                    "estimated_calories": 45,
                    "instructions": "Lower chest with 45-degree elbow tuck, pause briefly, press to lockout.",
                    "safety_tips": "Keep glutes squeezed and body in straight line."
                },
                {
                    "name": "Bodyweight Squats (Slow Tempo)",
                    "duration": "12 reps",
                    "muscle_group": "Quadriceps & Glutes",
                    "sets": 3,
                    "reps": "12 reps",
                    "rest_seconds": 45,
                    "difficulty": "Beginner",
                    "estimated_calories": 50,
                    "instructions": "3 seconds eccentric descent, 1 second pause at bottom, rise smoothly.",
                    "safety_tips": "Keep weight distributed across midfoot and heel."
                },
                {
                    "name": "Bench / Chair Dips",
                    "duration": "10 reps",
                    "muscle_group": "Triceps & Anterior Deltoid",
                    "sets": 3,
                    "reps": "10 reps",
                    "rest_seconds": 45,
                    "difficulty": "Beginner",
                    "estimated_calories": 45,
                    "instructions": "Grip chair edge, lower body until elbows hit 90 degrees, press upward.",
                    "safety_tips": "Keep back close to the bench; do not shrug shoulders."
                },
                {
                    "name": "Glute Bridges (Hold at top)",
                    "duration": "12 reps",
                    "muscle_group": "Gluteus Maximus",
                    "sets": 3,
                    "reps": "12 reps",
                    "rest_seconds": 45,
                    "difficulty": "Beginner",
                    "estimated_calories": 45,
                    "instructions": "Lift hips and hold for 2 seconds at peak contraction.",
                    "safety_tips": "Drive through heels, not toes."
                },
                {
                    "name": "Forearm Plank Hold",
                    "duration": "30 sec",
                    "muscle_group": "Transverse Abdominis",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 45,
                    "difficulty": "Beginner",
                    "estimated_calories": 35,
                    "instructions": "Rest on forearms, pull belly button inward, hold rock solid.",
                    "safety_tips": "Avoid sagging hips or hiking glutes into the air."
                }
            ],
            "tip": "Focus on time under tension and squeeze your muscles at the top of each rep."
        },
        "intermediate": {
            "title": "Intermediate Hypertrophy Circuit",
            "muscle_group": "Chest, Legs & Core",
            "rest": "45 seconds",
            "estimated_calories": 340,
            "exercises": [
                {
                    "name": "Standard Push-ups",
                    "duration": "15 reps",
                    "muscle_group": "Pectorals & Triceps",
                    "sets": 3,
                    "reps": "15 reps",
                    "rest_seconds": 45,
                    "difficulty": "Intermediate",
                    "estimated_calories": 65,
                    "instructions": "Chest to floor, flare elbows at 45 degrees, explode to full lockout.",
                    "safety_tips": "Maintain rigid core tension throughout."
                },
                {
                    "name": "Bulgarian Split Squats",
                    "duration": "12 reps each leg",
                    "muscle_group": "Quads & Glute Medius",
                    "sets": 3,
                    "reps": "12 each leg",
                    "rest_seconds": 45,
                    "difficulty": "Intermediate",
                    "estimated_calories": 75,
                    "instructions": "Elevate rear foot on bench, descend until back knee approaches floor.",
                    "safety_tips": "Keep front knee stable without wobbling."
                },
                {
                    "name": "Diamond Push-ups",
                    "duration": "10 reps",
                    "muscle_group": "Triceps & Inner Chest",
                    "sets": 3,
                    "reps": "10 reps",
                    "rest_seconds": 45,
                    "difficulty": "Intermediate",
                    "estimated_calories": 65,
                    "instructions": "Form diamond shape with thumbs and index fingers under sternum, press.",
                    "safety_tips": "Tuck elbows tight to your sides."
                },
                {
                    "name": "Walking Lunges",
                    "duration": "14 reps each leg",
                    "muscle_group": "Quadriceps & Hamstrings",
                    "sets": 3,
                    "reps": "14 each leg",
                    "rest_seconds": 45,
                    "difficulty": "Intermediate",
                    "estimated_calories": 70,
                    "instructions": "Long stride lunges focusing on deep stretch and quad engagement.",
                    "safety_tips": "Keep torso tall with proud chest."
                },
                {
                    "name": "Extended Plank Hold",
                    "duration": "45 sec",
                    "muscle_group": "Deep Core Stability",
                    "sets": 3,
                    "reps": "45 sec",
                    "rest_seconds": 45,
                    "difficulty": "Intermediate",
                    "estimated_calories": 45,
                    "instructions": "Place hands 6 inches in front of shoulders to amplify abdominal leverage.",
                    "safety_tips": "Tuck pelvis slightly to maintain lumbar safety."
                }
            ],
            "tip": "Control the eccentric (lowering) phase for maximum muscle fiber recruitment."
        },
        "advanced": {
            "title": "Advanced Strength & Power Session",
            "muscle_group": "Advanced Hypertrophy & Overload",
            "rest": "60 seconds",
            "estimated_calories": 460,
            "exercises": [
                {
                    "name": "Archer Push-ups",
                    "duration": "12 reps",
                    "muscle_group": "Unilateral Chest & Shoulders",
                    "sets": 4,
                    "reps": "12 reps",
                    "rest_seconds": 60,
                    "difficulty": "Advanced",
                    "estimated_calories": 90,
                    "instructions": "Shift bodyweight onto one arm while extending the other straight out sideways.",
                    "safety_tips": "Control descent to prevent shoulder joint strain."
                },
                {
                    "name": "Pistol Squats (Single Leg)",
                    "duration": "8 reps each leg",
                    "muscle_group": "Single Leg Strength & Balance",
                    "sets": 4,
                    "reps": "8 each leg",
                    "rest_seconds": 60,
                    "difficulty": "Advanced",
                    "estimated_calories": 95,
                    "instructions": "Squat down on one leg with opposite leg extended horizontally in front.",
                    "safety_tips": "Maintain ankle dorsiflexion and use counterweight if needed."
                },
                {
                    "name": "Decline Push-ups",
                    "duration": "15 reps",
                    "muscle_group": "Upper Pectorals & Front Delts",
                    "sets": 4,
                    "reps": "15 reps",
                    "rest_seconds": 60,
                    "difficulty": "Advanced",
                    "estimated_calories": 85,
                    "instructions": "Elevate feet on chair/bench and press chest away from floor.",
                    "safety_tips": "Do not flare elbows wider than 45 degrees."
                },
                {
                    "name": "Jump Lunges with Isometric Pause",
                    "duration": "12 reps each leg",
                    "muscle_group": "Explosive Hamstrings & Quads",
                    "sets": 4,
                    "reps": "12 each leg",
                    "rest_seconds": 60,
                    "difficulty": "Advanced",
                    "estimated_calories": 95,
                    "instructions": "Hold bottom lunge for 1 second, then jump explosively into scissor switch.",
                    "safety_tips": "Land softly with balanced knee distribution."
                },
                {
                    "name": "Commando Planks",
                    "duration": "60 sec",
                    "muscle_group": "Total Core & Shoulder Endurance",
                    "sets": 4,
                    "reps": "60 sec",
                    "rest_seconds": 60,
                    "difficulty": "Advanced",
                    "estimated_calories": 80,
                    "instructions": "Alternate pressing up from forearms to palms without excessive hip swaying.",
                    "safety_tips": "Widen feet slightly to anchor hip stability."
                }
            ],
            "tip": "Maximize progressive overload with deep pauses and strict range of motion."
        }
    },
    "general_fitness": {
        "beginner": {
            "title": "Beginner Daily Vitality Routine",
            "muscle_group": "Full Body Mobility & Stamina",
            "rest": "30 seconds",
            "estimated_calories": 200,
            "exercises": [
                {
                    "name": "Jumping Jacks",
                    "duration": "30 sec",
                    "muscle_group": "Cardio Warmup",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 40,
                    "instructions": "Smooth rhythmic jumping jacks to elevate heart rate.",
                    "safety_tips": "Stay light on feet and breathe steadily."
                },
                {
                    "name": "Bodyweight Squats",
                    "duration": "10 reps",
                    "muscle_group": "Hips & Legs",
                    "sets": 3,
                    "reps": "10 reps",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 40,
                    "instructions": "Sit back into comfortable depth, keep chest elevated.",
                    "safety_tips": "Track knees aligned over 2nd toe."
                },
                {
                    "name": "Wall / Knee Push-ups",
                    "duration": "10 reps",
                    "muscle_group": "Upper Body Push",
                    "sets": 3,
                    "reps": "10 reps",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 40,
                    "instructions": "Controlled pushing movement against wall or from knees.",
                    "safety_tips": "Avoid flaring elbows perpendicular to body."
                },
                {
                    "name": "Bird Dog",
                    "duration": "10 reps each side",
                    "muscle_group": "Spinal Stabilizers & Glutes",
                    "sets": 3,
                    "reps": "10 each side",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 35,
                    "instructions": "From all fours, extend opposite arm and leg in line with spine.",
                    "safety_tips": "Do not rotate hips or arch lower back."
                },
                {
                    "name": "Forearm Plank",
                    "duration": "20 sec",
                    "muscle_group": "Core Belt",
                    "sets": 3,
                    "reps": "20 sec",
                    "rest_seconds": 30,
                    "difficulty": "Beginner",
                    "estimated_calories": 30,
                    "instructions": "Hold straight posture with forearms parallel.",
                    "safety_tips": "Focus on smooth nasal breathing."
                }
            ],
            "tip": "Build consistency and listen to your body while mastering core movement patterns."
        },
        "intermediate": {
            "title": "Intermediate Functional Fitness Plan",
            "muscle_group": "Functional Athletic Stamina",
            "rest": "30 seconds",
            "estimated_calories": 310,
            "exercises": [
                {
                    "name": "High Knees",
                    "duration": "30 sec",
                    "muscle_group": "Cardiovascular Conditioning",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 55,
                    "instructions": "Rapid knee drives with upright core alignment.",
                    "safety_tips": "Land softly on balls of feet."
                },
                {
                    "name": "Alternating Reverse Lunges",
                    "duration": "12 reps each leg",
                    "muscle_group": "Glutes & Quads",
                    "sets": 3,
                    "reps": "12 each leg",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 65,
                    "instructions": "Step backward and drop knee, preserving front shin verticality.",
                    "safety_tips": "Easier on patella tendons than forward lunges."
                },
                {
                    "name": "Standard Push-ups",
                    "duration": "12 reps",
                    "muscle_group": "Chest & Serratus",
                    "sets": 3,
                    "reps": "12 reps",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 60,
                    "instructions": "Controlled tempo with full scapular retraction and protraction.",
                    "safety_tips": "Lock hips with abdominal brace."
                },
                {
                    "name": "Russian Twists",
                    "duration": "20 reps",
                    "muscle_group": "Obliques & Rotational Core",
                    "sets": 3,
                    "reps": "20 reps",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 55,
                    "instructions": "Sit with knees bent, rotate torso side-to-side with tight core.",
                    "safety_tips": "Rotate through thoracic spine rather than lower back."
                },
                {
                    "name": "Superman Hold",
                    "duration": "30 sec",
                    "muscle_group": "Erector Spinae & Posterior Chain",
                    "sets": 3,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "difficulty": "Intermediate",
                    "estimated_calories": 40,
                    "instructions": "Lie prone and lift arms and legs off floor, engaging posterior chain.",
                    "safety_tips": "Keep neck neutral; look at the mat."
                }
            ],
            "tip": "Maintain steady breathing and keep your core active throughout all movements."
        },
        "advanced": {
            "title": "Advanced Total-Body Conditioning",
            "muscle_group": "High-Performance Functional Fitness",
            "rest": "30 seconds",
            "estimated_calories": 420,
            "exercises": [
                {
                    "name": "Burpees",
                    "duration": "30 sec",
                    "muscle_group": "Dynamic Full Body",
                    "sets": 4,
                    "reps": "30 sec",
                    "rest_seconds": 30,
                    "difficulty": "Advanced",
                    "estimated_calories": 85,
                    "instructions": "Fluid chest-to-deck burpees with explosive vertical leap.",
                    "safety_tips": "Pace breathing across each rep."
                },
                {
                    "name": "Jump Lunges",
                    "duration": "12 reps each leg",
                    "muscle_group": "Plyometric Lower Body",
                    "sets": 4,
                    "reps": "12 each leg",
                    "rest_seconds": 30,
                    "difficulty": "Advanced",
                    "estimated_calories": 85,
                    "instructions": "Continuous explosive jumping split squats.",
                    "safety_tips": "Absorb landing impact through glutes and quads."
                },
                {
                    "name": "Spiderman Push-ups",
                    "duration": "12 reps",
                    "muscle_group": "Chest, Triceps & Obliques",
                    "sets": 4,
                    "reps": "12 reps",
                    "rest_seconds": 30,
                    "difficulty": "Advanced",
                    "estimated_calories": 80,
                    "instructions": "As you descend into pushup, bring one knee out to touch your elbow.",
                    "safety_tips": "Alternate sides with high core stability."
                },
                {
                    "name": "Bicycle Crunches",
                    "duration": "30 reps",
                    "muscle_group": "Rectus & Obliques",
                    "sets": 4,
                    "reps": "30 reps",
                    "rest_seconds": 30,
                    "difficulty": "Advanced",
                    "estimated_calories": 75,
                    "instructions": "Slow rotational crunches bringing opposite elbow to knee.",
                    "safety_tips": "Avoid pulling on back of head with hands."
                },
                {
                    "name": "Hollow Body Hold",
                    "duration": "45 sec",
                    "muscle_group": "Gymnastic Core Compression",
                    "sets": 4,
                    "reps": "45 sec",
                    "rest_seconds": 30,
                    "difficulty": "Advanced",
                    "estimated_calories": 65,
                    "instructions": "Glue lumbar spine to floor, extend arms and legs low in banana shape.",
                    "safety_tips": "If lower back lifts, tuck knees slightly to maintain contact."
                }
            ],
            "tip": "Balance cardiovascular endurance, functional strength, and core stability."
        }
    }
}

VALID_GOALS = set(WORKOUT_DATABASE.keys())
VALID_EXPERIENCES = {"beginner", "intermediate", "advanced"}
VALID_TIMES = set(TIME_ROUND_MAPPING.keys())

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/generate-workout", response_model=WorkoutResponse)
def generate_workout(request: WorkoutRequest):
    # Normalize inputs
    goal = request.goal.strip().lower() if isinstance(request.goal, str) else ""
    experience = request.experience.strip().lower() if isinstance(request.experience, str) else ""
    time = request.time

    # Validate inputs according to requirements
    if goal not in VALID_GOALS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid goal '{request.goal}'. Allowed values: {sorted(list(VALID_GOALS))}"
        )

    if experience not in VALID_EXPERIENCES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid experience '{request.experience}'. Allowed values: {sorted(list(VALID_EXPERIENCES))}"
        )

    if time not in VALID_TIMES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid time '{request.time}'. Allowed values: {sorted(list(VALID_TIMES))}"
        )

    # Time logic: 10m -> 1 round, 20m -> 2 rounds, 30m -> 3 rounds, 45m -> 4 rounds
    rounds = TIME_ROUND_MAPPING[time]

    # Retrieve workout template from personalization engine
    workout_template = WORKOUT_DATABASE[goal][experience]

    # Adaptive adjustments based on user state
    exercises_data = []
    energy_factor = 1.0
    if request.energy_level and request.energy_level <= 2:
        energy_factor = 0.8  # Slight volume drop if tired
    elif request.energy_level and request.energy_level == 5:
        energy_factor = 1.15  # Peak power bonus

    tip_text = workout_template["tip"]
    recovery_tip = "Stay well hydrated with electrolytes and aim for 7-8 hours of restful sleep."

    # Soreness adaptation
    if request.soreness_level and request.soreness_level >= 4:
        tip_text += " [Adaptive Note: High soreness detected; prioritize mobility and controlled tempo today.]"
        recovery_tip = "Take extra time for static foam rolling and light stretching."

    # Previous muscle group adaptation
    if request.previous_muscle_group and "Chest" in request.previous_muscle_group and "Chest" in workout_template.get("muscle_group", ""):
        recovery_tip = f"Notice: You trained {request.previous_muscle_group} recently. Today emphasizes complementary stabilizers to prevent fatigue."

    for ex in workout_template["exercises"]:
        ex_copy = dict(ex)
        # Adapt sets if user is on higher rounds
        ex_copy["sets"] = max(2, min(5, rounds))
        exercises_data.append(Exercise(**ex_copy))

    # Scale estimated calories by time and rounds
    est_cals = int(workout_template.get("estimated_calories", 250) * (time / 20.0) * energy_factor)

    return WorkoutResponse(
        title=workout_template["title"],
        muscle_group=workout_template.get("muscle_group", "Full Body"),
        time=time,
        rounds=rounds,
        rest=workout_template["rest"],
        estimated_calories=est_cals,
        experience=experience,
        goal=goal,
        equipment=request.equipment or "dumbbells",
        exercises=exercises_data,
        tip=tip_text,
        recovery_recommendation=recovery_tip
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
