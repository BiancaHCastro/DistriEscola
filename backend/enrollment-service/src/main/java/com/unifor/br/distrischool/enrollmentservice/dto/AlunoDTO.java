package com.unifor.br.distrischool.enrollmentservice.dto;

public class AlunoDTO {

    private Long id;
    private String matricula;
    private String nome;
    private boolean fallback = false;

    public AlunoDTO() {
    }

    public AlunoDTO(Long id, String matricula, String nome, boolean fallback) {
        this.id = id;
        this.matricula = matricula;
        this.nome = nome;
        this.fallback = fallback;
    }

    public static AlunoDTO fallback(Long alunoId) {
        return new AlunoDTO(
                alunoId,
                "MAT-FALLBACK",
                "Aluno ID " + alunoId + " (aluno-service em Modo Resiliência)",
                true
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
