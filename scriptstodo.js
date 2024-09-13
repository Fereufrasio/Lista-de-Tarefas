// Seleção de elementos
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterBtn = document.querySelector("#filter-select");
const categorySelect = document.querySelector("#category-select");

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

let oldInputValue;

// Funções de Armazenamento Local
function saveTasksToLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
}

// Funções de Tarefas
const saveTodo = (text, done = 0, save = 1, category = 'work', deadline = '') => {
    if (text.trim() === "") {
        alert("A tarefa não pode estar vazia!");
        return;
    }

    const todo = document.createElement("div");
    todo.classList.add("todo");
    if (category === 'priority') {
        todo.classList.add("priority");
    }

    const todoTitle = document.createElement("h3");
    todoTitle.innerText = text;
    todo.appendChild(todoTitle);

    const deadlineElem = document.createElement("p");
    deadlineElem.innerText = `Prazo: ${deadline ? formatDate(deadline) : 'Sem prazo'}`;
    todo.appendChild(deadlineElem);

    const doneBtn = document.createElement("button");
    doneBtn.classList.add("finish-todo");
    doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    todo.appendChild(doneBtn);

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-todo");
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    todo.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("remove-todo");
    deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    todo.appendChild(deleteBtn);

    todo.classList.add("fade-in");

    if (done) {
        todo.classList.add("done");
    }

    if (save) {
        saveTodoLocalStorage({ text, done, category, deadline });
    }

    todoList.appendChild(todo);
    todoInput.value = "";
    document.querySelector("#deadline-input").value = "";
    categorySelect.value = "work";

    setTimeout(() => {
        todo.classList.remove("fade-in");
    }, 1000);
};

const toggleForms = () => {
    editForm.classList.toggle("hide");
    todoForm.classList.toggle("hide");
    todoList.classList.toggle("hide");
};

const updateTodo = (text) => {
    const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
        let todoTitle = todo.querySelector("h3");

        if (todoTitle.innerText === oldInputValue) {
            todoTitle.innerText = text;
            updateTodoLocalStorage(oldInputValue, text);
        }
    });
};

const getSearchedTodos = (search) => {
    const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
        const todoTitle = todo.querySelector("h3").innerText.toLowerCase();
        todo.style.display = "flex";

        if (!todoTitle.includes(search.toLowerCase())) {
            todo.style.display = "none";
        }
    });
};

const filterTodos = (filterValue, categoryFilter) => {
    const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
        const isCategoryMatch = categoryFilter === 'all' || todo.classList.contains(categoryFilter);
        const isDoneMatch = filterValue === 'all' || (filterValue === 'done' && todo.classList.contains('done')) || (filterValue === 'todo' && !todo.classList.contains('done'));

        if (isCategoryMatch && isDoneMatch) {
            todo.style.display = "flex";
        } else {
            todo.style.display = "none";
        }
    });
};

// Eventos
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputValue = todoInput.value;
    const deadline = document.querySelector("#deadline-input").value;
    const category = categorySelect.value;

    if (inputValue) {
        saveTodo(inputValue, 0, 1, category, deadline);
    }
});

document.addEventListener("click", (e) => {
    const targetEl = e.target;
    const parentEl = targetEl.closest("div");

    if (!parentEl) return; // Verifica se existe um elemento pai "div"

    let todoTitle = parentEl.querySelector("h3") ? parentEl.querySelector("h3").innerText : "";

    if (targetEl.classList.contains("finish-todo")) {
        parentEl.classList.toggle("done");
        updateTodoStatusLocalStorage(todoTitle);
    }

    if (targetEl.classList.contains("remove-todo")) {
        // Confirmação antes de excluir (Alerta de confirmação)
        if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
            parentEl.classList.add("fade-out");
            setTimeout(() => {
                parentEl.remove();
                removeTodoLocalStorage(todoTitle);
            }, 300); // Aguarda a animação de saída
        }
    }

    if (targetEl.classList.contains("edit-todo")) {
        toggleForms();
        editInput.value = todoTitle;
        oldInputValue = todoTitle;
    }
});

cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    editInput.value = ""; // Limpa o campo de entrada
    toggleForms();
});

editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const editInputValue = editInput.value;

    if (editInputValue) {
        updateTodo(editInputValue);
    }

    toggleForms();
});

searchInput.addEventListener("keyup", (e) => {
    const search = e.target.value;
    getSearchedTodos(search);
});

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("keyup"));
});

filterBtn.addEventListener("change", (e) => {
    const filterValue = e.target.value;
    const categoryFilter = document.querySelector("#category-filter").value;
    filterTodos(filterValue, categoryFilter);
});

// Local Storage
const getTodosLocalStorage = () => {
    return JSON.parse(localStorage.getItem("todos")) || [];
};

const loadTodos = () => {
    const todos = getTodosLocalStorage();
    todos.forEach((todo) => {
        saveTodo(todo.text, todo.done, 0, todo.category, todo.deadline);
    });
};

const saveTodoLocalStorage = (todo) => {
    const todos = getTodosLocalStorage();
    todos.push(todo);
    saveTasksToLocalStorage(todos);
};

const removeTodoLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage();
    const filteredTodos = todos.filter((todo) => todo.text !== todoText);
    saveTasksToLocalStorage(filteredTodos);
};

const updateTodoStatusLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage();
    const updatedTodos = todos.map((todo) => {
        if (todo.text === todoText) {
            todo.done = !todo.done;
        }
        return todo;
    });
    saveTasksToLocalStorage(updatedTodos);
};

const updateTodoLocalStorage = (todoOldText, todoNewText) => {
    const todos = getTodosLocalStorage();
    const updatedTodos = todos.map((todo) => {
        if (todo.text === todoOldText) {
            todo.text = todoNewText;
        }
        return todo;
    });
    saveTasksToLocalStorage(updatedTodos);
};

// Carrega as tarefas ao carregar a página
loadTodos();
