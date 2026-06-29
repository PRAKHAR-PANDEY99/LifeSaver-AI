# 🚀 LifeSaver AI — The Context-Aware AI Productivity Engine

> **A smart, predictive, and energy-aware cognitive companion built for Hackathons.**  
> *Never miss a critical commitment again. LifeSaver AI doesn't just list your tasks—it dynamically shields them.*

---

## 📌 Project Overview
**LifeSaver AI** is an advanced full-stack productivity companion designed to combat burnout, analysis paralysis, and deadline slips. Unlike traditional "to-do list" managers that treat tasks as static text strings, LifeSaver AI analyzes task complexity, deadline proximity, and your personal biological energy levels to construct an adaptive daily schedule. 

By leveraging **Gemini AI**, **MongoDB Atlas**, and a fluid, modern **React** interface, the application actively predicts completion risks, breaks down complex goals into micro-steps, and offers a specialized **Emergency Last-Minute Mode** to triage your workload when schedules overlap or deadlines loom dangerously close.

---

## 💔 The Problem Statement
Modern professionals and students face an unprecedented volume of commitments. Existing tools fail because:
1. **Context Blindness:** They do not account for physical/cognitive fatigue or the time of day when a user is most productive.
2. **Delayed Alerts:** They notify you *when* a task is due, not when you are *on track to miss it*.
3. **Overwhelm & Friction:** Huge goals are entered as single blocks, causing analysis paralysis and procrastination.
4. **Static Schedules:** When an unexpected event derails your day, traditional calendars break, leaving you to manually re-arrange everything.

---

## 🛡️ The Solution: LifeSaver AI
LifeSaver AI serves as a **dynamic cognitive shield** that translates your intentions into actionable, stress-aware schedules. It tracks your daily biological energy curves, evaluates real-time risk, and acts as an assistant that steps in to guide you. If you get overwhelmed, the application initiates **Emergency Mode** to mute non-essential goals (like long-term habits) and clear a distraction-free path to rescue your critical deadlines.

---

## ✨ Key Features

### 🧠 1. AI Task Prioritization & Breakdown
When you enter a large or ambiguous task (e.g., *"Finish Algorithms Assignment"*), Gemini AI analyzes the title, estimates the total time and cognitive energy required, and automatically decomposes it into a list of sequenced subtasks complete with individual durations.

### 📅 2. Biological Energy Smart Scheduling
Configure your peak focus hours (e.g., Morning, Afternoon, Evening). The application schedules high-cognitive-load tasks during your peak energy windows, and routes low-energy tasks (like paying bills) to your fatigue dips.

### 📈 3. Predictive Deadline Risk Assessment
Our algorithm continuously calculates:
$$\text{Risk Level} = f(\text{Time to Deadline}, \text{Remaining Subtasks}, \text{Cognitive Fatigue})$$
It flags tasks as **Low**, **Medium**, or **High** risk, accompanied by an AI-generated warning (e.g., *"You traditionally take 40% longer on this topic"*) and an actionable recovery step.

### 🚨 4. Emergency Last-Minute Mode
When multiple High-Risk tasks threaten your schedule:
- Non-essential activities and habit reminders are temporarily paused/hidden.
- The user interface transforms into a high-focus, distraction-free cockpit.
- Gemini AI crafts an hourly, granular recovery playbook to get you across the finish line safely.

### 🎙️ 5. Context-Aware Voice Input & Chat Copilot
Input tasks naturally using voice commands (e.g., *"I need to review chapter 4 before tomorrow night at 8 PM"*). The natural language processing engine parses the title, sets the category, extracts the deadline, and updates the database instantly.

### 🔄 6. Smart Overdue Auto-Rescheduling
If a task crosses its deadline without completion, LifeSaver AI detects the breach, analyzes remaining scheduling buffers, and seamlessly replans it into your next optimal energy window without messy manual adjustments.

### 📊 7. Habit Tracking & Cognitive Analytics
Build micro-routines with an elegant streak tracker. The system provides adaptive recommendations (e.g., *"You have a 100% completion rate for breathing exercises on high-stress days. Keep doing it at 3:00 PM"*).

