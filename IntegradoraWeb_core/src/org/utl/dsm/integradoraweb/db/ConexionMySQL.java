
package org.utl.dsm.integradoraweb.db;

import java.sql.Connection;
import java.sql.DriverManager;

public class ConexionMySQL {

    Connection conn;

    public Connection open() {
        String user = "root";
        String password = "9632147RoSa.";
        String url = "jdbc:mysql://localhost:3306/db_gam?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
// Luego haces el DriverManager.getConnection(url, user, pass);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(url, user, password);
            return conn;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void close() {
        if (conn != null) {
            try {
                conn.close();
            } catch (Exception e) {
                e.printStackTrace();
                System.out.println("Excepcion controlada.");
            }
        }
    }
}
