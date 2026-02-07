// Data structure
let weeks = JSON.parse(localStorage.getItem('learningWeeks')) || [];
let isDarkTheme = localStorage.getItem('theme') !== 'light'; // Default to dark
let currentWeekId = null;
let currentTaskIndex = null;

// Set theme immediately
document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : '');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    renderWeeks();
    updateCurrentDate();
    setupEventListeners();
});

// Initialize theme
function initializeTheme() {
    if (isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-icon').textContent = '☀️';
    }
}

// Theme toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : '');
        document.querySelector('.theme-icon').textContent = isDarkTheme ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
        showToast('Theme changed', isDarkTheme ? '🌙' : '☀️');
    });
});

// Update current date
function updateCurrentDate() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add Week Button
    document.getElementById('addWeekBtn').addEventListener('click', openAddWeekModal);
    
    // Week Modal
    document.getElementById('closeWeekModal').addEventListener('click', closeAddWeekModal);
    document.getElementById('cancelWeekBtn').addEventListener('click', closeAddWeekModal);
    document.getElementById('saveWeekBtn').addEventListener('click', saveNewWeek);
    
    // Task Modal
    document.getElementById('closeTaskModal').addEventListener('click', closeAddTaskModal);
    document.getElementById('cancelTaskBtn').addEventListener('click', closeAddTaskModal);
    document.getElementById('saveTaskBtn').addEventListener('click', saveNewTask);
    
    // Edit Task Modal
    document.getElementById('closeEditTaskModal').addEventListener('click', closeEditTaskModal);
    document.getElementById('cancelEditTaskBtn').addEventListener('click', closeEditTaskModal);
    document.getElementById('saveEditTaskBtn').addEventListener('click', saveEditedTask);
    document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);
}

// Save data
function saveData() {
    localStorage.setItem('learningWeeks', JSON.stringify(weeks));
}

// Render all weeks
function renderWeeks() {
    const container = document.getElementById('weeksContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (weeks.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    weeks.forEach((week, weekIndex) => {
        const weekSection = createWeekSection(week, weekIndex);
        container.appendChild(weekSection);
    });
}

// Create week section
function createWeekSection(week, weekIndex) {
    const section = document.createElement('div');
    section.className = 'week-section';
    
    const tasks = week.tasks || [];
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'todo').length;
    const postponed = tasks.filter(t => t.status === 'postponed').length;
    
    section.innerHTML = `
        <div class="week-header">
            <div class="week-info">
                <h2 class="week-title">${week.title}</h2>
                <div class="week-dates">${week.dates}</div>
                ${week.description ? `<p class="week-description">${week.description}</p>` : ''}
            </div>
            <div class="week-actions">
                <button class="week-action-btn btn-add-task" onclick="openAddTaskModal(${weekIndex})">
                    <span>➕</span> Add Task
                </button>
                <button class="week-action-btn btn-delete-week" onclick="deleteWeek(${weekIndex})">
                    <span>🗑️</span> Delete Week
                </button>
            </div>
        </div>
        
        <div class="week-stats">
            <div class="week-stat">
                <div class="week-stat-number">${completed}</div>
                <div class="week-stat-label">Completed</div>
            </div>
            <div class="week-stat">
                <div class="week-stat-number">${pending}</div>
                <div class="week-stat-label">Pending</div>
            </div>
            <div class="week-stat">
                <div class="week-stat-number">${postponed}</div>
                <div class="week-stat-label">Postponed</div>
            </div>
            <div class="week-stat">
                <div class="week-stat-number">${tasks.length}</div>
                <div class="week-stat-label">Total Tasks</div>
            </div>
        </div>
        
        <div class="tasks-grid" id="tasksGrid${weekIndex}">
            ${tasks.length === 0 ? `
                <div class="empty-week">
                    <div class="empty-week-icon">📝</div>
                    <h3>No Tasks Yet</h3>
                    <p>Click "Add Task" to start planning your week!</p>
                </div>
            ` : ''}
        </div>
    `;
    
    if (tasks.length > 0) {
        const tasksGrid = section.querySelector(`#tasksGrid${weekIndex}`);
        tasks.forEach((task, taskIndex) => {
            const taskCard = createTaskCard(task, weekIndex, taskIndex);
            tasksGrid.appendChild(taskCard);
        });
    }
    
    return section;
}

