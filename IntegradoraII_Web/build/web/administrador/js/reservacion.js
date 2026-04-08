/**
 * Archivo: reservacion.js
 * Controlador de la vista de reservaciones con integracion de SweetAlert2 y rutas de produccion
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Rutas de produccion para servidor Railway (Activas)
    // ==========================================
    const URL_BASE = "https://netbeansintegradora-production.up.railway.app/api/reservacion";

    // Recuperacion de informacion de sesion
    const nombre = localStorage.getItem("nombre_usuario") || "Usuario";
    const rolRaw = localStorage.getItem("id_rol") || "Invitado";
    
    if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').textContent = nombre;
    if (document.getElementById('userRoleDisplay')) document.getElementById('userRoleDisplay').textContent = rolRaw;
    
    let reservaciones = [];
    let salonesBD = [];

    const tablaBody = document.getElementById('tablaReservas');
    const form = document.getElementById('formReserva');
    const modalElement = document.getElementById('reservaModal');
    const modal = new bootstrap.Modal(modalElement);
    const selectEdificio = document.getElementById('edificioSelect');
    const selectSalon = document.getElementById('salonSelect');

    /**
     * Consumo de servicio para obtener el listado de edificios y salones
     */
    function cargarEdificiosYSalones() {
        fetch(`${URL_BASE}/getSalones`)
            .then(r => r.json())
            .then(data => {
                salonesBD = data;
                const edificiosUnicos = [...new Set(salonesBD.map(s => s.edificio))];
                
                selectEdificio.innerHTML = '<option value="" disabled selected>Seleccione Edificio</option>';
                edificiosUnicos.forEach(edificio => {
                    const option = document.createElement('option');
                    option.value = edificio;
                    option.textContent = edificio;
                    selectEdificio.appendChild(option);
                });

                if (edificiosUnicos.length > 0) {
                    cargarSalones();
                }
            })
            .catch(e => {
                console.error(e);
                Swal.fire('Error', 'No se pudieron cargar los salones.', 'error');
            });
    }

    /**
     * Filtrado dinamico de salones basado en el edificio seleccionado
     */
    window.cargarSalones = () => {
        const edificioSeleccionado = selectEdificio.value;
        selectSalon.innerHTML = '<option value="" disabled selected>Seleccione Salon</option>';
        
        const salonesFiltrados = salonesBD.filter(s => s.edificio === edificioSeleccionado);
        
        salonesFiltrados.forEach(salon => {
            const option = document.createElement('option');
            option.value = salon.idSalon; 
            option.textContent = salon.nombre;
            selectSalon.appendChild(option);
        });
    };

    selectEdificio.addEventListener('change', cargarSalones);

    /**
     * Actualizacion de indicadores cuantitativos en la interfaz
     */
    function actualizarTarjetas() {
        const total = reservaciones.length;
        const pendientes = reservaciones.filter(r => r.estatus === 'Pendiente').length;
        const activas = reservaciones.filter(r => r.estatus === 'Activo').length;
        const contadores = document.querySelectorAll('.row.g-4 h3 span');
        if (contadores && contadores.length >= 3) {
            contadores[0].innerText = total;
            contadores[1].innerText = pendientes;
            contadores[2].innerText = activas;
        }
    }

    /**
     * Renderizado dinamico de la tabla de reservaciones
     */
    function render() {
        tablaBody.innerHTML = '';
        reservaciones.forEach(res => {
            const tr = document.createElement('tr');
            const fechaFormateada = res.fechaHora ? res.fechaHora.replace('T', ' ') : '';
            let badgeClass = res.estatus === "Pendiente" ? "bg-warning text-dark" : 
                             res.estatus === "Activo" ? "bg-success text-white" : 
                             res.estatus === "Rechazado" ? "bg-danger text-white" : "bg-info text-white";

            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle text-white d-flex align-items-center justify-content-center me-2" style="width:30px;height:30px;font-size:10px; background-color: #2a2155;">
                            ${res.matricula ? res.matricula.slice(-2) : 'NA'}
                        </div>
                        <span class="fw-medium">${res.matricula}</span>
                    </div>
                </td>
                <td><span class="text-muted small">${res.nombreEdificio}</span></td>
                <td><span class="fw-bold" style="color: #2a2155;">${res.nombreSalon}</span></td>
                <td><i class="bi bi-clock me-1 text-muted"></i> ${fechaFormateada}</td>
                <td><span class="badge ${badgeClass}">${res.estatus.toUpperCase()}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editRes(${res.idReserva})"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRes(${res.idReserva})"><i class="bi bi-trash3-fill"></i></button>
                </td>`;
            tablaBody.appendChild(tr);
        });
        
        actualizarTarjetas();
        actualizarFiltrosDesdeTabla(); 
    }

    /**
     * Obtencion de reservaciones desde la API
     */
    function cargarReservaciones() {
        fetch(`${URL_BASE}/getAll`)
            .then(r => r.json())
            .then(data => {
                reservaciones = data;
                render();
            })
            .catch(e => {
                console.error(e);
                Swal.fire('Error', 'Error de conexion al cargar las reservaciones.', 'error');
            });
    }

    /**
     * Manejo del envio del formulario (Insertar/Actualizar)
     */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('reservaId').value;
        const endpoint = id ? `${URL_BASE}/actualizar` : `${URL_BASE}/insertar`;

        const salonElegido = parseInt(selectSalon.value);
        if (!salonElegido) {
            Swal.fire('Atencion', 'Por favor seleccione un salon.', 'warning');
            return;
        }

        Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const reservacionObj = {
            idReserva: id ? parseInt(id) : 0,
            idUsuario: 1, 
            idSalon: salonElegido, 
            fechaHora: document.getElementById('fecha').value.replace('T', ' ') + ':00',
            estatus: document.getElementById('estadoSelect').value
        };

        const formData = new URLSearchParams();
        formData.append("reservacion", JSON.stringify(reservacionObj));

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
            } else { 
                modal.hide(); 
                form.reset(); 
                cargarReservaciones();
                Swal.fire('¡Exito!', 'La reservacion se guardo correctamente.', 'success');
            }
        })
        .catch(err => Swal.fire('Error', 'No se pudo procesar la solicitud.', 'error'));
    });
    
    /**
     * Carga de datos en el modal para edicion
     */
    window.editRes = (id) => {
        const res = reservaciones.find(r => r.idReserva === id);
        if (res) {
            document.getElementById('reservaId').value = res.idReserva;
            if(document.getElementById('matricula')) {
                document.getElementById('matricula').value = res.matricula;
            }
            
            selectEdificio.value = res.nombreEdificio;
            cargarSalones();
            
            for (let i = 0; i < selectSalon.options.length; i++) {
                if (selectSalon.options[i].text === res.nombreSalon) { 
                    selectSalon.selectedIndex = i; 
                    break; 
                }
            }
            
            if (res.fechaHora) {
                document.getElementById('fecha').value = res.fechaHora.replace(' ', 'T').substring(0, 16);
            }
            document.getElementById('estadoSelect').value = res.estatus;
            modal.show();
        }
    };

    /**
     * Eliminacion de registro con confirmacion de SweetAlert2
     */
    window.deleteRes = (id) => {
        Swal.fire({
            title: '¿Estas seguro?',
            text: "Esta accion no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2a2155',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const f = new URLSearchParams(); 
                f.append("idReserva", id);
                
                fetch(`${URL_BASE}/eliminar`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: f 
                })
                .then(r => r.json())
                .then(data => {
                    if(data.error) {
                        Swal.fire('Error', data.error, 'error');
                    } else {
                        cargarReservaciones();
                        Swal.fire('Eliminado', 'La reservacion ha sido borrada.', 'success');
                    }
                });
            }
        });
    };

    window.limpiarForm = () => {
        form.reset();
        document.getElementById('reservaId').value = '';
        if (selectEdificio.options.length > 0) {
            selectEdificio.selectedIndex = 0;
            cargarSalones();
        }
    };

    /**
     * Configuracion de los selectores de filtrado
     */
    function actualizarFiltrosDesdeTabla() {
        const filas = document.querySelectorAll("#tablaReservas tr");
        const edificios = new Set();
        const estatusSet = new Set();

        filas.forEach(fila => {
            const celdas = fila.querySelectorAll("td");
            if (celdas.length < 5) return;
            edificios.add(celdas[1].textContent.trim());
            estatusSet.add(celdas[4].textContent.trim().toUpperCase());
        });

        llenarSelect("filtroEdificioRes", edificios, "Todos los edificios");
        llenarSelect("filtroEstadoRes", estatusSet, "Todos los estados");
    }

    function llenarSelect(id, valores, textoDefault) {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = `<option value="">${textoDefault}</option>`;
        valores.forEach(v => select.innerHTML += `<option value="${v}">${v}</option>`);
    }

    /**
     * Logica de filtrado visual de la tabla
     */
    document.getElementById("btnFiltrarRes")?.addEventListener("click", () => {
        const edi = document.getElementById("filtroEdificioRes").value;
        const est = document.getElementById("filtroEstadoRes").value;

        document.querySelectorAll("#tablaReservas tr").forEach(fila => {
            const celdas = fila.querySelectorAll("td");
            if (celdas.length < 5) return;
            
            const edificio = celdas[1].textContent.trim();
            const estado = celdas[4].textContent.trim().toUpperCase();

            let visible = true;
            if (edi && edificio !== edi) visible = false;
            if (est && estado !== est) visible = false;

            fila.style.display = visible ? "" : "none";
        });
    });

    // Inicializacion de datos
    cargarEdificiosYSalones();
    cargarReservaciones();
});

/**
 * Destruccion de sesion
 */
window.cerrarSesion = () => {
    localStorage.clear();
    window.location.href = "../index.html";
};