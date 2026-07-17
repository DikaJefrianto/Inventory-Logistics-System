package com.logistics.inventory_service.repository;

import com.logistics.inventory_service.model.AuditLog;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import java.util.List;

public interface AuditLogRepository extends ElasticsearchRepository<AuditLog, String> {
    // Query otomatis Elasticsearch untuk mencari kata kunci di field "action", "sku", atau "operator"
    List<AuditLog> findByActionContainingOrSkuContainingOrOperatorContaining(String action, String sku, String operator);
}