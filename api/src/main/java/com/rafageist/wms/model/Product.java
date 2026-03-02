package com.rafageist.wms.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * JPA Entity representing a product in the warehouse management system.
 * 
 * <p>This class demonstrates core JPA (Java Persistence API) concepts for Object-Relational
 * Mapping (ORM). JPA allows us to work with database records as Java objects, eliminating
 * the need for manual SQL queries in most cases.
 * 
 * <p><b>Key Annotations:</b>
 * <ul>
 *   <li>{@code @Entity} - Marks this class as a JPA entity (maps to a database table)</li>
 *   <li>{@code @Table} - Specifies the database table name ("products")</li>
 *   <li>{@code @Id} - Marks the primary key field</li>
 *   <li>{@code @GeneratedValue} - Configures automatic ID generation</li>
 *   <li>{@code @Column} - Customizes column mapping (name, constraints, precision)</li>
 *   <li>{@code @ManyToOne} - Defines relationships with other entities</li>
 * </ul>
 * 
 * <p><b>Design Patterns:</b>
 * <ul>
 *   <li><b>Entity Pattern:</b> Represents a domain object with unique identity</li>
 *   <li><b>JavaBean Pattern:</b> Provides getters/setters for all properties</li>
 * </ul>
 * 
 * <p><b>Database Relationships:</b>
 * <pre>
 * Product *--1 Category (many products can belong to one category)
 * Product *--1 Location (many products can be at one location)
 * Product *--1 User     (many products can be owned by one user)
 * </pre>
 * 
 * @author WMS Development Team
 * @version 1.0
 * @see jakarta.persistence.Entity
 */
@Entity
@Table(name = "products")
public class Product {

    /**
     * Unique identifier for the product.
     * 
     * <p><b>Educational Note:</b> UUIDs (Universally Unique Identifiers) are preferred over
     * auto-incrementing integers for distributed systems because they can be generated
     * without coordinating with the database, and they don't reveal information about
     * record count or creation order.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    /**
     * The product name. Required field.
     * 
     * <p><b>Educational Note:</b> {@code nullable = false} creates a NOT NULL constraint
     * in the database, ensuring data integrity at the database level.
     */
    @Column(nullable = false)
    private String name;

    /** Optional detailed description of the product. */
    private String description;

    /**
     * Product price with decimal precision.
     * 
     * <p><b>Educational Note:</b> BigDecimal is used for monetary values instead of float/double
     * to avoid floating-point precision errors. The precision (10) is total digits,
     * and scale (2) is decimal places, allowing values up to 99,999,999.99.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** Current stock quantity in the warehouse. Required field. */
    @Column(nullable = false)
    private Integer stock;

    /**
     * URL to the product image.
     * 
     * <p><b>Educational Note:</b> The {@code name} attribute in {@code @Column} specifies
     * the database column name when it differs from the Java field name. Java uses camelCase,
     * but databases typically use snake_case.
     */
    @Column(name = "image_url")
    private String imageUrl;

    /** X-coordinate position on the warehouse visualization canvas. */
    @Column(name = "pos_x")
    private Double posX;

    /** Y-coordinate position on the warehouse visualization canvas. */
    @Column(name = "pos_y")
    private Double posY;

    /**
     * The category this product belongs to.
     * 
     * <p><b>Educational Note:</b> {@code @ManyToOne} defines a many-to-one relationship.
     * {@code FetchType.EAGER} means the category is loaded immediately with the product.
     * (Consider {@code LAZY} fetching for better performance in large datasets.)
     * {@code @JoinColumn} specifies the foreign key column name in the products table.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    /**
     * The warehouse location where this product is stored.
     * 
     * <p><b>Educational Note:</b> This relationship enables tracking product placement
     * in the warehouse for inventory management and visualization.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id")
    private Location location;

    /**
     * The user who owns this product.
     * 
     * <p><b>Educational Note:</b> This enables multi-tenant functionality where different
     * users can manage their own products within the same warehouse system.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;

    /**
     * Default no-argument constructor required by JPA.
     * 
     * <p><b>Educational Note:</b> JPA requires a no-arg constructor (can be protected)
     * to instantiate entities when loading from the database. JPA uses reflection
     * to create instances and populate fields.
     */
    public Product() {
    }

    /**
     * Convenience constructor for creating a product with essential fields.
     * 
     * @param name the product name (required)
     * @param description optional product description
     * @param price the product price (required)
     * @param stock the initial stock quantity (required)
     */
    public Product(String name, String description, BigDecimal price, Integer stock) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
    }

    /**
     * Gets the unique identifier of this product.
     * @return the product UUID, or null if not yet persisted
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the unique identifier. Typically only used by JPA or for testing.
     * @param id the UUID to assign
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Gets the product name.
     * @return the product name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the product name.
     * @param name the name to set (cannot be null due to database constraint)
     */
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getPosX() {
        return posX;
    }

    public void setPosX(Double posX) {
        this.posX = posX;
    }

    public Double getPosY() {
        return posY;
    }

    public void setPosY(Double posY) {
        this.posY = posY;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }
}
