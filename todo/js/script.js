const STORAGE_KEY = "toradora.tasks.v1";

const priorityLabels = {
  1: "[!]",
  2: "[~]",
  3: "[ ]",
};

const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const priorityInput = document.querySelector("#priority-input");
const longTermInput = document.querySelector("#long-term-input");

const showAllInput = document.querySelector("#show-all");
const priorityFilter = document.querySelector("#priority-filter");

const clearCompletedButton =
  document.querySelector("#clear-completed");

const exportJsonButton =
  document.querySelector("#export-json");

const importJsonButton =
  document.querySelector("#import-json");

const importFileInput =
  document.querySelector("#import-file");

const groupsElement =
  document.querySelector("#task-groups");

const emptyState =
  document.querySelector("#empty-state");

let tasks = loadTasks();


// -----------------------------
// Load Tasks
// -----------------------------

function loadTasks() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn(
      "Could not read saved tasks",
      error
    );

    return [];
  }
}


// -----------------------------
// Save Tasks
// -----------------------------

function saveTasks() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );
}


// -----------------------------
// Add Task
// -----------------------------

function addTask(text, priority, longTerm) {
  const nextId =
    tasks.reduce(
      (highest, task) =>
        Math.max(highest, task.id),
      0
    ) + 1;

  tasks.push({
    id: nextId,
    task: text.trim(),
    status: 0,
    priority: Number(priority),
    longTerm,
    createdAt: new Date()
      .toISOString()
      .slice(0, 10),
  });

  saveTasks();
  render();
}


// -----------------------------
// Group Tasks
// -----------------------------

function groupTasks() {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const groups = {
    "Long-term": [],
    "Today's Tasks": [],
    Backlog: [],
  };

  tasks
    // Show completed filter
    .filter(
      (task) =>
        showAllInput.checked ||
        !task.status
    )

    // Priority filter
    .filter(
      (task) =>
        priorityFilter.value === "all" ||
        task.priority ===
          Number(priorityFilter.value)
    )

    // Sort
    .sort(
      (first, second) =>
        first.priority - second.priority ||
        first.id - second.id
    )

    // Group
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


// -----------------------------
// Create Task Element
// -----------------------------

function makeTaskElement(task) {
  const item =
    document.createElement("li");

  item.className = task.status
    ? "task completed"
    : "task";

  const text =
    document.createElement("span");

  text.className = "task-text";

  text.textContent = `${
    task.status
      ? "[x]"
      : priorityLabels[task.priority]
  } ${task.id}. ${task.task}`;

  item.append(text);

  const actions =
    document.createElement("span");

  actions.className = "task-actions";


  // Complete
  if (!task.status) {
    const complete =
      document.createElement("button");

    complete.type = "button";
    complete.textContent = "Complete";

    complete.addEventListener(
      "click",
      () => {
        updateTask(task.id, {
          status: 1,
        });
      }
    );

    actions.append(complete);
  }


  // Edit
  const edit =
    document.createElement("button");

  edit.type = "button";
  edit.textContent = "Edit";

  edit.addEventListener(
    "click",
    () => {
      startInlineEdit(item, task);
    }
  );


  // Delete
  const remove =
    document.createElement("button");

  remove.type = "button";
  remove.textContent = "Delete";

  remove.addEventListener(
    "click",
    () => {
      tasks = tasks.filter(
        (candidate) =>
          candidate.id !== task.id
      );

      saveTasks();
      render();
    }
  );

  actions.append(edit, remove);

  item.append(actions);

  return item;
}


// -----------------------------
// Inline Edit
// -----------------------------

function startInlineEdit(item, task) {
  item.replaceChildren();

  const editForm =
    document.createElement("form");

  editForm.className =
    "inline-edit-form";

  const input =
    document.createElement("input");

  input.type = "text";
  input.value = task.task;
  input.required = true;

  input.setAttribute(
    "aria-label",
    "Edit task"
  );

  const saveButton =
    document.createElement("button");

  saveButton.type = "submit";
  saveButton.textContent = "Save";

  const cancelButton =
    document.createElement("button");

  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";

  editForm.append(
    input,
    saveButton,
    cancelButton
  );

  item.append(editForm);

  input.focus();
  input.select();


  // Save edit
  editForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const newText =
        input.value.trim();

      if (!newText) {
        input.focus();
        return;
      }

      updateTask(task.id, {
        task: newText,
      });
    }
  );


  // Cancel edit
  cancelButton.addEventListener(
    "click",
    render
  );
}


