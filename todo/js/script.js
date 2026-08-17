const STORAGE_KEY = "toradora.tasks.v1";
const priorityLabels = { 1: "[!]", 2: "[~]", 3: "[ ]" };

const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const priorityInput = document.querySelector("#priority-input");
const longTermInput = document.querySelector("#long-term-input");
const showAllInput = document.querySelector("#show-all");
// changes made for Clear Completed button
const clearCompletedButton = document.querySelector("#clear-completed");
// changes end here

// change here in js script.js.
const priorityFilter = document.querySelector("#priority-filter");
// change end here in js script.js



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
  const nextId = tasks.reduce((highest, task) => Math.max(highest, task.id), 0) + 1;
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




//changes made in js script.js. 

function groupTasks() {
  const today = new Date().toISOString().slice(0, 10);
  const groups = { "Long-term": [], "Today's Tasks": [], Backlog: [] };

  tasks
    .filter((task) => showAllInput.checked || !task.status)
    .filter(
      (task) =>
        priorityFilter.value === "all" ||
        task.priority === Number(priorityFilter.value)
    )
    .sort(
      (first, second) =>
        first.priority - second.priority || first.id - second.id
    )
    .forEach((task) => {
      if (task.longTerm) groups["Long-term"].push(task);
      else if (task.createdAt === today) groups["Today's Tasks"].push(task);
      else groups.Backlog.push(task);
    });

  return groups;
}

//changes done end here





function makeTaskElement(task, displayNumber) //here changes done for numbering display because earlier it was taking from local storage 
{
  const item = document.createElement("li");
  item.className = task.status ? "task completed" : "task";

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = `${task.status ? "[x]" : priorityLabels[task.priority]} ${displayNumber}. ${task.task}`; //here too 
  item.append(text);

  const actions = document.createElement("span");
  actions.className = "task-actions";
  if (!task.status) {
    const complete = document.createElement("button");
    complete.type = "button";
    complete.textContent = "Complete";
    complete.addEventListener("click", () => updateTask(task.id, { status: 1 }));
    actions.append(complete);
  }
  const edit = document.createElement("button");
  edit.type = "button";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => {
    const replacement = window.prompt("Edit task", task.task);
    if (replacement && replacement.trim()) updateTask(task.id, { task: replacement.trim() });
  });
  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => {
    tasks = tasks.filter((candidate) => candidate.id !== task.id);
    saveTasks();
    render();
  });
  actions.append(edit, remove);
  item.append(actions);
  return item;
}

function updateTask(id, changes) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));
  saveTasks();
  render();
}

// changes made for Clear Completed functionality
function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.status);
  saveTasks();
  render();
}
// changes end here

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

// change here in js script.js


    grouped.forEach((task, index) =>
  list.append(makeTaskElement(task, index + 1))
);
   
// change end here in js script.js

    section.append(heading, list);
    groupsElement.append(section);
  });
  emptyState.hidden = visibleCount !== 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value, priorityInput.value, longTermInput.checked);

const selectedPriority = priorityInput.value;


// change here in js script.js. because it takes to the same priority always
form.reset();
priorityInput.value = selectedPriority;
taskInput.focus();


//change end here in js script.js
 
});


// change 2nd made in js script.js.


showAllInput.addEventListener("change", render);
priorityFilter.addEventListener("change", render);

// changes made for Clear Completed event
clearCompletedButton.addEventListener("click",clearCompletedTasks);
// changes end here

render();


// chnage 2nd end here

