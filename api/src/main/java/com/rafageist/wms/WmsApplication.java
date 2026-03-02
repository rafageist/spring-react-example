package com.rafageist.wms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Warehouse Management System (WMS) application.
 * 
 * <p>This class serves as the bootstrap configuration for the Spring Boot application.
 * The {@link SpringBootApplication} annotation is a convenience annotation that combines:
 * <ul>
 *   <li>{@code @Configuration} - Marks this class as a source of bean definitions</li>
 *   <li>{@code @EnableAutoConfiguration} - Enables Spring Boot's auto-configuration mechanism</li>
 *   <li>{@code @ComponentScan} - Enables component scanning in this package and sub-packages</li>
 * </ul>
 * 
 * <p><b>Educational Note:</b> Spring Boot uses "convention over configuration" - it automatically
 * configures your application based on the dependencies present on the classpath. For example,
 * if spring-boot-starter-web is on the classpath, it auto-configures an embedded Tomcat server.
 * 
 * @author WMS Development Team
 * @version 1.0
 * @see org.springframework.boot.autoconfigure.SpringBootApplication
 */
@SpringBootApplication
public class WmsApplication {

    /**
     * Application entry point that bootstraps the Spring Boot application.
     * 
     * <p>This method delegates to Spring Boot's {@link SpringApplication#run(Class, String...)}
     * method to:
     * <ol>
     *   <li>Create an ApplicationContext (the Spring IoC container)</li>
     *   <li>Register beans and configuration classes</li>
     *   <li>Start the embedded web server (Tomcat by default)</li>
     *   <li>Execute any CommandLineRunner or ApplicationRunner beans</li>
     * </ol>
     * 
     * @param args command-line arguments passed to the application (can be used to override
     *             properties, e.g., {@code --server.port=8081})
     */
    public static void main(String[] args) {
        SpringApplication.run(WmsApplication.class, args);
    }
}
