package com.logistics.inventory_service.service;

import com.logistics.inventory_service.model.AuditLog;
import com.logistics.inventory_service.model.Item;
import com.logistics.inventory_service.repository.AuditLogRepository;
import com.logistics.inventory_service.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private AuditLogRepository auditLogRepository; // Inject repo Elasticsearch

    // Simpan barang masuk ke MongoDB + Tulis Log ke Elasticsearch
    public Item createItem(Item item) {
        Item savedItem = itemRepository.save(item);

        // Kirim log ke Elasticsearch
        AuditLog log = new AuditLog();
        log.setAction("BARANG_MASUK");
        log.setSku(item.getSku());
        log.setQuantityChanged(item.getQuantity());
        log.setOperator("Sistem Otomatis");
        auditLogRepository.save(log);

        return savedItem;
    }

    @Cacheable(value = "items", key = "#sku")
    public Item getItemBySku(String sku) {
        System.out.println("====== [CACHE MISS] Mengambil data dari MongoDB untuk SKU: " + sku + " ======");
        return itemRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Barang dengan SKU " + sku + " tidak ditemukan"));
    }

    // Kurangi stok + Hapus Cache Redis + Tulis Log ke Elasticsearch
    @CacheEvict(value = "items", key = "#sku")
    public Item processItemOutput(String sku, Integer qty) {
        Item item = itemRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Barang tidak ditemukan"));
        
        if (item.getQuantity() < qty) {
            throw new RuntimeException("Gagal! Stok di gudang tidak mencukupi");
        }
        
        item.setQuantity(item.getQuantity() - qty);
        Item updatedItem = itemRepository.save(item);

        // Kirim log ke Elasticsearch
        AuditLog log = new AuditLog();
        log.setAction("BARANG_KELUAR");
        log.setSku(sku);
        log.setQuantityChanged(qty);
        log.setOperator("Petugas Gudang");
        auditLogRepository.save(log);

        return updatedItem;
    }

    // Fitur FR-08: Pencarian Log Riwayat Transaksi via Elasticsearch
    public List<AuditLog> searchTransactionLogs(String keyword) {
        return auditLogRepository.findByActionContainingOrSkuContainingOrOperatorContaining(keyword, keyword, keyword);
    }
    public List<Item> getAllItems() {
        return itemRepository.findAll(); // Mengambil seluruh dokumen barang dari MongoDB
    }
}