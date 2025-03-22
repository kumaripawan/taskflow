// Select DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('#filter button');

// Array to hold tasks
let tasks = [];

// Function to display tasks
function displayTasks(filter = 'all') {
  taskList.innerHTML = '';
  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return filter === 'completed' ? task.completed : !task.completed;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.completed) li.classList.add('completed');

    // Add a button to toggle completion
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
    toggleBtn.addEventListener('click', () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      displayTasks(filter);
    });

    // Add a delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      displayTasks(filter);
    });

    li.appendChild(toggleBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from LocalStorage
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (saved) {
    tasks = JSON.parse(saved);
  }
}

// Event listener for adding a task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text !== '') {
    tasks.push({ text, completed: false });
    taskInput.value = '';
    saveTasks();
    displayTasks();
  }
});

// Event listeners for filter buttons
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    displayTasks(button.getAttribute('data-filter'));
  });
});

// Initial load
loadTasks();
displayTasks();
