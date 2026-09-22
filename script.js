const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");

const taskForm = document.getElementById("taskForm");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskStatus = document.getElementById("taskStatus");

const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");

const themeBtn = document.getElementById("themeBtn");



let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

let editingTaskId = null;


addTaskBtn.addEventListener("click", () => {

    editingTaskId = null;

    document.getElementById("modalTitle").textContent = "Add New Task";

    taskForm.reset();

    taskModal.classList.add("active");

    taskTitle.focus();
});


function closeTaskModal() {
    taskModal.classList.remove("active");
}

closeModal.addEventListener("click", closeTaskModal);


// Close modal when clicking outside

taskModal.addEventListener("click", (event) => {

    if (event.target === taskModal) {
        closeTaskModal();
    }

});




document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && taskModal.classList.contains("active")) {
        closeTaskModal();
    }

});


taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;
    const date = taskDate.value;
    const status = taskStatus.value;

    if (!title) {
        return;
    }


    // Editing existing task

    if (editingTaskId) {

        const task = tasks.find(
            task => task.id === editingTaskId
        );

        task.title = title;
        task.description = description;
        task.priority = priority;
        task.date = date;
        task.status = status;

    }


    else {

        const newTask = {

            id: crypto.randomUUID(),

            title: title,

            description: description,

            priority: priority,

            date: date,

            status: status

        };

        tasks.push(newTask);

    }


    saveTasks();

    renderTasks();

    closeTaskModal();

    taskForm.reset();

});


function saveTasks() {

    localStorage.setItem(
        "kanbanTasks",
        JSON.stringify(tasks)
    );

}




function renderTasks() {

    const todoList = document.getElementById("todoList");
    const progressList = document.getElementById("progressList");
    const doneList = document.getElementById("doneList");

    todoList.innerHTML = "";
    progressList.innerHTML = "";
    doneList.innerHTML = "";


    const searchTerm =
        searchInput.value.toLowerCase();

    const selectedPriority =
        priorityFilter.value;


    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm);

        const matchesPriority =
            selectedPriority === "all" ||
            task.priority === selectedPriority;

        return matchesSearch && matchesPriority;

    });


    filteredTasks.forEach(task => {

        const taskElement = createTaskElement(task);

        if (task.status === "todo") {

            todoList.appendChild(taskElement);

        }

        else if (task.status === "progress") {

            progressList.appendChild(taskElement);

        }

        else if (task.status === "done") {

            doneList.appendChild(taskElement);

        }

    });


    

    [todoList, progressList, doneList].forEach(list => {

        if (!list.children.length) {
            list.innerHTML = `<p class="empty-state">No tasks</p>`;
        }

    });


    updateDashboard();

}




function createTaskElement(task) {

    const taskDiv = document.createElement("div");

    taskDiv.className = "task";

    taskDiv.draggable = true;

    taskDiv.dataset.id = task.id;


    taskDiv.innerHTML = `

        <h3>${escapeHTML(task.title)}</h3>

        <p>
            ${escapeHTML(task.description || "No description")}
        </p>

        <div class="task-info">

            <span class="priority ${task.priority}">
                ${capitalize(task.priority)}
            </span>

            ${
                task.date
                ? `<span class="task-date">
                    📅 ${task.date}
                   </span>`
                : ""
            }

        </div>

        <div class="task-actions">

            <button class="edit-btn">
                ✏️ Edit
            </button>

            <button class="delete-btn">
                🗑️ Delete
            </button>

        </div>

    `;


    taskDiv
        .querySelector(".edit-btn")
        .addEventListener("click", () => {

            editTask(task.id);

        });


    // Delete button

    taskDiv
        .querySelector(".delete-btn")
        .addEventListener("click", () => {

            deleteTask(task.id);

        });


    // Drag events

    taskDiv.addEventListener("dragstart", () => {

        taskDiv.classList.add("dragging");

    });


    taskDiv.addEventListener("dragend", () => {

        taskDiv.classList.remove("dragging");

    });


    return taskDiv;

}




function editTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) return;


    editingTaskId = id;

    document.getElementById("modalTitle").textContent =
        "Edit Task";


    taskTitle.value = task.title;

    taskDescription.value =
        task.description;

    taskPriority.value =
        task.priority;

    taskDate.value =
        task.date || "";

    taskStatus.value =
        task.status;


    taskModal.classList.add("active");

}


function deleteTask(id) {

    const confirmed =
        confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;


    tasks = tasks.filter(
        task => task.id !== id
    );


    saveTasks();

    renderTasks();

}




function updateDashboard() {

    const todoTasks =
        tasks.filter(task => task.status === "todo");

    const progressTasks =
        tasks.filter(task => task.status === "progress");

    const doneTasks =
        tasks.filter(task => task.status === "done");


    document.getElementById("totalTasks").textContent =
        tasks.length;

    document.getElementById("todoCount").textContent =
        todoTasks.length;

    document.getElementById("progressCount").textContent =
        progressTasks.length;

    document.getElementById("doneCount").textContent =
        doneTasks.length;


    document.getElementById("todoBadge").textContent =
        todoTasks.length;

    document.getElementById("progressBadge").textContent =
        progressTasks.length;

    document.getElementById("doneBadge").textContent =
        doneTasks.length;

}




let searchTimeout;

searchInput.addEventListener("input", () => {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(renderTasks, 200);

});




priorityFilter.addEventListener("change", () => {

    renderTasks();

});

const columns =
    document.querySelectorAll(".task-list");


columns.forEach(column => {

    column.addEventListener("dragover", (event) => {

        event.preventDefault();

        column.classList.add("drag-over");

    });


    column.addEventListener("dragleave", () => {

        column.classList.remove("drag-over");

    });


    column.addEventListener("drop", (event) => {

        event.preventDefault();

        column.classList.remove("drag-over");


        const draggingTask =
            document.querySelector(".dragging");


        if (!draggingTask) return;


        const taskId =
            draggingTask.dataset.id;


        const task =
            tasks.find(task => task.id === taskId);


        if (!task) return;


        const parentColumn =
            column.closest(".column");


        const newStatus =
            parentColumn.dataset.status;


        task.status = newStatus;


        saveTasks();

        renderTasks();

    });

});



themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");


    const darkMode =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "kanbanDarkMode",
        darkMode
    );


    themeBtn.textContent =
        darkMode ? "☀️" : "🌙";

});




const savedTheme =
    localStorage.getItem("kanbanDarkMode");


if (savedTheme === "true") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

}




function capitalize(word) {

    return word.charAt(0).toUpperCase() +
        word.slice(1);

}




function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


renderTasks();