const ExerciseEntryCard = ({ exercise, onUpdate }) => {
    const handleDelete = async () => {
      try {
        await fetch(`http://localhost:5000/api/exercise-log/${exercise._id}`, {
          method: 'DELETE'
        });
        onUpdate();
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
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    );
  };
  
  export default ExerciseEntryCard;
  