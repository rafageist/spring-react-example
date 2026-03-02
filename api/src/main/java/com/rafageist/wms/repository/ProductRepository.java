package com.rafageist.wms.repository;

import com.rafageist.wms.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for Product entities.
 * 
 * <p>This interface provides data access operations for products without requiring
 * any implementation code. Spring Data JPA automatically generates the implementation
 * at runtime based on the interface definition.
 * 
 * <p><b>How it works:</b>
 * By extending {@link JpaRepository}, this interface automatically gains:
 * <ul>
 *   <li>CRUD operations: save(), findById(), findAll(), delete(), count(), etc.</li>
 *   <li>Pagination and sorting support</li>
 *   <li>Batch operations</li>
 * </ul>
 * 
 * <p><b>Query Derivation:</b>
 * Spring Data JPA creates queries from method names. For example:
 * <ul>
 *   <li>{@code findByName(String name)} generates: SELECT * FROM products WHERE name = ?</li>
 *   <li>{@code findByNameContainingIgnoreCase(String name)} generates: SELECT * FROM products WHERE LOWER(name) LIKE LOWER('%' || ? || '%')</li>
 * </ul>
 * 
 * <p><b>Design Pattern:</b> This implements the <b>Repository Pattern</b>, which abstracts
 * data access logic and provides a collection-like interface for domain objects.
 * 
 * <p><b>Educational Note:</b> The {@code @Repository} annotation marks this as a Spring
 * Data repository. While optional (Spring Data auto-detects JpaRepository interfaces),
 * it enables exception translation from SQL exceptions to Spring's DataAccessException.
 * 
 * @author WMS Development Team
 * @version 1.0
 * @see org.springframework.data.jpa.repository.JpaRepository
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    /**
     * Searches for products whose name contains the given string (case-insensitive).
     * 
     * <p><b>Query Derivation:</b> Spring Data parses the method name:
     * <ul>
     *   <li>{@code findBy} - indicates a SELECT query</li>
     *   <li>{@code Name} - the field to query on</li>
     *   <li>{@code Containing} - LIKE '%value%' (partial match)</li>
     *   <li>{@code IgnoreCase} - case-insensitive comparison</li>
     * </ul>
     * 
     * @param name the search term to find within product names
     * @return list of matching products (empty list if none found)
     */
    List<Product> findByNameContainingIgnoreCase(String name);
    
    /**
     * Finds all products owned by a specific user.
     * 
     * <p><b>Educational Note:</b> This queries the {@code owner_id} foreign key column.
     * Spring Data automatically understands that {@code OwnerId} refers to the {@code id}
     * field of the related {@code owner} entity.
     * 
     * @param ownerId the UUID of the product owner
     * @return list of products owned by the specified user
     */
    List<Product> findByOwnerId(UUID ownerId);
    
    /**
     * Finds all products at a specific warehouse location.
     * 
     * @param locationId the UUID of the warehouse location
     * @return list of products at the specified location
     */
    List<Product> findByLocationId(UUID locationId);
    
    /**
     * Finds all products in a specific category.
     * 
     * @param categoryId the UUID of the category
     * @return list of products in the specified category
     */
    List<Product> findByCategoryId(UUID categoryId);
    
    /**
     * Finds products matching both owner AND location criteria.
     * 
     * <p><b>Educational Note:</b> Spring Data uses {@code And} keyword to combine
     * multiple conditions with AND logic. You can also use {@code Or} for OR logic.
     * 
     * @param ownerId the UUID of the product owner
     * @param locationId the UUID of the warehouse location
     * @return list of products matching both criteria
     */
    List<Product> findByOwnerIdAndLocationId(UUID ownerId, UUID locationId);
}
