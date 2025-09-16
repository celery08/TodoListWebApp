
let appState = {
    tasks: [],
    selectedTags: []
};

let currentEditId = null;


const priorityColors = {
    low: '#3b82f6',
    medium: '#eab308',
    high: '#f97316'
};


function generateId() {
    return Math.random().toString(36).substring(2, 11);
}

//  Add Task
function addTask(taskData) {
    appState.tasks.push({
        id: generateId(),
        ...taskData,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
    });
    renderTasks();
    renderTagDropdown();
}

//Toggle Complete
function toggleComplete(taskId) {
    appState.tasks = appState.tasks.map(t =>
        t.id === taskId
            ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
            : t
    );
    renderTasks();
}

// Delete
function deleteTask(taskId) {
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    renderTasks();
}

//Export Tasks
function exportTasks() {
    const dataStr = JSON.stringify(appState.tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();

    URL.revokeObjectURL(url);
    alert('Tasks exported successfully!');
}

// Import Tasks
function importTasks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
              
                    appState.tasks = [...appState.tasks, ...imported];

                    renderTasks();
                    renderTagDropdown();
                    updateTaskSummary();
                    alert('Tasks imported successfully!');
                } else {
                    alert('Invalid file format');
                }
            } catch (err) {
                alert('Error importing: ' + err.message);
            }
        };
        reader.readAsText(file);
    });

    input.click();
}

function updateTaskSummary() {
    const pending = appState.tasks.filter(t => t.status === 'pending').length;
    const overdue = appState.tasks.filter(t => t.status === 'overdue').length;
    const completed = appState.tasks.filter(t => t.status === 'completed').length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('completedCount').textContent = completed;
}

function overDueStatus() {
    const today = new Date();   

    appState.tasks = appState.tasks.map(task => {
        if (task.status === 'completed') return task; 

        if (task.dueDate) {
            const due = new Date(task.dueDate);
            if (due < today) {
                return { ...task, status: 'overdue' };
            }
        }
        return task;
    });
}

// Render Tasks with Lucide Icons
function renderTasks() {
    overDueStatus();

    const list = document.getElementById('taskList');
    if (!list) return;

    let visible = appState.tasks;

    // Filter by selected tag if any
    if (appState.selectedTags.length) {
        visible = visible.filter(t => t.tags.includes(appState.selectedTags[0]));
    }

    // Empty state
    if (visible.length === 0) {
        list.classList.add("empty");
        list.innerHTML = `<div class="no-tasks"> No tasks to show</div>`;
        updateTaskSummary();
        return;
    } else {
        list.classList.remove("empty");
    }

    // Render tasks
    list.innerHTML = visible.map(task => {
        const isCompleted = task.status === 'completed';
        const priorityColor = priorityColors[task.priority] || '#E5E7EB';

        let statusBadge = '';
        if (task.status === 'overdue') {
            statusBadge = `<span class="badge badge-destructive">Overdue</span>`;
        } else if (task.status === 'completed') {
            statusBadge = `<span class="badge badge-success">Completed</span>`;
        } else {
            statusBadge = `<span class="badge badge-secondary">Pending</span>`; 
        }

        // SVGs
        const svgCircle = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
        const svgCheckCircle = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10"/></svg>`;
        const svgCalendar = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
        const svgUser = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        const svgClock = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
        const svgEdit = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z"/></svg>`;
        const svgTrash = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6m6-2h2a2 2 0 0 1 2 2v2H9V6a2 2 0 0 1 2-2z"/></svg>`;

        return `
        <div class="task-item">
            <div class="task-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="display:flex; gap:0.75rem;">
                    <button class="task-status-button" onclick="toggleComplete('${task.id}')">
                        ${isCompleted ? svgCheckCircle : svgCircle}
                    </button>
                    <div>
                        <h3 class="task-title ${isCompleted ? 'completed' : ''}">${task.title}</h3>
                        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <span style="display:flex; align-items:center; gap:0.25rem;">
                        <span style="width:8px; height:8px; background:${priorityColor}; border-radius:50%;"></span>
                        ${task.priority}
                    </span>
                    ${statusBadge}
                    <button class="task-action edit" onclick="editTask('${task.id}')">
                        ${svgEdit}
                    </button>
                    <button class="task-action delete" onclick="deleteTask('${task.id}')">
                        ${svgTrash}
                    </button>
                </div>
            </div>

            <div class="task-meta">
                <div>
                    ${task.dateStarted ? `
                        <div>${svgCalendar}<span>Started: ${formatDate(task.dateStarted)}</span></div>` : ''}
                    ${task.dueDate ? `
                        <div>${svgCalendar}<span>Due: ${formatDate(task.dueDate)}</span></div>` : ''}
                </div>
                <div>
                    ${task.assignedTo ? `
                        <div>${svgUser}<span>${task.assignedTo}</span></div>` : ''}
                    ${task.estimatedHours ? `
                        <div>${svgClock}<span>${task.estimatedHours}h estimated</span></div>` : ''}
                </div>
            </div>

            ${task.tags && task.tags.length
                ? `<div class="task-tags" style="margin-top:1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6;">
                        ${task.tags.map(t => `<span class="task-tag">${t}</span>`).join('')}
                   </div>`
                : ''}
        </div>`;
    }).join('');

    updateTaskSummary();
}

