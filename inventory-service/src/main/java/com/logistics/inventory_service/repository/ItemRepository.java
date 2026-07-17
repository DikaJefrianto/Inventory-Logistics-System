package com.logistics.inventory_service.repository;

import com.logistics.inventory_service.model.Item;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ItemRepository extends MongoRepository<Item, String> {
    Optional<Item> findBySku(String sku);
}