### 🔍 8. Deep Weekly Review
Compiles historical completion rates, analyzes your main procrastination triggers, identifies your peak productive hours, and generates a personalized behavioral summary report.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 (Vite, TypeScript, ES Modules)
- **Styling & Animation:** Tailwind CSS, Framer Motion (for fluid transitions and reactive micro-interactions)
- **Data Visualization:** Recharts (high-performance vector graphs for productivity curves)
- **Backend Runtime:** Node.js, Express (TypeScript compilation bundled cleanly via `esbuild`)
- **Database System:** MongoDB Atlas (Cloud Database)
- **Object Data Modeling (ODM):** Mongoose
- **AI Integration:** Google Gemini API via the modern `@google/genai` TypeScript SDK

---

## 🗄️ Database Collections (Mongoose Schemas)

The database structure maps your data directly to MongoDB Atlas. Surrounding string IDs are preserved as primary keys to guarantee instant, zero-latency client-server synchronization.

```
┌────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                     │
└──────────────────────────┬─────────────────────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Users   │         │  Tasks   │         │  Habits  │
└──────────┘         └──────────┘         └──────────┘
      │                    │                    │
      └────────────────────┼────────────────────┘
                           ▼
                 ┌──────────────────┐
                 │    Schedules     │
                 └──────────────────┘
                           ▼
                 ┌──────────────────┐
                 │  Weekly Reviews  │
                 └──────────────────┘
```

### 1. `Users`
Tracks user settings, personalized peak energy performance curves, and daily completion goals.
```typescript
{
  _id: String,                  // Unique identifier (e.g., "default_user")
  email: String,                // Unique account email
  name: String,                 // User profile display name
  avatarUrl: String,            // User avatar picture link
  joinedAt: String,             // ISO Timestamp of sign-up
  preferences: {
    dailyGoalCount: Number,     // Target number of tasks to complete daily
    peakEnergyTime: String      // "morning" | "afternoon" | "evening"
  }
}
```

### 2. `Tasks`
Houses primary work units, dynamic subtask trees, risk metrics, and AI breakdown advice.
```typescript
{
  _id: String,                  // Unique Task ID
  userId: String,               // Foreign key to Users
  title: String,                // Task heading
  description: String,          // Detailed objectives
  category: String,             // "Study" | "Work" | "Bills" | "Personal" etc.
  deadline: String,             // ISO Timestamp of due date
  priority: String,             // "Low" | "Medium" | "High"
  status: String,               // "Pending" | "Completed"
  energyRequired: String,       // "Low" | "Medium" | "High"
  scheduledTime: String,        // Allocated schedule slot (ISO Timestamp)
  durationMinutes: Number,      // Estimated completion duration
  subtasks: [{                  // Interactive subtask breakdown list
    id: String,
    title: String,
    completed: Boolean,
    durationMinutes: Number
  }],
  riskLevel: String,            // AI-calculated: "Low" | "Medium" | "High"
  riskReason: String,           // AI contextual explanation of risk
  suggestedAction: String,      // AI recommendation for mitigation
  whySuggested: String,         // Logic behind scheduling slot
  completedAt: String,          // ISO Timestamp of completion
  overdueReplanned: Boolean     // Flag tracking automatic rescheduling
}
```

### 3. `Habits`
Stores physical and mental wellness routines, current and maximum streaks, and compliance history.
```typescript
{
  _id: String,                  // Unique Habit ID
  userId: String,               // Foreign key to Users
  title: String,                // Habit title (e.g., "Deep Breathing")
  description: String,          // Instructions or benefits
  frequency: String,            // "daily" | "weekly"
  streak: Number,               // Current consecutive completion streak
  maxStreak: Number,            // Highest streak recorded
  history: [{                   // Log of daily submissions
    date: String,               // "YYYY-MM-DD"
    completed: Boolean
  }],
  createdAt: String,            // ISO creation timestamp
  aiSuggestion: String          // Targeted behavioral recommendation
}
```