function renderMiniCalendar() {
    const miniCalendarEl = document.getElementById("miniCalendar");
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    function drawCalendar(month, year) {
        miniCalendarEl.innerHTML = "";

        // Calendar container
        miniCalendarEl.style.width = "100%";
        miniCalendarEl.style.maxWidth = "100%";
        miniCalendarEl.style.border = "1px solid #ddd";
        miniCalendarEl.style.borderRadius = "6px";
        miniCalendarEl.style.padding = "8px";
        miniCalendarEl.style.fontFamily = "Arial, sans-serif";
        miniCalendarEl.style.boxSizing = "border-box";

        // Header
        const header = document.createElement("div");
        Object.assign(header.style, {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
            flexWrap: "wrap"
        });

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        Object.assign(prevBtn.style, {
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
            padding: "3px 8px",
            cursor: "pointer",
            borderRadius: "4px"
        });
        prevBtn.onclick = () => changeMonth(-1);

        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        Object.assign(nextBtn.style, {
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
            padding: "3px 8px",
            cursor: "pointer",
            borderRadius: "4px"
        });
        nextBtn.onclick = () => changeMonth(1);

        const monthYear = document.createElement("span");
        monthYear.textContent = `${monthNames[month]} ${year}`;
        Object.assign(monthYear.style, {
            fontWeight: "bold",
            fontSize: "14px"
        });

        header.appendChild(prevBtn);
        header.appendChild(monthYear);
        header.appendChild(nextBtn);
        miniCalendarEl.appendChild(header);

        // Calendar table
        const table = document.createElement("table");
        Object.assign(table.style, {
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "13px"
        });

        // Header row
        const thead = document.createElement("thead");
        const daysRow = document.createElement("tr");
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
            const th = document.createElement("th");
            th.textContent = d;
            Object.assign(th.style, {
                border: "1px solid #ddd",
                textAlign: "center",
                padding: "5px 0",
                backgroundColor: "#f5f5f5",
                fontSize: "12px"
            });
            daysRow.appendChild(th);
        });
        thead.appendChild(daysRow);
        table.appendChild(thead);

        // Body rows
        const tbody = document.createElement("tbody");
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement("td");
                Object.assign(cell.style, {
                    border: "1px solid #ddd",
                    textAlign: "center",
                    padding: "6px 0",
                    width: "14.28%",
                    height: "32px",
                    cursor: "pointer",
                    boxSizing: "border-box"
                });

                if ((i === 0 && j < firstDay) || date > daysInMonth) {
                    cell.textContent = "";
                } else {
                    cell.textContent = date;
                    cell.style.color = "black";
                    if (
                        date === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear()
                    ) {
                        cell.style.backgroundColor = "#007bff";
                        cell.style.color = "#fff";
                        cell.style.fontWeight = "bold";
                        cell.style.borderRadius = "4px";
                    }

                    cell.onmouseenter = () => {
                        if (cell.style.backgroundColor !== "rgb(0, 123, 255)") {
                            cell.style.backgroundColor = "#f0f0f0";
                        }
                    };
                    cell.onmouseleave = () => {
                        if (cell.style.backgroundColor !== "rgb(0, 123, 255)") {
                            cell.style.backgroundColor = "";
                        }
                    };

                    date++;
                }
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        miniCalendarEl.appendChild(table);
    }

    function changeMonth(offset) {
        currentMonth += offset;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        drawCalendar(currentMonth, currentYear);
    }

    drawCalendar(currentMonth, currentYear);
}


