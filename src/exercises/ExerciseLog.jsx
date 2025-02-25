// ExerciseLog.jsx
import { useState, useEffect } from 'react';
import ExerciseSearch from './ExerciseSearch';
import ExerciseEntryCard from './ExerciseEntryCard';
import SummaryCard from './SummaryCard';

const ExerciseLog = () => {
  const [exerciseLog, setExerciseLog] = useState([]);
  const [todayCalories, setTodayCalories] = useState(0);

  useEffect(() => {
    fetchExerciseLog();
  }, []);

  const fetchExerciseLog = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/exercise-log/user/{userId}');
      const data = await response.json();
      setExerciseLog(data);
      calculateTodayCalories(data);
    } catch (error) {
      console.error('Error fetching exercise log:', error);
    }
  };

  const calculateTodayCalories = (log) => {
    const today = new Date().toISOString().split('T')[0];
    const total = log
      .filter(entry => entry.date.startsWith(today))
      .reduce((sum, entry) => sum + entry.caloriesBurned, 0);
    setTodayCalories(total);
  };

  const handleAddExercise = (newExercise) => {
    setExerciseLog(prev => [...prev, newExercise]);
    setTodayCalories(prev => prev + newExercise.caloriesBurned);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Exercise Log</h1>

      {/* 🔍 Exercise Search */}
      <ExerciseSearch onAddExercise={handleAddExercise} />

      {/* 📊 Summary of Calories Burned */}
      <SummaryCard todayCalories={todayCalories} />

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
  );
};

export default ExerciseLog;
