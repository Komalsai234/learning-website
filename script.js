// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC85dN6fj2Q7kF_GT431PPsMDfeXvl69Wc",
    authDomain: "aardra-learnings.firebaseapp.com",
    projectId: "aardra-learnings",
    storageBucket: "aardra-learnings.firebasestorage.app",
    messagingSenderId: "35379545367",
    appId: "1:35379545367:web:65774168a97840c4ece352",
    measurementId: "G-YRN64WGZPG"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Error connecting to Firebase. Please check the console.');
}

// Data structure
let weeks = [];
let currentWeekId = null;
let currentTaskIndex = null;
let isLoading = true;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up...');
    setupEventListeners();
    updateCurrentDate();
    loadWeeksFromFirebase();
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
    
    // Close modals on backdrop click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-backdrop')) {
            const modal = event.target.parentElement;
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
}

// Load weeks from Firebase
async function loadWeeksFromFirebase() {
    try {
        showLoadingState();
        
        // Listen for real-time updates
        db.collection('weeks').orderBy('createdAt', 'asc').onSnapshot((snapshot) => {
            weeks = [];
            snapshot.forEach((doc) => {
                weeks.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            isLoading = false;
            renderWeeks();
        }, (error) => {
            console.error('Error loading weeks:', error);
            showToast('Error loading data. Please refresh the page.', '❌');
            isLoading = false;
        });
    } catch (error) {
        console.error('Error setting up Firebase listener:', error);
        showToast('Error connecting to database', '❌');
        isLoading = false;
    }
}

// Show loading state
function showLoadingState() {
    const container = document.getElementById('weeksContainer');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
            <h2 style="color: #666; font-size: 20px;">Loading your learning weeks...</h2>
        </div>
    `;
}

// Save data to Firebase
async function saveData() {
    // This function is now handled by individual operations
    // Kept for backward compatibility
}

// Save new week to Firebase
async function saveWeekToFirebase(weekData) {
    try {
        console.log('Saving week to Firebase:', weekData);
        const docRef = await db.collection('weeks').add({
            ...weekData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Week saved successfully with ID:', docRef.id);
        showToast('Week created successfully!', '✅');
    } catch (error) {
        console.error('Error saving week:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Show more specific error messages
        if (error.code === 'permission-denied') {
            alert('Permission denied. Please make sure Firestore is enabled and security rules are set correctly.');
        } else if (error.code === 'unavailable') {
            alert('Firebase is unavailable. Please check your internet connection.');
        } else {
            alert('Error creating week: ' + error.message);
        }
    }
}

// Update week in Firebase
async function updateWeekInFirebase(weekId, weekData) {
    try {
        console.log('Updating week in Firebase:', weekId, weekData);
        await db.collection('weeks').doc(weekId).update(weekData);
        console.log('Week updated successfully');
    } catch (error) {
        console.error('Error updating week:', error);
        console.error('Error details:', error.code, error.message);
        
        if (error.code === 'permission-denied') {
            alert('Permission denied. Please check Firestore security rules.');
        } else {
            alert('Error updating data: ' + error.message);
        }
    }
}

// Delete week from Firebase
async function deleteWeekFromFirebase(weekId) {
    try {
        await db.collection('weeks').doc(weekId).delete();
        showToast('Week deleted', '🗑️');
    } catch (error) {
        console.error('Error deleting week:', error);
        showToast('Error deleting week. Please try again.', '❌');
    }
}

// Render all weeks
function renderWeeks() {
    const container = document.getElementById('weeksContainer');
    const emptyState = document.getElementById('emptyState');
    
    // Close tasks page if open
    const tasksPage = document.getElementById('tasksPageView');
    if (tasksPage) {
        tasksPage.remove();
        document.querySelector('.container').style.display = 'block';
    }
    
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
                    <span>👁️</span> <span>View Tasks</span>
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
    `;
    
    return section;
}

// Toggle tasks visibility - Show in separate page view
function toggleTasks(weekIndex) {
    const week = weeks[weekIndex];
    
    // Hide main container and show tasks page
    document.querySelector('.container').style.display = 'none';
    
    // Create tasks page
    const tasksPage = document.createElement('div');
    tasksPage.className = 'tasks-page-view';
    tasksPage.id = 'tasksPageView';
    
    tasksPage.innerHTML = `
        <div class="tasks-page-header">
            <button class="back-btn" onclick="closeTasksPage()">
                <span>←</span> Back to Weeks
            </button>
            <div class="tasks-page-title">
                <h1>${week.title}</h1>
                <p class="tasks-page-dates">${week.dates}</p>
            </div>
        </div>
        <div class="tasks-page-content">
            ${week.tasks.length === 0 ? `
                <div class="empty-week-large">
                    <div class="empty-week-icon">📝</div>
                    <h2>No Tasks Yet</h2>
                    <p>Start adding tasks to plan your week!</p>
                </div>
            ` : `
                <div class="tasks-grid-full" id="tasksGridFull${weekIndex}"></div>
            `}
        </div>
        <button class="btn-floating-add" onclick="openAddTaskModal(${weekIndex})">
            <span class="floating-add-icon">+</span>
        </button>
    `;
    
    document.body.appendChild(tasksPage);
    
    // Populate tasks if any
    if (week.tasks.length > 0) {
        const tasksGridFull = tasksPage.querySelector(`#tasksGridFull${weekIndex}`);
        week.tasks.forEach((task, taskIndex) => {
            const taskCard = createTaskCard(task, weekIndex, taskIndex);
            tasksGridFull.appendChild(taskCard);
        });
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Close tasks page and return to weeks view
function closeTasksPage() {
    const tasksPage = document.getElementById('tasksPageView');
    if (tasksPage) {
        tasksPage.remove();
    }
    document.querySelector('.container').style.display = 'block';
    window.scrollTo(0, 0);
}

// Create task card
// Create task card
function createTaskCard(task, weekIndex, taskIndex) {
    const card = document.createElement('div');
    const isWeekend = task.day === 'Saturday' || task.day === 'Sunday';
    const isHoliday = task.isHoliday || false;
    
    // Format date as "Feb 7", "Mar 10" format
    let displayDate = task.date;
    if (task.date && task.date.includes('-')) {
        const dateObj = new Date(task.date);
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const day = dateObj.getDate();
        displayDate = `${month} ${day}`;
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
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
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
                    <div class="day-name">${task.day}${task.hasMeet ? ' <span class="meet-badge">(Meet)</span>' : ''}</div>
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
    console.log('saveNewWeek called');
    
    const title = document.getElementById('weekTitle').value.trim();
    const startDate = document.getElementById('weekStartDate').value;
    const endDate = document.getElementById('weekEndDate').value;
    const description = document.getElementById('weekDescription').value.trim();
    
    console.log('Week data:', { title, startDate, endDate, description });
    
    if (!title || !startDate || !endDate) {
        alert('Please fill in all required fields (Title, Start Date, End Date)');
        if (!title) document.getElementById('weekTitle').focus();
        else if (!startDate) document.getElementById('weekStartDate').focus();
        else if (!endDate) document.getElementById('weekEndDate').focus();
        return;
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
        alert('End date must be after start date');
        document.getElementById('weekEndDate').focus();
        return;
    }
    
    // Format date range
    const dateRange = `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    const newWeek = {
        title,
        dates: dateRange,
        description,
        tasks: []
    };
    
    console.log('Creating week:', newWeek);
    console.log('Firebase db object:', db);
    
    // Check if Firebase is ready
    if (!db) {
        alert('Firebase is not initialized. Please refresh the page.');
        return;
    }
    
    // Save to Firebase instead of local array
    saveWeekToFirebase(newWeek);
    closeAddWeekModal();
    
    console.log('Week creation initiated');
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
    
    console.log('saveNewTask called for week index:', currentWeekId);
    
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
    
    // Check if week exists
    if (currentWeekId === null || !weeks[currentWeekId]) {
        alert('Error: Week not found. Please refresh the page.');
        return;
    }
    
    // Check if Firebase is ready
    if (!db) {
        alert('Firebase is not initialized. Please refresh the page.');
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
        hasMeet,
        status: isHoliday ? 'holiday' : 'todo'
    };
    
    console.log('Adding task:', newTask);
    
    // Update Firebase
    const week = weeks[currentWeekId];
    const updatedTasks = [...week.tasks, newTask];
    updateWeekInFirebase(week.id, { tasks: updatedTasks });
    
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
    
    // Update task in local array
    const week = weeks[currentWeekId];
    const updatedTasks = [...week.tasks];
    updatedTasks[currentTaskIndex] = {
        ...updatedTasks[currentTaskIndex],
        date: dateInput,
        day: autoDay,
        studyTime: studyTimeMinutes,
        task,
        isHoliday,
        hasMeet,
        status: isHoliday ? 'holiday' : (updatedTasks[currentTaskIndex].status || 'todo')
    };
    
    // Update Firebase
    updateWeekInFirebase(week.id, { tasks: updatedTasks });
    
    showToast('Task updated successfully!', '✏️');
    // Don't close modal - allow multiple edits
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
        const week = weeks[currentWeekId];
        const updatedTasks = [...week.tasks];
        updatedTasks.splice(currentTaskIndex, 1);
        
        // Update Firebase
        updateWeekInFirebase(week.id, { tasks: updatedTasks });
        
        closeEditTaskModal();
        showToast('Task deleted', '🗑️');
    }
}

function deleteWeek(weekIndex) {
    if (confirm('Are you sure you want to delete this entire week? This action cannot be undone.')) {
        const week = weeks[weekIndex];
        deleteWeekFromFirebase(week.id);
    }
}

function updateTaskStatus(weekIndex, taskIndex, status) {
    const week = weeks[weekIndex];
    const updatedTasks = [...week.tasks];
    updatedTasks[taskIndex].status = status;
    
    // Update Firebase
    updateWeekInFirebase(week.id, { tasks: updatedTasks });
    
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