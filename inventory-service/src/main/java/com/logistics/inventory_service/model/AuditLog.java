package com.logistics.inventory_service.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.DateFormat; // Impor ini wajib ditambahkan

@Document(indexName = "audit-logs")
public class AuditLog {

    @Id
    private String id;

    @Field(type = FieldType.Text)
    private String action; // "BARANG_MASUK" atau "BARANG_KELUAR"

    @Field(type = FieldType.Keyword)
    private String sku;

    @Field(type = FieldType.Integer)
    private Integer quantityChanged;

    @Field(type = FieldType.Text)
    private String operator;

    // Menambahkan pola format jam-menit-detik, tanggal saja, maupun epoch milidetik agar Elasticsearch luwes membaca data
    @Field(type = FieldType.Date, format = {DateFormat.date_hour_minute_second, DateFormat.date, DateFormat.epoch_millis})
    private LocalDateTime timestamp = LocalDateTime.now();

    // --- GETTER & SETTER MANUAL (Solusi Aman Tanpa Lombok) ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getQuantityChanged() {
        return quantityChanged;
    }

    public void setQuantityChanged(Integer quantityChanged) {
        this.quantityChanged = quantityChanged;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}