### 4. `Schedules`
Chronological daily timelines mapping specific tasks to hours, tracking Emergency Mode overrides.
```typescript
{
  _id: String,                  // Unique Schedule ID
  userId: String,               // Foreign key to Users
  date: String,                 // Target date ("YYYY-MM-DD")
  energyLevel: String,          // Overall daily energy expectation
  blocks: [{                    // Hourly timeline segments
    time: String,               // Start time "HH:MM"
    durationMinutes: Number,
    taskTitle: String,
    taskId: String,
    category: String,
    energyLevelRequired: String,
    status: String
  }],
  aiOverview: String,           // AI summary of daily load balance
  isEmergencyMode: Boolean      // Flag indicating triage UI state
}
```

### 5. `WeeklyReviews`
Aggregated weekly feedback records detailing cognitive bottlenecks and productivity suggestions.
```typescript
{
  _id: String,                  // Unique Review ID
  userId: String,               // Foreign key to Users
  weekStartDate: String,        // Start date of the weekly block ("YYYY-MM-DD")
  completedCount: Number,       // Completed task volume
  missedCount: Number,          // Uncompleted/abandoned task volume
  completionRate: Number,       // Percentage (0 - 100)
  topCategory: String,          // Category with highest activity
  productivityScore: Number,    // Aggregated rating (0 - 100)
  procrastinationTriggers: [String],  // Key behavioral patterns identified
  peakProductiveHours: String,  // Discovered peak window
  recommendations: [String],    // High-impact AI action items
  detailedAnalysis: String      // In-depth qualitative summary report
}
```

---

## 🚀 Installation & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance running on port 27017)
- A [Google AI Studio API Key](https://aistudio.google.com/) for Gemini models

### 1. Clone & Setup Directory
```bash
git clone https://github.com/your-username/lifesaver-ai.git
cd lifesaver-ai
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of your project:
```env
# MongoDB Atlas Database Connection URI
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/SmartLifeManager?retryWrites=true&w=majority"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Server Port (Defaults to 3000)
PORT=3000
```

### 4. Start the Application
Boot both the compiled Express backend and Vite development preview:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to interact with LifeSaver AI.

---

## 🔮 How the Application Works Under the Hood

### Step 1: Secure Server Connection
During start, the Express backend (`server.ts`) reads the `MONGODB_URI` environment variable, safely sanitizes credentials, and connects to MongoDB Atlas using **Mongoose**. If the database is empty, an intelligent seeder automatically populates seed accounts, demo tasks, and history logs so the application is ready to explore immediately.

### Step 2: Natural Speech Parse
Voice commands send real-time audio transcriptions to `/api/process-voice`. The backend asks Gemini AI to extract key parameters (title, deadline, importance, energy required) and formats them into a strict JSON contract.

### Step 3: Predictive Modeling
When you query your task list, the server evaluates constraints. If overlapping deadlines or heavy workloads exceed available energy buffers, tasks are instantly updated with a **High-Risk** flag.

### Step 4: Activating Emergency mode
If the triage trigger is fired, non-critical database objects are temporarily filtered out. The system refocuses its UI state, calling Gemini AI to establish an hour-by-hour crash-schedule designed to maximize completion of critical items while minimizing mental panic.

---

## 🚀 Future Improvements & Production Scale

1. **Native Calendar Integrations:** Bidirectional live syncing with Google Calendar, Outlook, and Apple Calendar.
2. **Biometric Syncing:** Wearable integration (Fitbit, Garmin, Apple Watch) to measure heart rate variability (HRV) and sleep patterns, feeding *real physical fatigue markers* into the scheduling engine.
3. **Local LLM Fallback:** WebAssembly-based offline model support (e.g., WebLLM with Gemma 2B) for absolute confidentiality and offline productivity management.
4. **Colleague Coordination:** Cooperative scheduling for study groups or corporate sprint teams, ensuring no member is allocated a high-stress task during their biological crash hours.

---

*Made with 💖 for the AI Studio Build hackathon.*
