package com.unifor.br.distrischool.enrollmentservice.controller;

import com.unifor.br.distrischool.enrollmentservice.dto.EnrollmentRequestDTO;
import com.unifor.br.distrischool.enrollmentservice.dto.EnrollmentResponseDTO;
import com.unifor.br.distrischool.enrollmentservice.model.Enrollment;
import com.unifor.br.distrischool.enrollmentservice.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/enrollments", "/api/enrollments"})
@CrossOrigin(origins = "*")
public class EnrollmentController {

    private final EnrollmentService service;

    public EnrollmentController(EnrollmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> matricular(@Valid @RequestBody EnrollmentRequestDTO request) {
        try {
            Enrollment matricula = service.matricular(request.getAlunoId(), request.getClassId());
            return ResponseEntity.status(HttpStatus.CREATED).body(matricula);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public List<EnrollmentResponseDTO> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentResponseDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/aluno/{alunoId}")
    public List<EnrollmentResponseDTO> listarPorAluno(@PathVariable Long alunoId) {
        return service.listarPorAluno(alunoId);
    }

    @GetMapping("/class/{classId}")
    public List<EnrollmentResponseDTO> listarPorTurma(@PathVariable Long classId) {
        return service.listarPorTurma(classId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarMatricula(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.cancelarMatricula(id);
        return ResponseEntity.noContent().build();
    }
}
