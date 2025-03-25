import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBjG6ri4XdpnkeYVSE7wFdVae7lpeD3uN4",
  authDomain: "taskflow-fdf73.firebaseapp.com",
  projectId: "taskflow-fdf73",
  storageBucket: "taskflow-fdf73.appspot.com",
  messagingSenderId: "677875091730",
  appId: "1:677875091730:web:67271f60a3c83426220bcb",
  measurementId: "G-0E2E8JB9F8"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

const recurrenceSelect = document.getElementById('recurrence');
const projectSelect = document.getElementById('project-select');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('#filter button');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date');
const dueTimeInput = document.getElementById('due-time');
const darkToggle = document.getElementById('dark-toggle');

let tasks = [];
let currentFilter = 'all';

function displayTasks(filter = 'all') {
  taskList.innerHTML = '';
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'completed': return task.completed;
      case 'pending': return !task.completed;
      case 'today': return task.dueDate === todayStr;
      case 'upcoming': return task.dueDate && task.dueDate > todayStr;
      default: return true;
    }
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    const content = document.createElement('div');
    const title = document.createElement('span');
    title.textContent = task.text;

    const priorityTag = document.createElement('span');
    priorityTag.className = `priority ${task.priority}`;
    priorityTag.textContent = task.priority;

    const projectTag = document.createElement('span');
    projectTag.className = 'project';
    projectTag.textContent = task.project;

    content.appendChild(title);
    content.appendChild(priorityTag);
    content.appendChild(projectTag);

    if (task.dueDate) {
      const dueDateSpan = document.createElement('span');
      dueDateSpan.className = 'due-date';
      dueDateSpan.textContent = `Due: ${task.dueDate} ${task.dueTime || ''}`;
      content.appendChild(dueDateSpan);
    }

    li.appendChild(content);

    // Subtasks
    const subtaskList = document.createElement('ul');
    subtaskList.className = 'subtask-list';
    task.subtasks.forEach((subtask, subIndex) => {
      const subLi = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = subtask.completed;

      const label = document.createElement('span');
      label.textContent = subtask.text;
      if (subtask.completed) label.style.textDecoration = 'line-through';

      checkbox.addEventListener('change', () => {
        task.subtasks[subIndex].completed = checkbox.checked;
        saveTasks();
        displayTasks(currentFilter);
      });

      subLi.appendChild(checkbox);
      subLi.appendChild(label);
      subtaskList.appendChild(subLi);
    });
    li.appendChild(subtaskList);

    // Add subtask form
    const subtaskForm = document.createElement('form');
    subtaskForm.className = 'add-subtask-form';
    const subtaskInput = document.createElement('input');
    subtaskInput.type = 'text';
    subtaskInput.placeholder = 'Add a subtask...';
    const subtaskBtn = document.createElement('button');
    subtaskBtn.type = 'submit';
    subtaskBtn.textContent = '+';

    subtaskForm.appendChild(subtaskInput);
    subtaskForm.appendChild(subtaskBtn);

    subtaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const subText = subtaskInput.value.trim();
      if (subText !== '') {
        task.subtasks.push({ text: subText, completed: false });
        saveTasks();
        displayTasks(currentFilter);
      }
    });

    li.appendChild(subtaskForm);

    if (task.completed) li.classList.add('completed');

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
    toggleBtn.addEventListener('click', () => {
      task.completed = !task.completed;
      saveTasks();
      displayTasks(currentFilter);
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = task.text;
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';

      li.innerHTML = '';
      li.appendChild(input);
      li.appendChild(saveBtn);

      saveBtn.addEventListener('click', () => {
        const updatedText = input.value.trim();
        if (updatedText !== '') {
          task.text = updatedText;
          saveTasks();
          displayTasks(currentFilter);
        }
      });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      displayTasks(currentFilter);
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.appendChild(toggleBtn);
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);

    li.appendChild(buttonGroup);
    taskList.appendChild(li);
  });

  updateProgress();
}

