const STORAGE_KEY = "toradora.tasks.v1";
const priorityLabels = { 1: "[!]", 2: "[~]", 3: "[ ]" };

const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const priorityInput = document.querySelector("#priority-input");
const longTermInput = document.querySelector("#long-term-input");
const showAllInput = document.querySelector("#show-all");
const priorityFilter = document.querySelector("#priority-filter");
const groupsElement = document.querySelector("#task-groups");
const emptyState = document.querySelector("#empty-state");

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn("Could not read saved tasks", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text, priority, longTerm) {
  const nextId =
    tasks.reduce(
      (highest, task) => Math.max(highest, task.id),
      0
    ) + 1;

  tasks.push({
    id: nextId,
    task: text.trim(),
    status: 0,
    priority: Number(priority),
    longTerm,
    createdAt: new Date().toISOString().slice(0, 10),
  });

  saveTasks();
  render();
}

function groupTasks() {
  const today = new Date().toISOString().slice(0, 10);

  const groups = {
    "Long-term": [],
    "Today's Tasks": [],
    Backlog: [],
  };

  tasks
    // Show completed filter
    .filter((task) => showAllInput.checked || !task.status)

    // Priority filter
    .filter(
      (task) =>
        priorityFilter.value === "all" ||
        task.priority === Number(priorityFilter.value)
    )

    // Sort by priority, then ID
    .sort(
      (first, second) =>
        first.priority - second.priority ||
        first.id - second.id
    )

    // Group tasks
    .forEach((task) => {
      if (task.longTerm) {
        groups["Long-term"].push(task);
      } else if (task.createdAt === today) {
        groups["Today's Tasks"].push(task);
      } else {
        groups.Backlog.push(task);
      }
    });

  return groups;
}

function makeTaskElement(task) {
  const item = document.createElement("li");
  item.className = task.status ? "task completed" : "task";

  const text = document.createElement("span");
  text.className = "task-text";

  text.textContent = `${
    task.status ? "[x]" : priorityLabels[task.priority]
  } ${task.id}. ${task.task}`;

  item.append(text);

  const actions = document.createElement("span");
  actions.className = "task-actions";

  // Complete button
  if (!task.status) {
    const complete = document.createElement("button");

    complete.type = "button";
    complete.textContent = "Complete";

    complete.addEventListener("click", () => {
      updateTask(task.id, { status: 1 });
    });

    actions.append(complete);
  }

  // Edit button
  const edit = document.createElement("button");

  edit.type = "button";
  edit.textContent = "Edit";

  edit.addEventListener("click", () => {
    const replacement = window.prompt("Edit task", task.task);

    if (replacement && replacement.trim()) {
      updateTask(task.id, {
        task: replacement.trim(),
      });
    }
  });

  // Delete button
  const remove = document.createElement("button");

  remove.type = "button";
  remove.textContent = "Delete";

  remove.addEventListener("click", () => {
    tasks = tasks.filter(
      (candidate) => candidate.id !== task.id
    );

    saveTasks();
    render();
  });

  actions.append(edit, remove);
  item.append(actions);

  return item;
}

function updateTask(id, changes) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, ...changes }
      : task
  );

  saveTasks();
  render();
}

function render() {
  groupsElement.replaceChildren();

  const groups = groupTasks();

  let visibleCount = 0;

  Object.entries(groups).forEach(([name, grouped]) => {
    if (!grouped.length) return;

    visibleCount += grouped.length;

    const section = document.createElement("section");

    const heading = document.createElement("h3");
    heading.textContent = name;

    const list = document.createElement("ul");
    list.className = "task-list";

    grouped.forEach((task) => {
      list.append(makeTaskElement(task));
    });

    section.append(heading, list);
    groupsElement.append(section);
  });

  emptyState.hidden = visibleCount !== 0;
}

// Add task
form.addEventListener("submit", (event) => {
  event.preventDefault();

  addTask(
    taskInput.value,
    priorityInput.value,
    longTermInput.checked
  );

  form.reset();

  priorityInput.value = "2";

  taskInput.focus();
});

// Show completed
showAllInput.addEventListener("change", render);

// Priority filter
priorityFilter.addEventListener("change", render);

// Initial render
render();