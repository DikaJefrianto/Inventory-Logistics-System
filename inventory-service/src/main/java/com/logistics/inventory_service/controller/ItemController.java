package com.logistics.inventory_service.controller;

import com.logistics.inventory_service.model.Item;
import com.logistics.inventory_service.model.AuditLog;
import com.logistics.inventory_service.service.ItemService;
import com.logistics.inventory_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*") // Mengizinkan integrasi langsung dengan aplikasi React Frontend
@RestController
@RequestMapping("/api/v1/inventory")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Endpoint untuk mengambil seluruh daftar barang yang tersedia di gudang.
     * Dipanggil oleh Frontend React untuk visualisasi tabel stok secara real-time.
     */
    @GetMapping("/items")
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    /**
     * Endpoint untuk mencatat barang masuk baru ke dalam database MongoDB.
     * Dapat diakses oleh Manager maupun Petugas Gudang.
     */
    @PostMapping("/items")
    public ResponseEntity<Item> addItem(@RequestBody Item item) {
        return ResponseEntity.ok(itemService.createItem(item));
    }

    /**
     * Endpoint untuk mengambil detail barang berdasarkan SKU.
     * Menggunakan Redis Caching untuk mempercepat proses pembacaan data.
     */
    @GetMapping("/items/{sku}")
    public ResponseEntity<Item> getItem(@PathVariable String sku) {
        return ResponseEntity.ok(itemService.getItemBySku(sku));
    }

    /**
     * Endpoint untuk mencatat pengeluaran stok barang (Barang Keluar).
     * Akan memperbarui MongoDB dan melakukan evict cache di Redis berdasarkan SKU terkait.
     */
    @PutMapping("/items/output")
    public ResponseEntity<Item> recordItemOutput(@RequestParam String sku, @RequestParam Integer qty) {
        return ResponseEntity.ok(itemService.processItemOutput(sku, qty));
    }

    /**
     * Endpoint untuk melakukan pencarian Audit Log transaksi dari Elasticsearch.
     * Endpoint ini diproteksi ketat menggunakan JWT. Hanya pengguna dengan Role "MANAGER"
     * yang diizinkan untuk mengakses riwayat log ini.
     */
    @GetMapping("/logs/search")
    public ResponseEntity<?> searchLogs(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // 1. Validasi keberadaan Header Authorization
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Akses Ditolak: Token JWT tidak ditemukan."));
        }

        String token = authHeader.substring(7); // Memotong string "Bearer " untuk mengambil token murni

        // 2. Validasi Token JWT (Tanda tangan dan masa berlaku)
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("message", "Akses Ditolak: Token tidak valid atau kedaluwarsa."));
        }

        // 3. Validasi Hak Akses / Role-Based Access Control (RBAC)
        String role = jwtUtil.extractRole(token);
        if (!"MANAGER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("message", "Akses Ditolak: Hanya Manajer yang diizinkan melihat Audit Log."));
        }
        
        // 4. Jika lolos verifikasi, ambil data dari Elasticsearch
        List<AuditLog> searchResults = itemService.searchTransactionLogs(keyword);
        return ResponseEntity.ok(searchResults);
    }
}