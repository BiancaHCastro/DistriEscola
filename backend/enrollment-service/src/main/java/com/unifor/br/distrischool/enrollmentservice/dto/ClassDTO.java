package com.unifor.br.distrischool.enrollmentservice.dto;

public class ClassDTO {

    private Long id;
    private String codigo;
    private String nomeDisciplina;
    private Integer capacidadeMaxima;
    private boolean fallback = false;

    public ClassDTO() {
    }

    public ClassDTO(Long id, String codigo, String nomeDisciplina, Integer capacidadeMaxima, boolean fallback) {
        this.id = id;
        this.codigo = codigo;
        this.nomeDisciplina = nomeDisciplina;
        this.capacidadeMaxima = capacidadeMaxima;
        this.fallback = fallback;
    }

    public static ClassDTO fallback(Long classId) {
        return new ClassDTO(
                classId,
                "TURMA-FALLBACK",
                "Turma ID " + classId + " (class-service em Modo Resiliência)",
                50,
                true
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNomeDisciplina() {
        return nomeDisciplina;
    }

    public void setNomeDisciplina(String nomeDisciplina) {
        this.nomeDisciplina = nomeDisciplina;
    }

    public Integer getCapacidadeMaxima() {
        return capacidadeMaxima;
    }

    public void setCapacidadeMaxima(Integer capacidadeMaxima) {
        this.capacidadeMaxima = capacidadeMaxima;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
