const cl = console.log;
const todoForm = document.getElementById('todoForm');
const todoItem = document.getElementById('todoItem');
const todoDescription = document.getElementById('todoDescription');
const todoContainer = document.getElementById('todoContainer');
const isCompleted = document.getElementById('isCompleted');
const addTodoBtn = document.getElementById('addTodoBtn');
const updateTodoBtn = document.getElementById('updateTodoBtn');
const spinner = document.getElementById('spinner');


const base_url = `https://cruds-cd68e-default-rtdb.firebaseio.com/`;
const todo_url = `${base_url}/todocrud3.json`;

let state = {
    todosArr: [],
    edit_id: null
}


function objToArr(obj) {
    state.todosArr = [];
    for (const key in obj) {
        obj[key].id = key;
        state.todosArr.unshift(obj[key])
    }
}

function ontoggle(flag) {
    if (flag) {
        spinner.classList.remove('d-none');
    }
    else {
        spinner.classList.add('d-none');
    }
}

function snackBar(msg, icon) {
    swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}
function onTodoDescription(ele) {
    let li = ele.closest('li');
    let description = li.querySelector('.collapse');
    let open = description.classList.contains('show');
    let allDescription = ele.closest("#todoContainer").querySelectorAll(".collapse");
    allDescription.forEach(ele => ele.classList.remove('show'));
    if (!open) {
        description.classList.add('show');
    }
}

//read
async function fetchTodo() {
    try {
        ontoggle(true);
        let res = await fetch(todo_url, {
            method: "GET",
            body: null,
            headers: {
                "Content-Type": "application/json",
            }
        })
        if (!res.ok) {
            throw new Error("Error:" + res.status);
        }
        let data = await res.json();
        objToArr(data);
        renderTodo(state.todosArr);
    }
    catch (err) {
        snackBar(err.message, "error")
    }
    finally {
        ontoggle(false);
    }
}
fetchTodo();

function renderTodo(arr) {
    let res = ``;
    arr.forEach((ele) => {
        res += `
         <li class="list-group-item" id=${ele.id}>
                                <div class="d-flex justify-content-between" onclick="onTodoDescription(this)">
                                    <div>
                                        <input type="checkbox" ${ele.isCompleted ? 'checked' : ''} onclick="event.stopPropagation(); onCheck(this)">
                                        <strong>${ele.todoItem}</strong>
                                    </div>
                                    <div>
                                        <button class=" btn btn-info btn-sm"
                                            onclick="event.stopPropagation(); onEdit(this)">Edit</button>
                                        <button class="btn btn-danger btn-sm deleteBtn"
                                            onclick="event.stopPropagation(); onRemove(this)">Remove</button>
                                    </div>
                                </div>
                                <div class="collapse">
                                    <div class="card-body"> ${ele.todoDescription}</div>
                                </div>
                            </li>
        `
    })
    todoContainer.innerHTML = res;
}


//CREATE
async function onAddTodo(eve) {
    eve.preventDefault();
    try {
        let todo_obj = {
            todoItem: todoItem.value,
            todoDescription: todoDescription.value,
            isCompleted: isCompleted.value === 'yes' ? true : false,
        }
        ontoggle(true);
        let res = await fetch(todo_url,
            {
                method: "POST",
                body: JSON.stringify(todo_obj),
                headers: {
                    "content-Type": "application/json"
                }
            })
        if (!res.ok) {
            throw new Error("Error:" + res.status);
        }
        let data = await res.json();
        todo_obj.id = data.name;
        state.todosArr.unshift(todo_obj);
        let li = document.createElement('li');
        li.id = todo_obj.id;
        li.className = "list-group-item";
        li.innerHTML = `
         <div class="d-flex justify-content-between" onclick="onTodoDescription(this)">
                                    <div>
                                        <input type="checkbox" ${todo_obj.isCompleted ? 'checked' : ''} onclick="event.stopPropagation(); onCheck(this)">
                                        <strong>${todo_obj.todoItem}</strong>
                                    </div>
                                    <div>
                                        <button class=" btn btn-info btn-sm"
                                            onclick="event.stopPropagation(); onEdit(this)">Edit</button>
                                        <button class="btn btn-danger btn-sm deleteBtn"
                                            onclick="event.stopPropagation(); onRemove(this)">Remove</button>
                                    </div>
                                </div>
                                <div class="collapse">
                                    <div class="card-body">${todo_obj.todoDescription}</div>
                                </div>
        `
        todoContainer.prepend(li);
        todoForm.reset();
        snackBar("Todo added successfully", 'success');

    }
    catch (err) {
        snackBar(err.message, "error")
    }
    finally {
        ontoggle(false);
    }
}


