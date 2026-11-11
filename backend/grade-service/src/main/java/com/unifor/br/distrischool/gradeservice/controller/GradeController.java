package com.unifor.br.distrischool.gradeservice.controller;

import com.unifor.br.distrischool.gradeservice.dto.GradeRequestDTO;
import com.unifor.br.distrischool.gradeservice.model.Grade;
import com.unifor.br.distrischool.gradeservice.service.GradeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/grades", "/api/grades"})
@CrossOrigin(origins = "*")
public class GradeController {

    private final GradeService service;

    public GradeController(GradeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Grade> lancarNotas(@Valid @RequestBody GradeRequestDTO request) {
        Grade salvo = service.lancarNotas(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping
    public List<Grade> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/turma/{turmaId}")
    public List<Grade> listarPorTurma(@PathVariable String turmaId) {
        return service.listarPorTurma(turmaId);
    }

    @GetMapping("/aluno/{alunoId}")
    public List<Grade> listarPorAluno(@PathVariable Long alunoId) {
        return service.listarPorAluno(alunoId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Grade> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