// Create task card
function createTaskCard(task, weekIndex, taskIndex) {
    const card = document.createElement('div');
    const isWeekend = task.day === 'Saturday' || task.day === 'Sunday';
    
    // Format date
    let displayDate = task.date;
    if (task.date && task.date.includes('-')) {
        const dateObj = new Date(task.date);
        displayDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
    
    // Format study time
    const studyMinutes = parseInt(task.studyTime) || 0;
    let displayTime = '';
    if (studyMinutes >= 60) {
        const hours = Math.floor(studyMinutes / 60);
        const mins = studyMinutes % 60;
        displayTime = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
        displayTime = `${studyMinutes}m`;
    }
    
    // Status display
    let statusIcon = '';
    let statusClass = '';
    let statusText = '';
    
    if (task.status === 'completed') {
        statusClass = 'completed';
        statusIcon = '✅';
        statusText = 'Completed';
    } else if (task.status === 'postponed') {
        statusClass = 'postponed';
        statusIcon = '⏸️';
        statusText = 'Postponed';
    } else {
        statusClass = 'todo';
        statusIcon = '📝';
        statusText = 'To Do';
    }
    
    card.className = `day-card ${isWeekend ? 'weekend' : ''} ${task.isHoliday ? 'holiday-card' : ''} ${task.status === 'completed' ? 'completed-card' : ''}`;
    
    card.innerHTML = `
        <div class="card-header">
            <div class="date-info">
                <div class="date">${displayDate}</div>
                <div class="day-name">${task.day}</div>
            </div>
            <div class="time-badge ${isWeekend ? 'weekend' : 'weekday'}">
                ${displayTime}
            </div>
        </div>
        <div class="card-content">
            <div class="task-text">${task.task}</div>
        </div>
        <div class="card-footer">
            <div class="status-display ${statusClass}">
                <span class="status-display-icon">${statusIcon}</span>
                <span>Current Status: ${statusText}</span>
            </div>
            <div class="card-actions">
                <button class="status-change-btn" onclick="openStatusChangeMenu(${weekIndex}, ${taskIndex})">
                    Change Status
                </button>
                <button class="edit-btn-small" onclick="openEditTaskModal(${weekIndex}, ${taskIndex})">
                    ✏️ Edit
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Open status change menu
function openStatusChangeMenu(weekIndex, taskIndex) {
    const task = weeks[weekIndex].tasks[taskIndex];
    const currentStatus = task.status;
    
    const options = [
        { value: 'todo', label: 'To Do', icon: '📝' },
        { value: 'completed', label: 'Completed', icon: '✅' },
        { value: 'postponed', label: 'Postponed', icon: '⏸️' }
    ].filter(opt => opt.value !== currentStatus);
    
    const message = `Change status to:\n${options.map((opt, i) => `${i + 1}. ${opt.icon} ${opt.label}`).join('\n')}`;
    const choice = prompt(message, '1');
    
    if (choice && parseInt(choice) > 0 && parseInt(choice) <= options.length) {
        const selectedStatus = options[parseInt(choice) - 1].value;
        updateTaskStatus(weekIndex, taskIndex, selectedStatus);
    }
}

// Modal functions
function openAddWeekModal() {
    document.getElementById('addWeekModal').style.display = 'block';
    document.getElementById('weekTitle').focus();
}

function closeAddWeekModal() {
    document.getElementById('addWeekModal').style.display = 'none';
    document.getElementById('weekTitle').value = '';
    document.getElementById('weekStartDate').value = '';
    document.getElementById('weekEndDate').value = '';
    document.getElementById('weekDescription').value = '';
}

function saveNewWeek() {
    const title = document.getElementById('weekTitle').value.trim();
    const startDate = document.getElementById('weekStartDate').value;
    const endDate = document.getElementById('weekEndDate').value;
    const description = document.getElementById('weekDescription').value.trim();
    
    if (!title || !startDate || !endDate) {
        showToast('Please fill in all required fields', '⚠️');
        return;
    }
    
    // Format date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateRange = `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    const newWeek = {
        id: Date.now(),
        title,
        dates: dateRange,
        description,
        tasks: []
    };
    
    weeks.push(newWeek);
    saveData();
    renderWeeks();
    closeAddWeekModal();
    showToast('Week created successfully!', '🎉');
}

function openAddTaskModal(weekIndex) {
    currentWeekId = weekIndex;
    document.getElementById('addTaskModal').style.display = 'block';
    document.getElementById('taskDate').focus();
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'none';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskStudyTime').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskIsHoliday').checked = false;
    currentWeekId = null;
}