// -----------------------------
// Update Task
// -----------------------------

function updateTask(id, changes) {
  tasks = tasks.map(
    (task) =>
      task.id === id
        ? {
            ...task,
            ...changes,
          }
        : task
  );

  saveTasks();
  render();
}


// -----------------------------
// Clear Completed
// -----------------------------

function clearCompletedTasks() {
  tasks = tasks.filter(
    (task) => !task.status
  );

  saveTasks();
  render();
}


// -----------------------------
// Export JSON
// -----------------------------

function exportTasks() {
  const data = JSON.stringify(
    tasks,
    null,
    2
  );

  const blob = new Blob(
    [data],
    {
      type: "application/json",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download = "toradora-tasks.json";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}


// -----------------------------
// Import JSON
// -----------------------------

function importTasks(file) {
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
      try {
        const imported =
          JSON.parse(reader.result);

        if (!Array.isArray(imported)) {
          throw new Error(
            "Imported data must be an array."
          );
        }

        const validTasks =
          imported.filter(isValidTask);

        if (
          validTasks.length !==
          imported.length
        ) {
          throw new Error(
            "Imported file contains invalid tasks."
          );
        }

        tasks = validTasks;

        saveTasks();
        render();

        alert(
          "Tasks imported successfully."
        );

      } catch (error) {
        alert(
          `Import failed: ${error.message}`
        );
      }
    }
  );

  reader.readAsText(file);
}


// -----------------------------
// Validate Imported Task
// -----------------------------

function isValidTask(task) {
  return (
    task &&
    Number.isInteger(task.id) &&
    typeof task.task === "string" &&
    (task.status === 0 ||
      task.status === 1) &&
    [1, 2, 3].includes(
      Number(task.priority)
    ) &&
    typeof task.longTerm === "boolean" &&
    typeof task.createdAt === "string"
  );
}


// -----------------------------
// Render
// -----------------------------

function render() {
  groupsElement.replaceChildren();

  const groups = groupTasks();

  let visibleCount = 0;

  Object.entries(groups).forEach(
    ([name, grouped]) => {
      if (!grouped.length) return;

      visibleCount +=
        grouped.length;

      const section =
        document.createElement(
          "section"
        );

      const heading =
        document.createElement(
          "h3"
        );

      // Task count
      heading.textContent =
        `${name} (${grouped.length})`;

      const list =
        document.createElement(
          "ul"
        );

      list.className =
        "task-list";

      grouped.forEach(
        (task) => {
          list.append(
            makeTaskElement(task)
          );
        }
      );

      section.append(
        heading,
        list
      );

      groupsElement.append(section);
    }
  );

  emptyState.hidden =
    visibleCount !== 0;
}


// -----------------------------
// Add Task Event
// -----------------------------

form.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    addTask(
      taskInput.value,
      priorityInput.value,
      longTermInput.checked
    );

    form.reset();

    priorityInput.value = "2";

    taskInput.focus();
  }
);


// -----------------------------
// Filters
// -----------------------------

showAllInput.addEventListener(
  "change",
  render
);

priorityFilter.addEventListener(
  "change",
  render
);


// -----------------------------
// Clear Completed Event
// -----------------------------

clearCompletedButton.addEventListener(
  "click",
  clearCompletedTasks
);


// -----------------------------
// Export Event
// -----------------------------

exportJsonButton.addEventListener(
  "click",
  exportTasks
);


// -----------------------------
// Import Event
// -----------------------------

importJsonButton.addEventListener(
  "click",
  () => {
    importFileInput.click();
  }
);

importFileInput.addEventListener(
  "change",
  () => {
    const file =
      importFileInput.files[0];

    if (!file) return;

    importTasks(file);

    // Allow importing the same file again
    importFileInput.value = "";
  }
);


// -----------------------------
// Initial Render
// -----------------------------

render();