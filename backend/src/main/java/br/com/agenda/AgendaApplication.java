package br.com.agenda;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AgendaApplication {

    public static void main(String[] args) {
        // Todos os horarios do sistema sao interpretados no fuso de Brasilia
        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
        SpringApplication.run(AgendaApplication.class, args);
    }
}