function saveNewTask() {
    const dateInput = document.getElementById('taskDate').value;
    const day = document.getElementById('taskDay').value;
    const studyTimeMinutes = document.getElementById('taskStudyTime').value.trim();
    const task = document.getElementById('taskDescription').value.trim();
    const isHoliday = document.getElementById('taskIsHoliday').checked;
    
    if (!dateInput || !studyTimeMinutes || !task) {
        showToast('Please fill in all required fields', '⚠️');
        return;
    }
    
    // Auto-set day based on date
    const selectedDate = new Date(dateInput);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const autoDay = dayNames[selectedDate.getDay()];
    
    const newTask = {
        date: dateInput,
        day: autoDay,
        studyTime: studyTimeMinutes,
        task,
        isHoliday,
        status: 'todo'
    };
    
    weeks[currentWeekId].tasks.push(newTask);
    saveData();
    renderWeeks();
    closeAddTaskModal();
    showToast('Task added successfully!', '✅');
}

function openEditTaskModal(weekIndex, taskIndex) {
    currentWeekId = weekIndex;
    currentTaskIndex = taskIndex;
    
    const task = weeks[weekIndex].tasks[taskIndex];
    
    document.getElementById('editTaskDate').value = task.date;
    document.getElementById('editTaskDay').value = task.day;
    document.getElementById('editTaskStudyTime').value = task.studyTime;
    document.getElementById('editTaskDescription').value = task.task;
    document.getElementById('editTaskIsHoliday').checked = task.isHoliday || false;
    
    document.getElementById('editTaskModal').style.display = 'block';
}

function saveEditedTask() {
    const dateInput = document.getElementById('editTaskDate').value;
    const day = document.getElementById('editTaskDay').value;
    const studyTimeMinutes = document.getElementById('editTaskStudyTime').value.trim();
    const task = document.getElementById('editTaskDescription').value.trim();
    const isHoliday = document.getElementById('editTaskIsHoliday').checked;
    
    if (!dateInput || !studyTimeMinutes || !task) {
        showToast('Please fill in all required fields', '⚠️');
        return;
    }
    
    // Auto-set day based on date
    const selectedDate = new Date(dateInput);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const autoDay = dayNames[selectedDate.getDay()];
    
    weeks[currentWeekId].tasks[currentTaskIndex] = {
        ...weeks[currentWeekId].tasks[currentTaskIndex],
        date: dateInput,
        day: autoDay,
        studyTime: studyTimeMinutes,
        task,
        isHoliday
    };
    
    saveData();
    renderWeeks();
    closeEditTaskModal();
    showToast('Task updated successfully!', '✏️');
}

function closeEditTaskModal() {
    document.getElementById('editTaskModal').style.display = 'none';
    currentWeekId = null;
    currentTaskIndex = null;
}

function deleteTask() {
    if (confirm('Are you sure you want to delete this task?')) {
        weeks[currentWeekId].tasks.splice(currentTaskIndex, 1);
        saveData();
        renderWeeks();
        closeEditTaskModal();
        showToast('Task deleted', '🗑️');
    }
}

function deleteWeek(weekIndex) {
    if (confirm('Are you sure you want to delete this entire week? This action cannot be undone.')) {
        weeks.splice(weekIndex, 1);
        saveData();
        renderWeeks();
        showToast('Week deleted', '🗑️');
    }
}

function updateTaskStatus(weekIndex, taskIndex, status) {
    weeks[weekIndex].tasks[taskIndex].status = status;
    saveData();
    renderWeeks();
    
    const messages = {
        'todo': 'Task marked as To Do',
        'completed': 'Great job! Task completed! 🎉',
        'postponed': 'Task postponed'
    };
    showToast(messages[status], status === 'completed' ? '✅' : '📝');
}

// Toast notifications
function showToast(message, icon = '✓') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <div class="toast-close" onclick="this.parentElement.remove()">×</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.4s ease reverse';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Close modals when clicking backdrop
window.onclick = function(event) {
    if (event.target.classList.contains('modal-backdrop')) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});