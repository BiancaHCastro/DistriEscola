package com.unifor.br.distrischool.gradeservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GradeRequestDTO {

    @NotNull(message = "O ID do aluno é obrigatório")
    private Long alunoId;

    @NotBlank(message = "O ID/código da turma é obrigatório")
    private String turmaId;

    @Min(value = 0, message = "Nota mínima é 0.0")
    @Max(value = 10, message = "Nota máxima é 10.0")
    private Double nota1;

    @Min(value = 0, message = "Nota mínima é 0.0")
    @Max(value = 10, message = "Nota máxima é 10.0")
    private Double nota2;

    @Min(value = 0, message = "Nota mínima é 0.0")
    @Max(value = 10, message = "Nota máxima é 10.0")
    private Double notaFinal;

    public GradeRequestDTO() {
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(Long alunoId) {
        this.alunoId = alunoId;
    }

    public String getTurmaId() {
        return turmaId;
    }

    public void setTurmaId(String turmaId) {
        this.turmaId = turmaId;
    }

    public Double getNota1() {
        return nota1;
    }

    public void setNota1(Double nota1) {
        this.nota1 = nota1;
    }

    public Double getNota2() {
        return nota2;
    }

    public void setNota2(Double nota2) {
        this.nota2 = nota2;
    }

    public Double getNotaFinal() {
        return notaFinal;
    }

    public void setNotaFinal(Double notaFinal) {
        this.notaFinal = notaFinal;
    }
}
