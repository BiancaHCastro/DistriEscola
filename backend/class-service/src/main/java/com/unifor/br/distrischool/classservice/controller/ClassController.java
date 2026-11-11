package com.unifor.br.distrischool.classservice.controller;

import com.unifor.br.distrischool.classservice.dto.ClassDTO;
import com.unifor.br.distrischool.classservice.model.ClassEntity;
import com.unifor.br.distrischool.classservice.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/classes", "/api/classes"})
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassService service;

    public ClassController(ClassService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@Valid @RequestBody ClassEntity classEntity) {
        try {
            ClassEntity salvo = service.cadastrar(classEntity);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public List<ClassDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ClassDTO> buscarPorCodigo(@PathVariable String codigo) {
        return service.buscarPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassEntity> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ClassEntity classEntity) {

        return service.atualizar(id, classEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
