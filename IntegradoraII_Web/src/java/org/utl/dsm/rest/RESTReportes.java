package org.utl.dsm.rest;

import com.google.gson.Gson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import org.utl.dsm.integradoraweb.controller.ControllerReporte;
import org.utl.dsm.integradoraweb.model.Reporte;

@Path("reporte")
public class RESTReportes {

    @GET
    @Path("getAll")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAll() {
        try {
            ControllerReporte cr = new ControllerReporte();
            List<Reporte> lista = cr.getAll();
            return Response.ok(new Gson().toJson(lista)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @GET
    @Path("getMateriales")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getMateriales() {
        try {
            ControllerReporte cr = new ControllerReporte();
            List<Reporte> lista = cr.getMaterialesParaReporte();
            return Response.ok(new Gson().toJson(lista)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @POST
    @Path("insertar")
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertar(@FormParam("datos") String datos,
            @FormParam("idUsuario") int idU,
            @FormParam("idInventario") int idI) {
        try {
            Gson gson = new Gson();
            Reporte r = gson.fromJson(datos, Reporte.class);
            ControllerReporte cr = new ControllerReporte();
            cr.insertar(r, idU, idI);
            return Response.ok("{\"res\":\"Éxito\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }

    @POST
    @Path("eliminar")
    @Produces(MediaType.APPLICATION_JSON)
    public Response eliminar(@FormParam("idReporte") int idR) {
        try {
            ControllerReporte cr = new ControllerReporte();
            cr.eliminar(idR);
            return Response.ok("{\"res\":\"Reporte eliminado correctamente\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }
}
