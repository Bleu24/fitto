import { useState, useEffect } from 'react';
import ExerciseSearch from './ExerciseSearch';
import ExerciseEntryCard from './ExerciseEntryCard';
import SummaryCard from './SummaryCard';

const ExerciseLog = () => {
  const [exerciseLog, setExerciseLog] = useState([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const [tdee, setTDEE] = useState(2043); // Replace with dynamic user TDEE if available
  const [userId, setUserId] = useState(localStorage.getItem('userId')); // Assuming userId stored in localStorage

  useEffect(() => {
    fetchExerciseLog();
  }, []);

  // ✅ Fetch Exercise Log from Backend
  const fetchExerciseLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1])).id; // Extract userId from JWT

      const response = await fetch(`http://localhost:5000/api/exercise-log/user/${userId}`, {
        headers: { 'Authorization': token }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExerciseLog(Array.isArray(data) ? data : []); // Ensure it's an array
      calculateTodayCalories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching exercise log:', error);
    }
  };

  // ✅ Calculate Today's Burned Calories
  const calculateTodayCalories = (log) => {
    const today = new Date().toISOString().split('T')[0];
    const validLog = Array.isArray(log) ? log : []; // Default to empty array if invalid

    const total = validLog
      .filter(entry => entry.date && entry.date.startsWith(today))
      .reduce((sum, entry) => sum + (entry.caloriesBurned || 0), 0);

    setTodayCalories(total);
  };

  // ✅ Handle Adding New Exercise
  const handleAddExercise = async (newExercise) => {
    try {
      const response = await fetch('http://localhost:5000/api/exercise-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify({
          ...newExercise,
          userId: userId, // ✅ Associate exercise with user
        }),
      });

      if (response.ok) {
        const savedExercise = await response.json();
        setExerciseLog(prev => [...prev, savedExercise]);
        setTodayCalories(prev => prev + savedExercise.caloriesBurned);
      } else {
        console.error('Failed to add exercise');
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <>
      {/* ✅ HEADER COMPONENT */}
      <header className="w-full h-16 flex justify-between items-center py-4 px-8 bg-blue-800 shadow-lg fixed top-0 left-0 z-10 text-white">
        <h1 className="text-4xl font-bold"><a href="/">Fitto</a></h1>
        <nav className="space-x-6 flex items-center">
          <a href="/" className="hover:text-orange-400 text-lg">Home</a>
          <a href="/dashboard" className="hover:text-orange-400 text-lg">Dashboard</a>
          <a href="/food-log" className="hover:text-orange-400 text-lg">Food Log</a>
          <a href="/support" className="hover:text-orange-400 text-lg">Support</a>
        </nav>
      </header>

      {/* ✅ MAIN CONTENT */}
      <div className="p-6 bg-gray-50 min-h-screen pt-20"> {/* pt-20 to offset fixed header */}
        <h1 className="text-3xl font-bold mb-4">Exercise Log</h1>

        {/* 🔍 Exercise Search with List Selection */}
        <ExerciseSearch onAddExercise={handleAddExercise} />

        {/* 📊 Summary Card with TDEE and Burned Calories */}
        <SummaryCard
          todayCalories={todayCalories}
          tdee={tdee}
        />

        {/* 📋 List of Exercises */}
        <div className="mt-4">
          {exerciseLog.length > 0 ? (
            exerciseLog.map((exercise) => (
              <ExerciseEntryCard
                key={exercise._id}
                exercise={exercise}
                onUpdate={fetchExerciseLog}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 mt-6">
              <p>No exercises logged yet. Start by adding your first exercise above! 💪</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExerciseLog;
