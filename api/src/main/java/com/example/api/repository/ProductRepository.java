package com.example.api.repository;

import com.example.api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    List<Product> findByOwnerId(UUID ownerId);
    
    List<Product> findByLocationId(UUID locationId);
    
    List<Product> findByCategoryId(UUID categoryId);
    
    List<Product> findByOwnerIdAndLocationId(UUID ownerId, UUID locationId);
}
