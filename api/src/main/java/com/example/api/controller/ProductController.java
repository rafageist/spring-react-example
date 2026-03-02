package com.example.api.controller;

import com.example.api.model.Product;
import com.example.api.model.User;
import com.example.api.repository.CategoryRepository;
import com.example.api.repository.LocationRepository;
import com.example.api.repository.ProductRepository;
import com.example.api.repository.UserRepository;
import com.example.api.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public ProductController(ProductRepository productRepository, 
                           CategoryRepository categoryRepository,
                           LocationRepository locationRepository,
                           UserRepository userRepository,
                           JwtService jwtService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) UUID ownerId,
                                        @RequestParam(required = false) UUID locationId,
                                        @RequestParam(required = false) UUID categoryId) {
        if (ownerId != null && locationId != null) {
            return productRepository.findByOwnerIdAndLocationId(ownerId, locationId);
        }
        if (ownerId != null) {
            return productRepository.findByOwnerId(ownerId);
        }
        if (locationId != null) {
            return productRepository.findByLocationId(locationId);
        }
        if (categoryId != null) {
            return productRepository.findByCategoryId(categoryId);
        }
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    @PostMapping
    public Product createProduct(@RequestBody Map<String, Object> productData,
                                @RequestHeader("Authorization") String authHeader) {
        Product product = new Product();
        product.setName((String) productData.get("name"));
        product.setDescription((String) productData.get("description"));
        product.setPrice(new java.math.BigDecimal(productData.get("price").toString()));
        product.setStock((Integer) productData.get("stock"));
        product.setImageUrl((String) productData.get("imageUrl"));
        
        if (productData.get("posX") != null) {
            product.setPosX(Double.valueOf(productData.get("posX").toString()));
        }
        if (productData.get("posY") != null) {
            product.setPosY(Double.valueOf(productData.get("posY").toString()));
        }
        
        // Set category if provided
        if (productData.get("categoryId") != null) {
            UUID categoryId = UUID.fromString(productData.get("categoryId").toString());
            categoryRepository.findById(categoryId).ifPresent(product::setCategory);
        }
        
        // Set location if provided
        if (productData.get("locationId") != null) {
            UUID locationId = UUID.fromString(productData.get("locationId").toString());
            locationRepository.findById(locationId).ifPresent(product::setLocation);
        }
        
        // Set owner from JWT token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            userRepository.findByUsername(username).ifPresent(product::setOwner);
        }
        
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable UUID id, @RequestBody Map<String, Object> productData) {
        return productRepository.findById(id)
                .map(existing -> {
                    if (productData.get("name") != null) {
                        existing.setName((String) productData.get("name"));
                    }
                    if (productData.get("description") != null) {
                        existing.setDescription((String) productData.get("description"));
                    }
                    if (productData.get("price") != null) {
                        existing.setPrice(new java.math.BigDecimal(productData.get("price").toString()));
                    }
                    if (productData.get("stock") != null) {
                        existing.setStock(Integer.valueOf(productData.get("stock").toString()));
                    }
                    if (productData.get("imageUrl") != null) {
                        existing.setImageUrl((String) productData.get("imageUrl"));
                    }
                    if (productData.get("posX") != null) {
                        existing.setPosX(Double.valueOf(productData.get("posX").toString()));
                    }
                    if (productData.get("posY") != null) {
                        existing.setPosY(Double.valueOf(productData.get("posY").toString()));
                    }
                    
                    // Update category if provided
                    if (productData.get("categoryId") != null) {
                        UUID categoryId = UUID.fromString(productData.get("categoryId").toString());
                        categoryRepository.findById(categoryId).ifPresent(existing::setCategory);
                    }
                    
                    // Update location if provided
                    if (productData.get("locationId") != null) {
                        UUID locationId = UUID.fromString(productData.get("locationId").toString());
                        locationRepository.findById(locationId).ifPresent(existing::setLocation);
                    }
                    
                    return ResponseEntity.ok(productRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<Product> updateProductPosition(@PathVariable UUID id, @RequestBody Map<String, Object> position) {
        return productRepository.findById(id)
                .map(existing -> {
                    if (position.get("posX") != null) {
                        existing.setPosX(Double.valueOf(position.get("posX").toString()));
                    }
                    if (position.get("posY") != null) {
                        existing.setPosY(Double.valueOf(position.get("posY").toString()));
                    }
                    // Handle locationId - can be null to remove location
                    if (position.containsKey("locationId")) {
                        Object locationIdObj = position.get("locationId");
                        if (locationIdObj == null) {
                            existing.setLocation(null);
                        } else {
                            UUID locationId = UUID.fromString(locationIdObj.toString());
                            locationRepository.findById(locationId).ifPresent(existing::setLocation);
                        }
                    }
                    return ResponseEntity.ok(productRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
