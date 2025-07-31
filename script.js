document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const dueDateInput = document.getElementById("due-date");
  const priorityInput = document.getElementById("priority");
  const filterSelect = document.getElementById("filter");
  const sortSelect = document.getElementById("sort");
  const taskList = document.getElementById("task-list");
  const darkToggle = document.getElementById("dark-mode-toggle");
  const searchInput = document.getElementById("search-input");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Load dark mode
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    darkToggle.checked = true;
  }

  darkToggle.addEventListener("change", () => {
    if (darkToggle.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    }
  });

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function renderTasks() {
    const filter = filterSelect.value;
    const sort = sortSelect.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filteredTasks = tasks.filter(task => {
      const matchesFilter =
        (filter === "completed" && task.completed) ||
        (filter === "incomplete" && !task.completed) ||
        filter === "all";

      const matchesSearch = task.text.toLowerCase().includes(searchTerm);
      return matchesFilter && matchesSearch;
    });

    if (sort === "dueDate") {
      filteredTasks.sort((a, b) =>
        new Date(a.dueDate || "2100-01-01") - new Date(b.dueDate || "2100-01-01")
      );
    }

    if (sort === "priority") {
      const priorityMap = { high: 1, medium: 2, low: 3 };
      filteredTasks.sort((a, b) =>
        priorityMap[a.priority] - priorityMap[b.priority]
      );
    }

    taskList.innerHTML = "";

    filteredTasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";

      const priorityClass = `priority-${task.priority}`;

      li.innerHTML = `
        <div>
          <span>${task.text}</span>
          <div class="task-info">
            <span>Due: ${task.dueDate || "None"}</span>
            <span class="${priorityClass}">Priority: ${task.priority}</span>
          </div>
        </div>
        <div>
          <button onclick="toggleTask(${index})">✔</button>
          <button onclick="editTask(${index})">✏️</button>
          <button onclick="deleteTask(${index})">🗑</button>
        </div>
      `;

      taskList.appendChild(li);
    });
  }

  window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  };

  window.deleteTask = function(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  };

  window.editTask = function(index) {
    const task = tasks[index];
    const newText = prompt("Edit task:", task.text);
    if (newText !== null && newText.trim() !== "") {
      task.text = newText.trim();
      saveTasks();
      renderTasks();
    }
  };

  taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;

    if (text) {
      tasks.push({ text, dueDate, priority, completed: false });
      taskInput.value = "";
      dueDateInput.value = "";
      priorityInput.value = "medium";
      saveTasks();
      renderTasks();
    }
  });

  filterSelect.addEventListener("change", renderTasks);
  sortSelect.addEventListener("change", renderTasks);
  searchInput.addEventListener("input", renderTasks);

  renderTasks();
});
