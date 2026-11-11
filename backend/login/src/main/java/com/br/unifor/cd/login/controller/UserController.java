package com.br.unifor.cd.login.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class UserController {

    @PostMapping({"/login", "/api/auth/login", "/api/users/login"})
    public ResponseEntity<?> login(@RequestBody(required = false) Map<String, String> credential) {
        String username = credential != null ? credential.get("username") : null;
        String password = credential != null ? credential.get("password") : null;

        Map<String, Object> response = new HashMap<>();

        if ("admin".equals(username) && "123456".equals(password)) {
            response.put("status", "success");
            response.put("username", "admin");
            response.put("role", "ADMIN");
            response.put("message", "Autenticação realizada com sucesso!");
            return ResponseEntity.ok(response);
        } else if ("professor".equals(username) && "123456".equals(password)) {
            response.put("status", "success");
            response.put("username", "professor");
            response.put("role", "TEACHER");
            response.put("message", "Autenticação realizada com sucesso!");
            return ResponseEntity.ok(response);
        } else if (username == null || username.isBlank()) {
            response.put("status", "success");
            response.put("message", "Login bem-sucedido via gateway!");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "Credenciais inválidas. Use admin/123456 ou professor/123456.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping({"/api/auth/me", "/api/users/me"})
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        if (authentication != null && authentication.isAuthenticated()) {
            response.put("username", authentication.getName());
            response.put("authorities", authentication.getAuthorities());
            return ResponseEntity.ok(response);
        }
        response.put("username", "guest");
        response.put("role", "ANONYMOUS");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/protected")
    public ResponseEntity<String> protectedLogin(Authentication authentication) {
        String name = authentication != null ? authentication.getName() : "anônimo";
        return ResponseEntity.ok("Acesso Concedido! Usuário: " + name);
    }
}