// ✅ Add Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;
  const dueTime = dueTimeInput.value;
  const project = projectSelect.value;
  const recurrence = recurrenceSelect.value;

  if (text !== '') {
    tasks.push({
      text,
      completed: false,
      priority,
      dueDate,
      dueTime,
      project,
      recurrence,
      reminded: false,
      subtasks: []
    });

    taskInput.value = '';
    prioritySelect.value = 'low';
    dueDateInput.value = '';
    dueTimeInput.value = '';
    projectSelect.value = 'General';
    recurrenceSelect.value = 'none';

    saveTasks();
    displayTasks(currentFilter);
  }
});
async function saveTasks() {
  const tasksRef = collection(db, 'tasks');

  // Clear existing tasks (for simplicity — can optimize later)
  const snapshot = await getDocs(tasksRef);
  snapshot.forEach(async (docSnap) => {
    await deleteDoc(doc(db, 'tasks', docSnap.id));
  });

  // Save new tasks
  tasks.forEach(async (task) => {
    await setDoc(doc(tasksRef), task);
  });

  console.log("✅ Synced to Firestore");
}


  const userTasksRef = collection(db, "tasks");

  // Clear old Firestore data
  const snapshot = await getDocs(userTasksRef);
  snapshot.forEach(async (docItem) => {
    await deleteDoc(doc(db, "tasks", docItem.id));
  });

  // Save updated tasks
  tasks.forEach(async (task, index) => {
    await setDoc(doc(db, "tasks", `task-${index}`), task);
  });


async function loadTasks() {
  tasks = [];
  const querySnapshot = await getDocs(collection(db, "tasks"));
  querySnapshot.forEach((doc) => {
    const task = doc.data();
    if (!task.subtasks) task.subtasks = [];
    tasks.push(task);
  });

  console.log("✅ Loaded from Firestore");
}


// ✅ Other utility functions (same as before)
function updateProgress() {
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.dueDate === today);
  const completed = todaysTasks.filter(t => t.completed).length;
  const total = todaysTasks.length;

  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar-fill');

  if (progressText && progressBar) {
    progressText.textContent = `Progress: ${completed} of ${total} completed`;
    progressBar.style.width = total > 0 ? `${(completed / total) * 100}%` : '0%';
  }
}

function checkReminders() {
  const now = new Date();
  const nowDate = now.toISOString().split('T')[0];
  const audio = document.getElementById('reminder-sound');
  const toast = document.getElementById('reminder-toast');

  tasks.forEach(task => {
    if (
      task.dueDate === nowDate &&
      task.dueTime &&
      !task.completed &&
      !task.reminded
    ) {
      const taskTime = new Date(`${task.dueDate}T${task.dueTime}`);
      const diff = now - taskTime;
      if (diff >= 0 && diff <= 60000) {
        toast.textContent = `⏰ Reminder: "${task.text}" is due now!`;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 10000);
        audio.play();
        task.reminded = true;
        saveTasks();
      }
    }
  });
}

function generateCalendar() {
  const calendar = document.getElementById('calendar');
  if (!calendar) return;

  calendar.innerHTML = '';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendar.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('calendar-day');
    dayDiv.textContent = day;

    if (dateStr === new Date().toISOString().split('T')[0]) {
      dayDiv.classList.add('today');
    }

    const tasksOnThisDay = tasks.filter(t => t.dueDate === dateStr);
    if (tasksOnThisDay.length > 0) {
      dayDiv.classList.add('has-task');
    }

    dayDiv.addEventListener('click', () => {
      currentFilter = 'custom-date';
      displayTasksByDate(dateStr);
    });

    calendar.appendChild(dayDiv);
  }
}

function displayTasksByDate(dateStr) {
  const filtered = tasks.filter(t => t.dueDate === dateStr);
  taskList.innerHTML = '';
  filtered.forEach((task, index) => {
    displayTasks(currentFilter);
  });
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.getAttribute('data-filter');
    displayTasks(currentFilter);
  });
});

// Dark Mode
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
  darkToggle.checked = true;
}
darkToggle.addEventListener('change', () => {
  if (darkToggle.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', 'disabled');
  }
});

// ✅ Proper async start
(async () => {
  await loadTasks();
  displayTasks(currentFilter);
  generateCalendar();
  setInterval(checkReminders, 10000);
})();

