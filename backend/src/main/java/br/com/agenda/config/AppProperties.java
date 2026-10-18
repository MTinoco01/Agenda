package br.com.agenda.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Agenda agenda, Cors cors) {

    public record Jwt(String secret, long expiracaoMinutos) {
    }

    public record Agenda(int intervaloMinutos) {
    }

    public record Cors(List<String> origens) {
    }
}
