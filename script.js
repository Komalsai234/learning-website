// Data structure
let weeks = JSON.parse(localStorage.getItem('learningWeeks')) || [];
let currentWeekId = null;
let currentTaskIndex = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderWeeks();
    updateCurrentDate();
    setupEventListeners();
});

// Theme toggle
// Removed - using light theme only

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
    section.id = `week${weekIndex}`;
    
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
                <button class="week-action-btn btn-view-tasks" onclick="toggleTasks(${weekIndex})">
                    <span>👁️</span> <span id="viewTasksText${weekIndex}">View Tasks</span>
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
        
        <div class="tasks-grid hidden" id="tasksGrid${weekIndex}">
            ${tasks.length === 0 ? `
                <div class="empty-week">
                    <div class="empty-week-icon">📝</div>
                    <h3>No Tasks Yet</h3>
                    <p>Click "Add Task" button above to start planning!</p>
                    <button class="week-action-btn btn-add-task" onclick="openAddTaskModal(${weekIndex})" style="margin-top: 1rem;">
                        <span>➕</span> Add Task
                    </button>
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

// Toggle tasks visibility
function toggleTasks(weekIndex) {
    const tasksGrid = document.getElementById(`tasksGrid${weekIndex}`);
    const buttonText = document.getElementById(`viewTasksText${weekIndex}`);
    
    if (tasksGrid.classList.contains('hidden')) {
        tasksGrid.classList.remove('hidden');
        buttonText.textContent = 'Hide Tasks';
    } else {
        tasksGrid.classList.add('hidden');
        buttonText.textContent = 'View Tasks';
    }
}

// Create task card
// Create task card
function createTaskCard(task, weekIndex, taskIndex) {
    const card = document.createElement('div');
    const isWeekend = task.day === 'Saturday' || task.day === 'Sunday';
    const isHoliday = task.isHoliday || false;
    
    // Format date as dd/mm/yy
    let displayDate = task.date;
    if (task.date && task.date.includes('-')) {
        const dateObj = new Date(task.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = String(dateObj.getFullYear()).slice(-2);
        displayDate = `${day}/${month}/${year}`;
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
    
    card.className = `day-card ${isWeekend ? 'weekend' : ''} ${isHoliday ? 'holiday-card' : ''} ${task.status === 'completed' ? 'completed-card' : ''}`;
    
    // Holiday card layout (simplified - no time, no status, no description)
    if (isHoliday) {
        card.innerHTML = `
            <div class="card-header-top">
                <div class="date-info">
                    <div class="date">${displayDate}</div>
                    <div class="day-name">${task.day}</div>
                </div>
                <div class="card-top-right">
                    <button class="edit-btn-icon" onclick="openEditTaskModal(${weekIndex}, ${taskIndex})" title="Edit">
                        ✏️
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="holiday-badge">🏖️ Holiday</div>
            </div>
        `;
    } else {
        // Normal task card
        card.innerHTML = `
            <div class="card-header-top">
                <div class="date-info">
                    <div class="date">${displayDate}</div>
                    <div class="day-name">${task.day}${task.hasMeet ? ' 📹' : ''}</div>
                </div>
                <div class="card-top-right">
                    <div class="time-badge ${isWeekend ? 'weekend' : 'weekday'}">
                        ${displayTime}
                    </div>
                    <button class="edit-btn-icon" onclick="openEditTaskModal(${weekIndex}, ${taskIndex})" title="Edit">
                        ✏️
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="task-text">${task.task || ''}</div>
            </div>
            <div class="card-footer-status">
                <div class="status-badge-clickable ${statusClass}" onclick="openStatusChangeMenu(${weekIndex}, ${taskIndex})" title="Click to change status">
                    <span class="status-badge-icon">${statusIcon}</span>
                    <span>${statusText}</span>
                    <span class="status-change-hint">▼</span>
                </div>
            </div>
        `;
    }
    
    return card;
}

// Open status change menu
let statusChangeWeekIndex = null;
let statusChangeTaskIndex = null;

function openStatusChangeMenu(weekIndex, taskIndex) {
    statusChangeWeekIndex = weekIndex;
    statusChangeTaskIndex = taskIndex;
    document.getElementById('statusChangeModal').style.display = 'block';
}

function changeTaskStatus(newStatus) {
    if (statusChangeWeekIndex !== null && statusChangeTaskIndex !== null) {
        updateTaskStatus(statusChangeWeekIndex, statusChangeTaskIndex, newStatus);
        document.getElementById('statusChangeModal').style.display = 'none';
        statusChangeWeekIndex = null;
        statusChangeTaskIndex = null;
    }
}

// Close status modal
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('closeStatusModal')?.addEventListener('click', function() {
        document.getElementById('statusChangeModal').style.display = 'none';
        statusChangeWeekIndex = null;
        statusChangeTaskIndex = null;
    });
});

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
    document.getElementById('taskHasMeet').checked = false;
    document.getElementById('taskStudyTimeGroup').style.display = 'block';
    document.getElementById('taskDescriptionGroup').style.display = 'block';
    currentWeekId = null;
}

// Toggle holiday fields
function toggleHolidayFields() {
    const isHoliday = document.getElementById('taskIsHoliday').checked;
    const timeGroup = document.getElementById('taskStudyTimeGroup');
    const descGroup = document.getElementById('taskDescriptionGroup');
    
    if (isHoliday) {
        timeGroup.style.display = 'none';
        descGroup.style.display = 'none';
        document.getElementById('taskStudyTime').value = '';
        document.getElementById('taskDescription').value = '';
    } else {
        timeGroup.style.display = 'block';
        descGroup.style.display = 'block';
    }
}

function toggleEditHolidayFields() {
    const isHoliday = document.getElementById('editTaskIsHoliday').checked;
    const timeGroup = document.getElementById('editTaskStudyTimeGroup');
    const descGroup = document.getElementById('editTaskDescriptionGroup');
    
    if (isHoliday) {
        timeGroup.style.display = 'none';
        descGroup.style.display = 'none';
        document.getElementById('editTaskStudyTime').value = '';
        document.getElementById('editTaskDescription').value = '';
    } else {
        timeGroup.style.display = 'block';
        descGroup.style.display = 'block';
    }
}

function saveNewTask() {
    const dateInput = document.getElementById('taskDate').value;
    const studyTimeMinutes = document.getElementById('taskStudyTime').value;
    const task = document.getElementById('taskDescription').value.trim();
    const isHoliday = document.getElementById('taskIsHoliday').checked;
    const hasMeet = document.getElementById('taskHasMeet').checked;
    
    // Validate date
    if (!dateInput) {
        alert('Please select a date');
        document.getElementById('taskDate').focus();
        return;
    }
    
    // Validate non-holiday fields
    if (!isHoliday) {
        if (!studyTimeMinutes) {
            alert('Please select study duration');
            document.getElementById('taskStudyTime').focus();
            return;
        }
        
        if (!task) {
            alert('Please enter task description');
            document.getElementById('taskDescription').focus();
            return;
        }
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
        hasMeet,
        status: isHoliday ? 'holiday' : 'todo'
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
    document.getElementById('editTaskStudyTime').value = task.studyTime || '';
    document.getElementById('editTaskDescription').value = task.task || '';
    document.getElementById('editTaskIsHoliday').checked = task.isHoliday || false;
    document.getElementById('editTaskHasMeet').checked = task.hasMeet || false;
    
    // Toggle fields if holiday
    toggleEditHolidayFields();
    
    document.getElementById('editTaskModal').style.display = 'block';
}

function saveEditedTask() {
    const dateInput = document.getElementById('editTaskDate').value;
    const studyTimeMinutes = document.getElementById('editTaskStudyTime').value;
    const task = document.getElementById('editTaskDescription').value.trim();
    const isHoliday = document.getElementById('editTaskIsHoliday').checked;
    const hasMeet = document.getElementById('editTaskHasMeet').checked;
    
    if (!dateInput) {
        alert('Please select a date');
        return;
    }
    
    if (!isHoliday) {
        if (!studyTimeMinutes) {
            alert('Please select study duration');
            return;
        }
        
        if (!task) {
            alert('Please enter task description');
            return;
        }
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
        isHoliday,
        hasMeet,
        status: isHoliday ? 'holiday' : (weeks[currentWeekId].tasks[currentTaskIndex].status || 'todo')
    };
    
    saveData();
    renderWeeks();
    closeEditTaskModal();
    showToast('Task updated successfully!', '✏️');
}
    
    saveData();
    renderWeeks();
    closeEditTaskModal();
    showToast('Task updated successfully!', '✏️');
}

function closeEditTaskModal() {
    document.getElementById('editTaskModal').style.display = 'none';
    document.getElementById('editTaskStudyTimeGroup').style.display = 'block';
    document.getElementById('editTaskDescriptionGroup').style.display = 'block';
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