//DELETE
async function onRemove(ele) {
    let remove_id = ele.closest('li').id;
    let remove_url = `${base_url}/todocrud3/${remove_id}.json`;
    let getConfirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    })
    if (getConfirm.isConfirmed) {
        try {
            ontoggle(true);
            let res = await fetch(remove_url, {
                method: "DELETE"
            })
            if (!res.ok) {
                throw new Error("failed to delete:" + res.status);
            }
            let getIndex = state.todosArr.findIndex(t => t.id === remove_id);
            if (getIndex !== -1) {
                state.todosArr.splice(getIndex, 1);

            }
            ele.closest('li').remove();
            snackBar("Todo deleted Successfully", 'success');
        }
        catch (err) {
            snackBar(err.message, 'error');
        }
        finally {
            ontoggle(false);
        }
    }

}


//EDIT
function onEdit(ele) {
    let EDIT_ID = ele.closest('li').id;
    state.edit_id = EDIT_ID;
    let EDIT_OBJ = state.todosArr.find(t => t.id === EDIT_ID);
    todoItem.value = EDIT_OBJ.todoItem;
    todoDescription.value = EDIT_OBJ.todoDescription;
    isCompleted.value = EDIT_OBJ.isCompleted ? "yes" : "no";

    addTodoBtn.classList.add('d-none');
    updateTodoBtn.classList.remove('d-none');

    const removeallBtn = document.querySelectorAll('.deleteBtn');
    removeallBtn.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('disabled');
    })
    const li = ele.closest('li');
    const deleteBtn = li.querySelector('.deleteBtn');
    deleteBtn.disabled = true;
    deleteBtn.classList.add('disabled');
}

//update
async function onupdateTodo() {
    try {
        ontoggle(true);
        let update_id = state.edit_id;
        let update_url = `${base_url}/todocrud3/${update_id}.json`;
        let updated_obj = {
            todoItem: todoItem.value,
            todoDescription: todoDescription.value,
            isCompleted: isCompleted.value === 'yes' ? true : false,
            id: update_id
        }
        let res = await fetch(update_url, {
            method: "PATCH",
            body: JSON.stringify(updated_obj),
            headers: {
                "content-Type": "application/json"
            }
        })
        if (!res.ok) {
            throw new Error("Failed To Update: " + res.status);
        }
        let obj = await res.json();
        let getIndex = state.todosArr.findIndex(t => t.id === update_id);
        if (getIndex !== -1) {
            state.todosArr[getIndex] = updated_obj;
        }
        let li = document.getElementById(update_id);
        li.innerHTML = `
        <div class="d-flex justify-content-between" onclick="onTodoDescription(this)">
                                    <div>
                                        <input type="checkbox" onclick="event.stopPropagation();onCheck(this)" ${obj.isCompleted ? 'checked' : ''}>
                                        <strong>${obj.todoItem}</strong>
                                    </div>
                                    <div>
                                        <button onclick="event.stopPropagation();onEdit(this)"
                                            class="btn btn-info btn-sm">Edit</button>
                                        <button onclick="event.stopPropagation();onRemove(this)"
                                            class="btn btn-sm btn-danger deleteBtn">Remove</button>
                                    </div>
                                     </div>

                                <div class="collapse">
                                    <div class="card-body"> ${obj.todoDescription} </div>
                                </div>
        `
        todoForm.reset();
        state.edit_id = null;

        addTodoBtn.classList.remove('d-none');
        updateTodoBtn.classList.add('d-none');
        snackBar("Todo updated successfully", "success");
        const ele = document.getElementById(update_id);
        const deleteBtn = ele.querySelector('.deleteBtn');
        deleteBtn.disabled = false;
        deleteBtn.classList.remove('disabled');

    }
    catch (err) {
        snackBar(err.message, 'error');
    }
    finally {
        ontoggle(false);
    }
}

async function onCheck(ele) {
    let li = ele.closest('li');
    let CHECK_ID = li.id;
    let check_url = `${base_url}/todocrud3/${CHECK_ID}.json`;
    let checkedValue = ele.checked;
    try {
        ontoggle(true);
        let res = await fetch(check_url, {
            method: "PATCH",
            body: JSON.stringify({ isCompleted: checkedValue }),
            headers: {
                "content-type": "application/json"
            }
        })
        if (!res.ok) {
            throw new Error('failed to check:' + res.status)
        }
        let todo = state.todosArr.find(t => t.id === CHECK_ID);
        if (todo) {
            todo.isCompleted = checkedValue;
        }
        snackBar('updated successfully', 'success');
    }
    catch (err) {
        ele.checked = !checkedValue;
        snackBar(err.message, 'error');
    }
    finally {
        ontoggle(false);
    }
}

todoForm.addEventListener('submit', onAddTodo);
updateTodoBtn.addEventListener('click', onupdateTodo);