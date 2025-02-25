import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [userData, setUserData] = useState({
    tdee: 0,
    bmr: 0,
    macros: { carbs: 0, protein: 0, fat: 0 },
    goal: 'maintain',
    rate: 0,
    targetWeight: null
  });

  const [weightLog, setWeightLog] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [foodSummary, setFoodSummary] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0
  });

  const navigate = useNavigate();

  // ✅ Fetch User Data & Weight Log & Food Log
  useEffect(() => {
    fetchUserData();
    fetchWeightLog();
    fetchFoodLog();
  }, []);

  // ✅ Fetch User Profile
  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({
          tdee: data.tdee,
          bmr: data.bmr,
          macros: {
            carbs: Math.round((data.tdee * 0.5) / 4),
            protein: Math.round((data.tdee * 0.3) / 4),
            fat: Math.round((data.tdee * 0.2) / 9)
          },
          goal: data.goal,
          rate: data.rate,
          targetWeight: data.targetWeight || null
        });
      } else {
        console.error('Failed to fetch user data');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login');
    }
  };

  // ✅ Fetch Weight Log
  const fetchWeightLog = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/user/weight-log', {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setWeightLog(data.weightLog);
      }
    } catch (error) {
      console.error('Error fetching weight log:', error);
    }
  };

  // ✅ Fetch Food Log for Calories and Macros
  const fetchFoodLog = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/user/food-log', {
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        const { totalCalories, totalCarbs, totalProtein, totalFat } = calculateFoodTotals(data.foodLog);
        setFoodSummary({
          calories: totalCalories,
          carbs: totalCarbs,
          protein: totalProtein,
          fat: totalFat
        });
      }
    } catch (error) {
      console.error('Error fetching food log:', error);
    }
  };

  // ✅ Calculate Total Calories and Macros from Food Log
  const calculateFoodTotals = (foodLog) => {
    let totalCalories = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0;

    Object.values(foodLog).forEach(mealArray => {
      mealArray.forEach(food => {
        totalCalories += food.calories;
        totalCarbs += food.carbs;
        totalProtein += food.protein;
        totalFat += food.fat;
      });
    });

    return { totalCalories, totalCarbs, totalProtein, totalFat };
  };

  // ✅ Weight Log Handlers
  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/user/weight-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ weight: newWeight })
      });

      if (response.ok) {
        const data = await response.json();
        setWeightLog(data.weightLog);
        setNewWeight('');
      }
    } catch (error) {
      console.error('Error logging weight:', error);
    }
  };

  const handleEdit = (id, weight) => {
    setEditMode(id);
    setEditWeight(weight);
  };

  const handleEditSave = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/user/weight-log/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ weight: editWeight })
      });

      if (response.ok) {
        const data = await response.json();
        setWeightLog(data.weightLog);
        setEditMode(null);
      }
    } catch (error) {
      console.error('Error editing weight:', error);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/user/weight-log/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setWeightLog(data.weightLog);
      }
    } catch (error) {
      console.error('Error deleting weight:', error);
    }
  };

  const handleTargetWeightSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/user/target-weight', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ targetWeight })
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, targetWeight: data.targetWeight }));
        setTargetWeight('');
      }
    } catch (error) {
      console.error('Error setting target weight:', error);
    }
  };

  const calculateProgress = () => {
    if (!userData.targetWeight || weightLog.length === 0) return 0;
    const currentWeight = weightLog[weightLog.length - 1].weight;
    const startWeight = weightLog[0].weight;
    const totalChange = Math.abs(startWeight - userData.targetWeight);
    const currentChange = Math.abs(currentWeight - userData.targetWeight);
    return totalChange === 0 ? 0 : ((totalChange - currentChange) / totalChange) * 100;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen pt-20">
      {/* ✅ HEADER */}
      <header className="w-full h-16 flex justify-between items-center py-4 px-8 bg-blue-800 shadow-lg fixed top-0 left-0 z-10 text-white">
        <h1 className="text-4xl font-bold"><a href="/">Fitto</a></h1>
        <nav className="space-x-6 flex items-center">
          <a href="/" className="hover:text-orange-400 text-lg">Home</a>
          <a href="/food-log" className="hover:text-orange-400 text-lg">Food Log</a>
          <a href="/support" className="hover:text-orange-400 text-lg">Support</a>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-4">Logout</button>
        </nav>
      </header>

      {/* ✅ MAIN CONTENT */}
      <h1 className="text-3xl font-bold mb-6">Your Daily Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ✅ TDEE Progress Bar */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Calories (TDEE)</h2>
          <CircularProgressbar
            value={Math.min((foodSummary.calories / userData.tdee) * 100, 100)}
            text={`${foodSummary.calories}/${Math.round(userData.tdee)} kcal`}
            styles={buildStyles({
              textColor: '#333',
              pathColor: '#3b82f6',
              trailColor: '#d1d5db',
              textSize: '10px'
            })}
          />
        </div>

        {/* ✅ Macros Progress Bars */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Macros</h2>
          <div className="grid grid-cols-3 gap-4">
            {['carbs', 'protein', 'fat'].map((macro, index) => {
              const value = foodSummary[macro];
              const goal = userData.macros[macro];
              const percentage = Math.min((value / goal) * 100, 100);

              return (
                <div key={index} className="text-center">
                  <CircularProgressbar
                    value={percentage}
                    text={`${value.toFixed(2)}g`}
                    styles={buildStyles({
                      textColor: '#333',
                      pathColor: macro === 'carbs' ? '#34d399' : macro === 'protein' ? '#60a5fa' : '#fbbf24',
                      trailColor: '#e5e7eb',
                      textSize: '12px'
                    })}
                  />
                  <p className="mt-2 capitalize">{macro}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ Target Weight Progress */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Weight Goal Progress</h2>

          {/* ✅ Display Current Target Weight Below the Title */}
          {userData.targetWeight ? (
            <p className="text-md text-gray-800">🎯 Target Weight: {userData.targetWeight} kg</p>
          ) : (
            <p className="text-md text-red-500">⚠️ No target weight set</p>
          )}

          {/* ✅ Circular Progress Bar */}
          <CircularProgressbar
            value={calculateProgress()}
            text={`${calculateProgress().toFixed(0)}%`}
            styles={buildStyles({
              textColor: '#333',
              pathColor: '#34d399',
              trailColor: '#d1d5db',
              textSize: '14px'
            })}
          />

          {/* ✅ Form to Set or Update Target Weight */}
          <form onSubmit={handleTargetWeightSubmit} className="mt-4 flex">
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="Set Target Weight (kg)"
              className="border p-2 rounded-l-lg flex-1"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg">Set</button>
          </form>
        </div>
      </div>

      {/* ✅ Weight Log with Graph */}
      <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Weight Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightLog.map(entry => ({ date: new Date(entry.date).toLocaleDateString(), weight: entry.weight }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

        {/* ✅ Weight Log CRUD */}
        <form onSubmit={handleWeightSubmit} className="mt-4 flex">
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Enter weight (kg)"
            className="border p-2 rounded-l-lg flex-1"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg">Add</button>
        </form>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Weight Log</h3>
          <ul>
            {weightLog.map((entry) => (
              <li key={entry._id} className="flex justify-between items-center border-b py-2">
                {editMode === entry._id ? (
                  <>
                    <input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="border p-1 rounded-lg"
                    />
                    <button onClick={() => handleEditSave(entry._id)} className="bg-green-500 text-white px-2 py-1 rounded-lg ml-2">Save</button>
                    <button onClick={() => setEditMode(null)} className="bg-gray-400 text-white px-2 py-1 rounded-lg ml-2">Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{new Date(entry.date).toLocaleDateString()} - {entry.weight} kg</span>
                    <div>
                      <button onClick={() => handleEdit(entry._id, entry.weight)} className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2">Edit</button>
                      <button onClick={() => handleDelete(entry._id)} className="bg-red-500 text-white px-2 py-1 rounded-lg">Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
