package com.logistics.inventory_service.controller;

import com.logistics.inventory_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*") // Mengizinkan React mengakses API Auth secara langsung
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        // --- TAMBAHKAN BARIS DEBUG INI ---
        System.out.println("=== REQUEST AUTH MASUK ===");
        System.out.println("Payload yang diterima: " + credentials);
        
        String username = credentials != null ? credentials.get("username") : null;
        String password = credentials != null ? credentials.get("password") : null;
        
        System.out.println("Username terdeteksi: [" + username + "]");
        
        System.out.println("==========================");

        String role = "";
        String fullName = "";

        // Verifikasi Akun Sesuai Spesifikasi SKPL
        if ("manajer123".equals(username) && "manajer123".equals(password)) {
            role = "MANAGER";
            fullName = "Dika Jefrianto (Manager)";
        } else if ("petugas1".equals(username) && "petugas1".equals(password)) {
            role = "PETUGAS";
            fullName = "Rian (Petugas Gudang)";
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Username atau Password salah!"));
        }

        // Generasikan token JWT yang disisipi peran (role) user
        String token = jwtUtil.generateToken(username, role);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", role);
        response.put("fullName", fullName);
        response.put("username", username);

        return ResponseEntity.ok(response);
    }
}