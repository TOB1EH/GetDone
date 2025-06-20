/**
 *  TO-DO:
 *  Redirigir al login
 */
function logout() {
      window.location.href = "../views/auth/login.html";
    }


/**
 *  Actualizar lista de tareas, solicita al backend un JSON desde
 *  http://localhost:3000/tasks con los siguientes campos por cada tarea:
 *  [
 *    {
 *      "title": string,         // Título de la tarea
 *      "description": string,   // Descripción breve
 *      "priority": string,      // Prioridad (por ejemplo: 'Alta', 'Media', 'Baja')
 *      "due_date": string       // Fecha de vencimiento en formato 'YYYY-MM-DD'
 *    },
 *    ...
 *  ]
 *
 *  La función limpia el contenido actual del contenedor con id 'taskList'
 *  y agrega dinámicamente los elementos correspondientes a cada tarea recibida.
 */
async function loadTasks() {
    try {
      const res = await fetch('http://localhost:3000/api/tasks');
      // const res = await fetch('/api/tasks'); //Antes estaba: http://localhost:3000/tasks --> Error, front se debe comunicar con back a través de la API
      const tasks = await res.json(); //Espera a que el servidor responda y convierte ese JSON en un objeto usable en JavaScript, guardandolo en la variable tasks
      const list = document.getElementById('taskList'); //Trae la lista de tareas del HTML

      list.innerHTML = ''; // limpiamos antes de agregar

      tasks.forEach(task => {
        const completedClass = task.completed ? 'completed' : '';
        
        // Calcular si la tarea expira en 1 día o menos
        const today = new Date();
        const dueDate = new Date(task.delivery_date);
        const diffTime = dueDate.getTime() - today.setHours(0,0,0,0);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Si falta 1 día o menos, aplicar clase de expiración
        const expClass = (diffDays <= 1 && diffDays >= 0 && !task.completed) ? 'expiring-soon' : '';

        const html = `
         <div class="row align-items-center task-item ${completedClass}">
           <div class="col-auto">
             <input type="checkbox" class="form-check-input" id="taskCheckbox-${task.id}" 
               ${task.completed ? 'checked' : ''} 
               onchange="toggleTaskCompletion(${task.id}, this)">
           </div>
           <div class="col">
             <h5 class="mb-0">${task.title}</h5>
             <p class="text-muted mb-0">${task.description}</p> 
           </div>
           <div class="col-auto task-meta">
             <div class="d-flex align-items-start gap-2">
               <div class="dropdown text-end mt-2">
                 <button class="btn btn-light btn-sm" type="button" id="dropdownMenuButton"
                   data-bs-toggle="dropdown" aria-expanded="false">
                   <i class="bi bi-three-dots-vertical"></i> 
                 </button>
                 <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                   <li><a class="dropdown-item" href="#" onclick="editTask(${task.id})">Editar</a></li>
                   <li><a class="dropdown-item text-danger" href="#" onclick="deleteTask()">Eliminar</a></li>
                 </ul>
               </div>
               <div>
                 <strong>Prioridad: ${task.priority}</strong><br>
                 <span class="status-box ${expClass}" id="taskExpiration-${task.id}">
                   Exp: ${task.delivery_date}
                 </span>
               </div>
             </div>
           </div>
         </div>
`       ;   
        list.innerHTML += html; //Carga dinámicamente el HTML de cada tarea en la lista del frontend
      });
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  }

  async function toggleTaskCompletion(taskId, checkbox) {
    const isCompleted = checkbox.checked; // Obtener el estado del checkbox
    const expirationElement = document.getElementById(`taskExpiration-${taskId}`);
  
    // Cambiar el color del contenedor de la fecha de expiración
    if (isCompleted) {
      expirationElement.classList.remove('expiring-soon'); // Quita el rojo si está presente
      expirationElement.classList.add('bg-success'); // Agrega el verde
    } else {
      expirationElement.classList.remove('bg-success'); // Quita el verde
  
      // Reaplica el rojo si la tarea está por vencer
      const today = new Date();
      const dueDate = new Date(expirationElement.textContent.split(': ')[1]); // Extrae la fecha
      const diffTime = dueDate.getTime() - today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
      if (diffDays <= 1 && diffDays >= 0) {
        expirationElement.classList.add('expiring-soon'); // Vuelve a agregar el rojo
      }
    }
  
    // Enviar la actualización al backend
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: isCompleted }) // Enviar el estado como JSON
      });
  
      if (!res.ok) {
        throw new Error('Error al actualizar el estado de la tarea');
      }

      const data = await res.json();
      console.log('Tarea actualizada:', data);
    } catch (error) {
      console.error(error);
      alert('No se pudo actualizar el estado de la tarea.');
    }
  }

async function editTask(id) {
  const newDescription = prompt("Nueva descripción de la tarea:"); //Recibe la nueva descripción de la tarea

  if (!newDescription) return;

  const newDate = prompt("Nueva fecha de vencimiento (YYYY-MM-DD):"); //Recibe la nueva fecha de vencimiento

  //Valida que la fecha tenga el formato correcto
  if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    alert("Fecha inválida. Debe tener el formato YYYY-MM-DD.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/tasks/${id}`, { // Se utiliza para que el frontend se comunique con el backend o con cualquier API.
      method: 'PUT', // Método HTTP para actualizar
      headers: { 'Content-Type': 'application/json' }, // Indica que el cuerpo de la petición es JSON
      body: JSON.stringify({ // Se encarga de enviar datos al servidor en formato JSON.
        description: newDescription,
        delivery_date: newDate
      })
    });

    const data = await res.json(); //Espera a que el servidor responda y convierte ese JSON en un objeto usable en JavaScript

    if (res.ok) {
      alert(data.mensaje); // Muestra en pantalla el mensaje que devolvió el backend ("Tarea actualizada correctamente")
      loadTasks(); // Refrescar la lista dinámicamente
    } else {
      alert("Error: " + data.error);
    }

  } catch (error) {
    console.error(error);
    alert("Error al actualizar la tarea.");
  }
}

/**
 * TO-DO:
 * Redireccion a creacion de tareas
 */
function goToCreateTask() {
    window.location.href = "tasks.html";
  }

 // Llamamos la función al cargar la página
 window.onload = loadTasks;
