import { useState } from 'react';
import nlp from 'compromise';
import dotenv from 'dotenv';

dotenv.config();

const NINJAS_API_KEY = process.env.REACT_APP_NINJAS_API_KEY;

const MET_VALUES = {
  running: 9.8,
  cycling: 7.5,
  walking: 3.8,
  "stair machine": 8.8,
  swimming: 6.0,
  yoga: 3.0
};

const ExerciseSearch = ({ onAddExercise }) => {
  const [input, setInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async () => {
    const doc = nlp(input);
    const verb = doc.verbs().toGerund().out('text');

    try {
      const response = await fetch(`https://api.api-ninjas.com/v1/caloriesburned?activity=${verb}`, {
        headers: { 'X-Api-Key': NINJAS_API_KEY }
      });
      const data = await response.json();

      if (data.length > 0) {
        setSearchResult(data[0]);
        onAddExercise({
          exerciseName: data[0].name,
          duration: data[0].duration_minutes,
          caloriesBurned: data[0].total_calories,
          date: new Date().toISOString()
        });
      } else {
        // MET Fallback
        const matchedExercise = Object.keys(MET_VALUES).find(ex => verb.includes(ex));
        if (matchedExercise) {
          const weight = 70; // Default user weight (or pull from user profile)
          const duration = 30;
          const met = MET_VALUES[matchedExercise];
          const caloriesBurned = ((met * weight * 3.5) / 200) * duration;

          onAddExercise({
            exerciseName: matchedExercise,
            duration,
            caloriesBurned,
            date: new Date().toISOString()
          });

          setSearchResult({
            name: matchedExercise,
            total_calories: caloriesBurned
          });
        } else {
          alert('Exercise not found. Please try a different term.');
        }
      }
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g., Ran 5km in 30 minutes"
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Search Exercise
      </button>

      {searchResult && (
        <div className="mt-2 p-2 bg-gray-200 rounded">
          <p><strong>Exercise:</strong> {searchResult.name}</p>
          <p><strong>Calories Burned:</strong> {searchResult.total_calories.toFixed(2)} kcal</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseSearch;
