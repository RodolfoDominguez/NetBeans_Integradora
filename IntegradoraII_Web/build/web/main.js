document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("menu-toggle");
  const body = document.body;

  if (toggleButton) {
    const icon = toggleButton.querySelector("i");
    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      body.classList.toggle("sb-hidden");
    });
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });

  // -------- Validación de login --------
  const form = document.querySelector(".form");
  if (!form) return; // Evita errores si no encuentra el formulario.

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtenemos los valores de los inputs.
    const nombreUsuario = usernameInput.value.trim();
    const contrasenia = passwordInput.value.trim();

    if (!nombreUsuario || !contrasenia) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/IntegradoraII_Web/api/usuario/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // AQUÍ ESTÁ LA MAGIA: Cambiamos para que envíe "matricula" en lugar de "nombreUsuario"
        // para que coincida exactamente con tu modelo de Java.
        body: JSON.stringify({ 
            matricula: nombreUsuario, 
            contrasenia: contrasenia 
        })
      });

      // Aquí inicia la modificación, Mau.
      const data = await response.json();

      if (response.ok) {
          console.log("Usuario autenticado:", data);

          // Esto me permite guardar los datos en el localStorage.
          localStorage.setItem("id_usuario", data.id_usuario);
          localStorage.setItem("id_rol", data.id_rol);
          localStorage.setItem("nombre_usuario", `${data.nombre} ${data.apellido_paterno}`);
          localStorage.setItem("matricula", data.matricula);

          window.location.href = "administrador/dashboard.html";
      } else {
          alert(data.error || "Credenciales incorrectas.");
      }

    } catch (error) {
        console.error("Error al conectarse al servidor:", error);
        alert("No se pudo conectar al servidor. Intenta más tarde.");
    }
  });
});