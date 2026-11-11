package com.unifor.br.distrischool.teacherservice.service;

import com.unifor.br.distrischool.teacherservice.model.Teacher;
import com.unifor.br.distrischool.teacherservice.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {

    private final TeacherRepository repository;

    public TeacherService(TeacherRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Teacher cadastrar(Teacher teacher) {
        if (teacher.getMatricula() != null && repository.existsByMatricula(teacher.getMatricula())) {
            throw new IllegalArgumentException("Já existe um professor com a matrícula: " + teacher.getMatricula());
        }
        if (teacher.getEmail() != null && repository.existsByEmail(teacher.getEmail())) {
            throw new IllegalArgumentException("Já existe um professor cadastrado com o e-mail: " + teacher.getEmail());
        }
        return repository.save(teacher);
    }

    @Transactional(readOnly = true)
    public List<Teacher> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> buscarPorMatricula(String matricula) {
        return repository.findByMatricula(matricula);
    }

    @Transactional
    public void excluir(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public Optional<Teacher> atualizar(Long id, Teacher novosDados) {
        return repository.findById(id).map(teacher -> {
            teacher.setMatricula(novosDados.getMatricula());
            teacher.setNome(novosDados.getNome());
            teacher.setEmail(novosDados.getEmail());
            teacher.setEspecialidade(novosDados.getEspecialidade());
            teacher.setDepartamento(novosDados.getDepartamento());
            teacher.setTelefone(novosDados.getTelefone());
            return repository.save(teacher);
        });
    }
}
