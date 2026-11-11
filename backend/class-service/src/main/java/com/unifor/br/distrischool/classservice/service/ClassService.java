package com.unifor.br.distrischool.classservice.service;

import com.unifor.br.distrischool.classservice.client.TeacherClient;
import com.unifor.br.distrischool.classservice.dto.ClassDTO;
import com.unifor.br.distrischool.classservice.dto.TeacherDTO;
import com.unifor.br.distrischool.classservice.model.ClassEntity;
import com.unifor.br.distrischool.classservice.repository.ClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClassService {

    private final ClassRepository repository;
    private final TeacherClient teacherClient;

    public ClassService(ClassRepository repository, TeacherClient teacherClient) {
        this.repository = repository;
        this.teacherClient = teacherClient;
    }

    @Transactional
    public ClassEntity cadastrar(ClassEntity classEntity) {
        if (classEntity.getCodigo() != null && repository.existsByCodigo(classEntity.getCodigo())) {
            throw new IllegalArgumentException("Já existe uma turma cadastrada com o código: " + classEntity.getCodigo());
        }
        return repository.save(classEntity);
    }

    @Transactional(readOnly = true)
    public List<ClassDTO> listar() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ClassDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<ClassDTO> buscarPorCodigo(String codigo) {
        return repository.findByCodigo(codigo).map(this::toDTO);
    }

    @Transactional
    public void excluir(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public Optional<ClassEntity> atualizar(Long id, ClassEntity novosDados) {
        return repository.findById(id).map(turma -> {
            turma.setCodigo(novosDados.getCodigo());
            turma.setNomeDisciplina(novosDados.getNomeDisciplina());
            turma.setSemestre(novosDados.getSemestre());
            turma.setHorario(novosDados.getHorario());
            turma.setSala(novosDados.getSala());
            turma.setCapacidadeMaxima(novosDados.getCapacidadeMaxima());
            turma.setTeacherId(novosDados.getTeacherId());
            return repository.save(turma);
        });
    }

    private ClassDTO toDTO(ClassEntity entity) {
        TeacherDTO teacher = null;
        if (entity.getTeacherId() != null) {
            teacher = teacherClient.findTeacherById(entity.getTeacherId());
        }
        return new ClassDTO(entity, teacher);
    }
}
