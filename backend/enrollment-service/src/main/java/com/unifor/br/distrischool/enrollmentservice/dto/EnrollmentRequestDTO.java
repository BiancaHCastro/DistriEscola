package com.unifor.br.distrischool.enrollmentservice.dto;

import jakarta.validation.constraints.NotNull;

public class EnrollmentRequestDTO {

    @NotNull(message = "O ID do aluno é obrigatório")
    private Long alunoId;

    @NotNull(message = "O ID da turma é obrigatório")
    private Long classId;

    public EnrollmentRequestDTO() {
    }

    public EnrollmentRequestDTO(Long alunoId, Long classId) {
        this.alunoId = alunoId;
        this.classId = classId;
    }

    public Long getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(Long alunoId) {
        this.alunoId = alunoId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }
}
