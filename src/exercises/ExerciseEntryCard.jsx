const ExerciseEntryCard = ({ exercise, onUpdate }) => {
    const handleDeleteExercise = async (exerciseId) => {
      const token = localStorage.getItem('token'); // ✅ Ensure token is retrieved
  
      try {
        const response = await fetch(`http://localhost:5000/api/exercise-log/${exerciseId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token // ✅ Include the token
          }
        });
  
        if (response.ok) {
          console.log("Exercise deleted successfully");
          // ✅ Refresh the exercise log after deletion
          onUpdate(); // ✅ Trigger parent update function
        } else if (response.status === 403) {
          console.error('Unauthorized: Cannot delete this exercise');
        } else if (response.status === 401) {
          console.error('Unauthorized: Token is missing or invalid');
        } else {
          console.error('Failed to delete exercise');
        }
      } catch (error) {
        console.error('Error deleting exercise:', error);
      }
    };
  
    return (
      <div className="bg-white p-4 rounded shadow mb-2 flex justify-between items-center">
        <div>
          <p><strong>{exercise.exerciseName}</strong></p>
          <p>{exercise.duration} mins | {exercise.caloriesBurned.toFixed(2)} kcal</p>
          <p>{new Date(exercise.date).toLocaleString()}</p>
        </div>
        <button
          onClick={() => handleDeleteExercise(exercise._id)} // ✅ Pass exerciseId here
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    );
  };
  
  export default ExerciseEntryCard;
  