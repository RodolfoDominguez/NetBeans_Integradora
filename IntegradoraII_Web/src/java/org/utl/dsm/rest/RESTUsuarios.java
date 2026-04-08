package org.utl.dsm.rest;

import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.FormParam;
import java.util.List;

import org.utl.dsm.integradoraweb.controller.ControllerUsuarios;
import org.utl.dsm.integradoraweb.model.Usuarios;

/**
 * Controlador REST para la gestion y exposicion de servicios de la entidad Usuarios
 * @author rodod
 */
@Path("usuario")
public class RESTUsuarios {

    @POST
    @Path("login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(Usuarios ul) {

        // --- Inicio de bloque de depuracion ---
        // Registro en consola de los datos de autenticacion recibidos desde el cliente para monitoreo de peticiones
        System.out.println("LLEGÓ A JAVA -> Matrícula: " + ul.getMatricula() + " | Pass: " + ul.getContrasenia());
        // --- Fin de bloque de depuracion ---

        try {
            ControllerUsuarios ctrl = new ControllerUsuarios();
            Usuarios u = ctrl.login(ul.getMatricula(), ul.getContrasenia());
            
            if (u == null) {
                JsonObject error = new JsonObject();
                error.addProperty("error", "Credenciales inválidas o usuario inactivo.");
                return Response.status(Response.Status.UNAUTHORIZED).entity(error.toString()).build();
            }

            Gson gson = new Gson();
            String out = gson.toJson(u);
            return Response.status(Response.Status.OK).entity(out).build();

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error interno del servidor. Intente más tarde.");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error.toString()).build();
        }
    }

    // ==========================================
    // Seccion de endpoints correspondientes a las operaciones transaccionales (CRUD)
    // ==========================================
    
    @GET
    @Path("getAll")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAll() {
        try {
            ControllerUsuarios ctrl = new ControllerUsuarios();
            List<Usuarios> lista = ctrl.getAll();

            Gson gson = new Gson();
            String out = gson.toJson(lista);
            return Response.status(Response.Status.OK).entity(out).build();

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error al consultar los usuarios.");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error.toString()).build();
        }
    }

    @POST
    @Path("insertar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertar(Usuarios u) {
        try {
            ControllerUsuarios ctrl = new ControllerUsuarios();
            ctrl.insertar(u);

            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("mensaje", "Usuario registrado correctamente.");
            return Response.status(Response.Status.OK).entity(respuesta.toString()).build();

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error al registrar el usuario.");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error.toString()).build();
        }
    }

    @POST
    @Path("modificar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response modificar(Usuarios u) {
        try {
            ControllerUsuarios ctrl = new ControllerUsuarios();
            ctrl.modificar(u);

            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("mensaje", "Usuario modificado correctamente.");
            return Response.status(Response.Status.OK).entity(respuesta.toString()).build();

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error al modificar el usuario.");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error.toString()).build();
        }
    }

    @POST
    @Path("eliminar")
    @Produces(MediaType.APPLICATION_JSON)
    public Response eliminar(@FormParam("id_usuario") int idUsuario) {
        try {
            ControllerUsuarios ctrl = new ControllerUsuarios();
            ctrl.eliminar(idUsuario);

            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("mensaje", "Usuario eliminado correctamente.");
            return Response.status(Response.Status.OK).entity(respuesta.toString()).build();

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error al eliminar el usuario.");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error.toString()).build();
        }
    }

    // ==========================================
    // Endpoints dedicados al flujo de recuperacion y restablecimiento de contrasenas
    // ==========================================

    @POST
    @Path("solicitarRecuperacion")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response solicitarRecuperacion(Usuarios u) {
        try {
            ControllerUsuarios ctrl = new ControllerUsuarios();
            
            // Invocacion del controlador para la conexion con el servidor SMTP y generacion del correo electronico
            ctrl.enviarCorreoRecuperacion(u.getCorreo());
            
            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("mensaje", "Correo de recuperacion enviado exitosamente.");
            return Response.status(Response.Status.OK).entity(respuesta.toString()).build();

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("error", "Ocurrio un error al intentar enviar el correo.");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error.toString()).build();
        }
    }

    @POST
    @Path("actualizarPassword")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizarPassword(Usuarios u) {
        try {
            ControllerUsuarios ctrl = new ControllerUsuarios();
            
            // Ejecucion del metodo de persistencia para aplicar el cifrado y actualizar la credencial en la base de datos
            ctrl.actualizarPassword(u.getCorreo(), u.getContrasenia());
            
            JsonObject respuesta = new JsonObject();
            respuesta.addProperty("mensaje", "Contrasena actualizada correctamente.");
            return Response.status(Response.Status.OK).entity(respuesta.toString()).build();

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject error = new JsonObject();
            error.addProperty("error", "Error al actualizar la contrasena en el servidor.");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error.toString()).build();
        }
    }
}