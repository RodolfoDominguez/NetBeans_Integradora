document.addEventListener('DOMContentLoaded', () => {
    // Obtener las referencias principales de los elementos del DOM
    const modal = document.getElementById('modalRecuperacion');
    const btnCerrar = document.getElementById('cerrarModalRecuperacion');
    const linkOlvide = document.getElementById('link-olvide-pass');
    
    // Obtener las referencias de los formularios y textos dinamicos
    const formSolicitar = document.getElementById('form-solicitar');
    const formActualizar = document.getElementById('form-actualizar');
    const titulo = document.getElementById('tituloModal');
    const subtitulo = document.getElementById('subtituloModal');
    
    // ==========================================
    // Rutas de produccion para servidor Railway (Activas)
    // ==========================================
    const API_BASE = "https://netbeansintegradora-production.up.railway.app/api/usuario/";

    // ==========================================
    // Rutas locales para entorno de desarrollo (Comentadas)
    // ==========================================
    // const API_BASE = "http://localhost:8080/IntegradoraII_Web/api/usuario/";

    // Verificar los parametros de la URL para determinar si el usuario proviene de un enlace de recuperacion
    const urlParams = new URLSearchParams(window.location.search);
    const isReset = urlParams.get('reset');
    const correoDestino = urlParams.get('correo');

    // Mostrar el formulario de nueva contrasena si los parametros indican un restablecimiento activo
    if (isReset === 'true' && correoDestino) {
        modal.style.display = 'flex';
        formSolicitar.style.display = 'none';
        formActualizar.style.display = 'block';
        titulo.innerText = 'Crear nueva contrasena';
        subtitulo.innerText = 'Ingresa una nueva clave para ' + correoDestino;
        document.getElementById('correo-destino').value = correoDestino;
    }

    // Configurar el evento para abrir el modal de recuperacion al hacer clic en el enlace correspondiente
    if(linkOlvide) {
        linkOlvide.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            formSolicitar.style.display = 'block';
            formActualizar.style.display = 'none';
            titulo.innerText = 'Recuperar Contrasena';
            subtitulo.innerText = 'Ingresa tu correo para recibir un enlace';
        });
    }

    // Configurar el evento para cerrar la ventana modal y restablecer el estado visual
    if(btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            modal.style.display = 'none';
            
            // Limpiar los parametros de la URL al cerrar el modal para evitar reaperturas accidentales al recargar la pagina
            if(isReset) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        });
    }

    // Manejar el envio del formulario para solicitar el correo de recuperacion
    if(formSolicitar) {
        formSolicitar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo = document.getElementById('correo-recuperacion').value;
            
            Swal.fire({ title: 'Enviando enlace...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const response = await fetch(API_BASE + 'solicitarRecuperacion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: correo })
                });

                const data = await response.json();
                
                if(response.ok) {
                    Swal.fire('Exito', 'Revisa tu bandeja de entrada o SPAM.', 'success');
                    modal.style.display = 'none';
                    formSolicitar.reset();
                } else {
                    Swal.fire('Error', data.error || 'No se pudo enviar el correo.', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
            }
        });
    }

    // Manejar el envio del formulario para guardar y confirmar la nueva contrasena
    if(formActualizar) {
        formActualizar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pass1 = document.getElementById('new-password').value;
            const pass2 = document.getElementById('confirm-password').value;
            const correo = document.getElementById('correo-destino').value;

            // Validacion de coincidencia de contrasenas
            if(pass1 !== pass2) {
                Swal.fire('Atencion', 'Las contrasenas no coinciden.', 'warning');
                return;
            }

            Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const response = await fetch(API_BASE + 'actualizarPassword', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: correo, contrasenia: pass1 })
                });
                
                const data = await response.json();

                // Procesar respuesta exitosa de la API
                if(response.ok) {
                    Swal.fire('Exito', 'Contrasena actualizada. Ya puedes iniciar sesion.', 'success').then(() => {
                        modal.style.display = 'none';
                        // Limpiar la URL de los parametros de seguridad tras una actualizacion exitosa
                        window.history.replaceState({}, document.title, window.location.pathname);
                        formActualizar.reset();
                    });
                } else {
                    Swal.fire('Error', data.error, 'error');
                }
            } catch(error) {
                Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
            }
        });
    }
});