function getAllTags() {
    const set = new Set();
    appState.tasks.forEach(task => (task.tags || []).forEach(t => set.add(t)));
    return Array.from(set);
}

function editTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    currentEditId = taskId;

    // Prefill modal fields
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStartDate').value = task.dateStarted || '';
    document.getElementById('taskDueDate').value = task.dueDate || '';
    document.getElementById('taskAssignedTo').value = task.assignedTo || '';
    document.getElementById('taskPriority').value = task.priority || 'medium';
    document.getElementById('taskHours').value = task.estimatedHours || '';
    document.getElementById('taskTags').value = (task.tags || []).join(', ');

    // Show modal
    document.getElementById('addTaskModal').style.display = 'flex';

    // Change submit button text
    document.querySelector('#addTaskForm .submit-button').textContent = 'Save Changes';
}

function renderTagDropdown() {
    const dropdown = document.getElementById('tagFilterDropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';
    dropdown.innerHTML += `<span data-tag="all">All</span>`;
    getAllTags().forEach(tag => {
        dropdown.innerHTML += `<span data-tag="${tag}">${tag}</span>`;
    });
}

document.getElementById('tagFilterBtn').addEventListener('click', () => {
    document.getElementById('tagFilterDropdown').classList.toggle('hidden');
});

document.getElementById('tagFilterDropdown').addEventListener('click', (e) => {
    const val = e.target.dataset.tag;
    const btn = document.getElementById('tagFilterBtn');
    if (val === 'all') {
        appState.selectedTags = [];
        btn.innerText = 'All ▼';
    } else {
        appState.selectedTags = [val];
        btn.innerText = `${val} ▼`;
    }
    document.getElementById('tagFilterDropdown').classList.add('hidden');
    renderTasks();
});

//Modal handlers
document.getElementById('addTaskButton').addEventListener('click', () => {
    document.getElementById('addTaskModal').style.display = 'flex';
});
document.getElementById('cancelTaskButton').addEventListener('click', () => {
    document.getElementById('addTaskModal').style.display = 'none';
});
document.getElementById('exportButton').addEventListener('click', exportTasks);
document.getElementById('importButton').addEventListener('click', importTasks);

//Add Task Submission
document.getElementById('addTaskForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    if (!title) return;

    const description = document.getElementById('taskDescription').value.trim();
    const dateStarted = document.getElementById('taskStartDate').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const assignedTo = document.getElementById('taskAssignedTo').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const hours = document.getElementById('taskHours').value;
    const tagsStr = document.getElementById('taskTags').value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

    if (!currentEditId) {
        // Create new task
        addTask({
            title, description, dateStarted, dueDate,
            assignedTo, priority, estimatedHours: hours, tags
        });
    } else {
        // Update existing task
        appState.tasks = appState.tasks.map(t =>
            t.id === currentEditId
                ? {
                    ...t,
                    title,
                    description,
                    dateStarted,
                    dueDate,
                    assignedTo,
                    priority,
                    estimatedHours: hours,
                    tags
                }
                : t
        );
        currentEditId = null;
        renderTasks();
        renderTagDropdown();
        updateTaskSummary();
    }

    document.getElementById('addTaskForm').reset();
    document.getElementById('addTaskModal').style.display = 'none';

    // Reset button text back to "Add Task"
    document.querySelector('#addTaskForm .submit-button').textContent = 'Add Task';
});


function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

//Render functions
document.addEventListener('DOMContentLoaded', () => {
    overDueStatus();
    renderTasks();
    renderTagDropdown();
    updateTaskSummary();
    renderMiniCalendar();
});
