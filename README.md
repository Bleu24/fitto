# FITTO
FITTO is a fitness tracking web application that helps users monitor their daily caloric intake, exercise routines, weight progress, and nutrition goals. With an intuitive dashboard and smart data logging, FITTO makes fitness tracking seamless.

## 🚀 Features

### 🏠 Dashboard
- Displays Total Daily Energy Expenditure (TDEE) and Basal Metabolic Rate (BMR).
- Tracks macronutrients (Carbs, Protein, Fat) with real-time updates.
- Visual progress on weight tracking with an interactive graph.
- Summary of exercise calories burned.

### 🍽️ Food Log
- Log meals by categories: Breakfast, Lunch, Dinner, Snacks.
- Tracks calories and macronutrients for daily consumption.
- Provides real-time updates on total calories consumed vs. TDEE.

### 💪 Exercise Log
- Log workout sessions, including exercise name, duration, and calories burned.
- Uses Metabolic Equivalent of Task (MET) for accurate calorie expenditure estimates.
- Displays total calories burned per day.

### ⚖️ Weight Tracker
- Users can log and edit their weight history.
- A visual weight progress chart to track changes over time.
- Set a target weight goal and monitor progress with percentage completion.

### 🔒 Authentication & Security
- JWT-based authentication for secure API requests.
- User registration & login with encrypted passwords.
- Protected routes requiring authentication.

## 🛠️ Tech Stack

### 🌐 Frontend
- React (Vite) + TailwindCSS
- Recharts for data visualization
- React Circular Progressbar for visual goals

### 🔧 Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication for secure login
- bcrypt.js for password hashing
