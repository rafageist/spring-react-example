package com.rafageist.wms.controller;

import com.rafageist.wms.model.Product;
import com.rafageist.wms.model.User;
import com.rafageist.wms.repository.CategoryRepository;
import com.rafageist.wms.repository.LocationRepository;
import com.rafageist.wms.repository.ProductRepository;
import com.rafageist.wms.repository.UserRepository;
import com.rafageist.wms.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for managing products in the warehouse management system.
 * 
 * <p>This controller provides CRUD (Create, Read, Update, Delete) operations for products,
 * following RESTful API design principles. It handles HTTP requests and returns JSON responses.
 * 
 * <p><b>Key Annotations:</b>
 * <ul>
 *   <li>{@code @RestController} - Combines {@code @Controller} and {@code @ResponseBody}, meaning
 *       all methods return data directly (as JSON) rather than view names</li>
 *   <li>{@code @RequestMapping("/api/products")} - Base URL path for all endpoints in this controller</li>
 * </ul>
 * 
 * <p><b>Design Patterns:</b>
 * <ul>
 *   <li><b>Repository Pattern:</b> Uses repositories to abstract data access</li>
 *   <li><b>Dependency Injection:</b> Dependencies are injected via constructor</li>
 *   <li><b>DTO Pattern:</b> Uses Map for flexible request body handling (simpler than formal DTOs)</li>
 * </ul>
 * 
 * <p><b>Endpoints:</b>
 * <pre>
 * GET    /api/products         - List all products (with optional filters)
 * GET    /api/products/{id}    - Get a specific product
 * GET    /api/products/search  - Search products by name
 * POST   /api/products         - Create a new product
 * PUT    /api/products/{id}    - Update a product
 * PATCH  /api/products/{id}/position - Update only the product position
 * DELETE /api/products/{id}    - Delete a product
 * </pre>
 * 
 * @author WMS Development Team
 * @version 1.0
 * @see com.rafageist.wms.model.Product
 * @see com.rafageist.wms.repository.ProductRepository
 */
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

    /**
     * Retrieves all products with optional filtering.
     * 
     * <p>This endpoint supports filtering by multiple criteria. When filters are provided,
     * they reduce the result set. If no filters are provided, all products are returned.
     * 
     * <p><b>Educational Note:</b> The {@code @GetMapping} annotation maps HTTP GET requests
     * to this method. Spring automatically converts the returned List to JSON.
     * 
     * @param ownerId optional filter to get products owned by a specific user
     * @param locationId optional filter to get products at a specific location
     * @param categoryId optional filter to get products in a specific category
     * @return list of products matching the filter criteria, or all products if no filters
     */
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

    /**
     * Retrieves a single product by its unique identifier.
     * 
     * <p><b>Educational Note:</b> The {@code @PathVariable} annotation extracts the {id}
     * from the URL path. ResponseEntity allows us to return both the product AND an
     * appropriate HTTP status code (200 OK or 404 Not Found).
     * 
     * @param id the UUID of the product to retrieve
     * @return ResponseEntity containing the product if found (200 OK),
     *         or empty response with 404 Not Found status if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Searches for products by name using case-insensitive partial matching.
     * 
     * <p>Example: Searching for "lap" would match "Laptop", "LAPTOP", "laptop stand", etc.
     * 
     * @param name the search term to find in product names
     * @return list of products whose names contain the search term
     */
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Creates a new product in the warehouse.
     * 
     * <p>This endpoint extracts the authenticated user from the JWT token and sets them
     * as the product owner. Category and location can optionally be assigned.
     * 
     * <p><b>Educational Note:</b> The {@code @RequestBody} annotation tells Spring to
     * deserialize the request JSON body into the parameter. Using {@code Map<String, Object>}
     * provides flexibility but sacrifices type safety - in production, consider using a DTO class.
     * 
     * @param productData map containing product properties (name, description, price, stock, etc.)
     * @param authHeader the Authorization header containing the JWT token (format: "Bearer <token>")
     * @return the newly created product with generated UUID
     */
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

    /**
     * Updates an existing product with new data.
     * 
     * <p>This performs a partial update - only fields present in the request body are updated.
     * Fields not included in the request remain unchanged.
     * 
     * <p><b>Educational Note:</b> The distinction between PUT and PATCH is semantic:
     * <ul>
     *   <li>PUT traditionally replaces the entire resource</li>
     *   <li>PATCH updates only specified fields</li>
     * </ul>
     * This implementation behaves like PATCH (partial update) despite using PUT.
     * 
     * @param id the UUID of the product to update
     * @param productData map containing fields to update
     * @return ResponseEntity with updated product (200 OK) or 404 Not Found
     */
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

    /**
     * Updates only the position coordinates of a product on the warehouse canvas.
     * 
     * <p>This is a specialized endpoint for the drag-and-drop functionality in the
     * warehouse visualization. It allows efficient updates of just the positioning data
     * without sending the full product object.
     * 
     * <p><b>Educational Note:</b> {@code @PatchMapping} is appropriate here because we're
     * updating a subset of the resource's fields. PATCH requests are idempotent by convention.
     * 
     * @param id the UUID of the product to reposition
     * @param position map containing posX, posY coordinates and optional locationId
     * @return ResponseEntity with updated product (200 OK) or 404 Not Found
     */
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

    /**
     * Deletes a product from the warehouse.
     * 
     * <p>This performs a hard delete - the product is permanently removed from the database.
     * In production systems, consider soft deletes (setting a deleted flag) for audit purposes.
     * 
     * <p><b>Educational Note:</b> Returning {@code ResponseEntity<Void>} indicates that a
     * successful response has no body. The 200 OK status confirms the deletion occurred.
     * 404 is returned if the product doesn't exist.
     * 
     * @param id the UUID of the product to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found if product doesn't exist
     */
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
