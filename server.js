const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ weeks: [] }, null, 2));
}

// Helper to read data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { weeks: [] };
  }
};

// Helper to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

// Check for overlapping dates
const hasOverlappingWeek = (weeks, newStartDate, newEndDate, excludeId = null) => {
  const newStart = new Date(newStartDate).getTime();
  const newEnd = new Date(newEndDate).getTime();

  return weeks.some(week => {
    if (excludeId && week.id === excludeId) return false;
    
    // Parse existing week dates from the dates string (format: "dd/mm/yy - dd/mm/yy")
    const dateMatch = week.dates.match(/(\d{2})\/(\d{2})\/(\d{2})/g);
    if (!dateMatch || dateMatch.length < 2) return false;
    
    const [startDay, startMonth, startYear] = dateMatch[0].split('/').map(Number);
    const [endDay, endMonth, endYear] = dateMatch[1].split('/').map(Number);
    
    const existingStart = new Date(`20${startYear}`, startMonth - 1, startDay).getTime();
    const existingEnd = new Date(`20${endYear}`, endMonth - 1, endDay).getTime();
    
    // Check for overlap
    return (newStart <= existingEnd && newEnd >= existingStart);
  });
};

// GET all weeks
app.get('/api/weeks', (req, res) => {
  const data = readData();
  res.json(data.weeks);
});

// POST new week
app.post('/api/weeks', (req, res) => {
  const { title, startDate, endDate, description } = req.body;
  
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }

  const data = readData();
  
  // Check for overlapping weeks
  if (hasOverlappingWeek(data.weeks, startDate, endDate)) {
    return res.status(409).json({ error: 'A week already exists for these dates' });
  }

  // Format dates as dd/mm/yy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const newWeek = {
    id: Date.now(),
    title,
    dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    description: description || '',
    tasks: []
  };

  data.weeks.push(newWeek);
  
  if (writeData(data)) {
    res.status(201).json(newWeek);
  } else {
    res.status(500).json({ error: 'Failed to save week' });
  }
});

// DELETE week
app.delete('/api/weeks/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  
  const weekIndex = data.weeks.findIndex(w => w.id === parseInt(id));
  if (weekIndex === -1) {
    return res.status(404).json({ error: 'Week not found' });
  }
  
  data.weeks.splice(weekIndex, 1);
  
  if (writeData(data)) {
    res.json({ message: 'Week deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete week' });
  }
});

// POST new task to week
app.post('/api/weeks/:id/tasks', (req, res) => {
  const { id } = req.params;
  const taskData = req.body;
  
  const data = readData();
  const week = data.weeks.find(w => w.id === parseInt(id));
  
  if (!week) {
    return res.status(404).json({ error: 'Week not found' });
  }

  // Auto-set day based on date
  const selectedDate = new Date(taskData.date);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const autoDay = dayNames[selectedDate.getDay()];

  const newTask = {
    ...taskData,
    day: autoDay,
    status: taskData.isHoliday ? 'holiday' : (taskData.status || 'todo')
  };

  week.tasks.push(newTask);
  
  if (writeData(data)) {
    res.status(201).json(newTask);
  } else {
    res.status(500).json({ error: 'Failed to save task' });
  }
});

// PUT update task
app.put('/api/weeks/:weekId/tasks/:taskIndex', (req, res) => {
  const { weekId, taskIndex } = req.params;
  const taskData = req.body;
  
  const data = readData();
  const week = data.weeks.find(w => w.id === parseInt(weekId));
  
  if (!week) {
    return res.status(404).json({ error: 'Week not found' });
  }
  
  if (taskIndex < 0 || taskIndex >= week.tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Auto-set day based on date
  const selectedDate = new Date(taskData.date);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const autoDay = dayNames[selectedDate.getDay()];

  week.tasks[taskIndex] = {
    ...taskData,
    day: autoDay
  };
  
  if (writeData(data)) {
    res.json(week.tasks[taskIndex]);
  } else {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
app.delete('/api/weeks/:weekId/tasks/:taskIndex', (req, res) => {
  const { weekId, taskIndex } = req.params;
  
  const data = readData();
  const week = data.weeks.find(w => w.id === parseInt(weekId));
  
  if (!week) {
    return res.status(404).json({ error: 'Week not found' });
  }
  
  if (taskIndex < 0 || taskIndex >= week.tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  week.tasks.splice(taskIndex, 1);
  
  if (writeData(data)) {
    res.json({ message: 'Task deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PATCH update task status
app.patch('/api/weeks/:weekId/tasks/:taskIndex/status', (req, res) => {
  const { weekId, taskIndex } = req.params;
  const { status } = req.body;
  
  const data = readData();
  const week = data.weeks.find(w => w.id === parseInt(weekId));
  
  if (!week) {
    return res.status(404).json({ error: 'Week not found' });
  }
  
  if (taskIndex < 0 || taskIndex >= week.tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  week.tasks[taskIndex].status = status;
  
  if (writeData(data)) {
    res.json(week.tasks[taskIndex]);
  } else {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Serve static files
app.use(express.static('dist'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
