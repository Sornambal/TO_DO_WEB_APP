const API_URL = 'http://localhost:5000/api/tasks';
const token = localStorage.getItem('token');

// Redirect to login if not authenticated
if (!token) {
  alert("Please login first!");
  window.location.href = 'login.html';
}

async function loadTasks() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const sortOrder = document.getElementById('sortOrder').value;

  const res = await fetch(API_URL, {
    headers: { 'Authorization': token }
  });
  let tasks = await res.json();

  // Filter
  if (status !== 'all') {
    tasks = tasks.filter(task => task.status === status);
  }

  // Search
  if (search) {
    tasks = tasks.filter(task => task.title.toLowerCase().includes(search));
  }

  // Sort
  tasks.sort((a, b) => {
    const da = new Date(a.date), db = new Date(b.date);
    return sortOrder === 'asc' ? da - db : db - da;
  });

  // Render
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task';
    div.innerHTML = `
      <h4>${task.title} <span>(${task.priority})</span></h4>
      <p>${task.desc}</p>
      <p>Status: ${task.status}</p>
      <p>Date: ${new Date(task.date).toLocaleString()}</p>
      <button onclick="markStatus('${task._id}', '${task.status === 'pending' ? 'completed' : 'pending'}')">
        Mark as ${task.status === 'pending' ? 'Completed' : 'Pending'}
      </button>
      <button onclick="editTask('${task._id}')">Edit</button>
      <button onclick="deleteTask('${task._id}')">Delete</button>
    `;
    taskList.appendChild(div);
  });
}

document.getElementById('taskForm').onsubmit = async (e) => {
  e.preventDefault();
  const task = {
    title: document.getElementById('title').value,
    desc: document.getElementById('desc').value,
    priority: document.getElementById('priority').value,
    date: new Date()
  };
  await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });
  e.target.reset();
  loadTasks();
};

async function markStatus(id, status) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  loadTasks();
}

async function deleteTask(id) {
  if (confirm("Are you sure to delete?")) {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });
    loadTasks();
  }
}

async function editTask(id) {
  const newTitle = prompt("Enter new title:");
  const newDesc = prompt("Enter new description:");
  const newPriority = prompt("Enter new priority (Low/Medium/High):");
  if (newTitle && newDesc && newPriority) {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: newTitle, desc: newDesc, priority: newPriority })
    });
    loadTasks();
  }
}

// Initial load
window.onload = loadTasks;
