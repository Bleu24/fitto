import { useState, useEffect } from 'react';
import nlp from 'compromise';

const NINJAS_API_KEY = import.meta.env.VITE_REACT_APP_NINJAS_API_KEY;

const MET_VALUES = {
  running: 9.8,
  cycling: 7.5,
  walking: 3.8,
  basketball: 8.0, // ✅ Basketball included
  "stair machine": 8.8,
  swimming: 6.0,
  yoga: 3.0
};

const ExerciseSearch = ({ onAddExercise }) => {
  const [input, setInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [userWeight, setUserWeight] = useState(70); // Default weight

  // ✅ Fetch User Profile for Accurate Weight
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'Authorization': token }
        });
        if (response.ok) {
          const data = await response.json();
          setUserWeight(data.weight || 70); // Default to 70kg if user weight is unavailable
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSearch = async () => {
    const doc = nlp(input);
    const verb = doc.verbs().toGerund().out('text').toLowerCase();
    const rawInput = input.toLowerCase().trim(); // Lowercase and trim for matching

    try {
      // ✅ Call Ninjas API
      const response = await fetch(`https://api.api-ninjas.com/v1/caloriesburned?activity=${verb}`, {
        headers: { 'X-Api-Key': NINJAS_API_KEY }
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();

      if (data.length > 0) {
        // ✅ API Result Found
        setSearchResult(data[0]);
        onAddExercise({
          exerciseName: data[0].name,
          duration: data[0].duration_minutes,
          caloriesBurned: data[0].total_calories,
          date: new Date().toISOString()
        });
      } else {
        // ✅ MET Fallback if API has no results
        handleMETFallback(rawInput);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('API Error occurred. Using MET Fallback.');
      handleMETFallback(rawInput);
    }
  };

  // ✅ Improved MET Fallback with Dynamic Duration
  const handleMETFallback = (rawInput) => {
    const matchedExercise = Object.keys(MET_VALUES).find(ex => {
      const regex = new RegExp(`\\b${ex}\\b`, 'i'); // Word boundary match
      return regex.test(rawInput);
    });

    if (matchedExercise) {
      // ✅ Extract duration from input (default to 30 if not found)
      const durationMatch = rawInput.match(/(\d+)\s*(minutes|min|mins|m)/i);
      const duration = durationMatch ? parseInt(durationMatch[1], 10) : 30;

      const met = MET_VALUES[matchedExercise];
      const caloriesBurned = ((met * userWeight * 3.5) / 200) * duration;

      console.log(`MET Fallback used for ${matchedExercise}: ${caloriesBurned.toFixed(2)} kcal for ${duration} minutes`);

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
      console.error('Exercise not found in API or MET list');
      alert('Exercise not found. Please try a different term.');
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g., Basketball for 60 minutes"
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
