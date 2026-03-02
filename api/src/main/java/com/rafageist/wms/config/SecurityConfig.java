package com.rafageist.wms.config;

import com.rafageist.wms.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration for the WMS application.
 * 
 * <p>This class configures security settings using the modern Spring Security 6.x approach
 * with component-based security configuration (as opposed to the deprecated WebSecurityConfigurerAdapter).
 * 
 * <p><b>Key Security Features Configured:</b>
 * <ul>
 *   <li><b>JWT Authentication:</b> Stateless token-based authentication using JSON Web Tokens</li>
 *   <li><b>CORS:</b> Cross-Origin Resource Sharing for frontend-backend communication</li>
 *   <li><b>CSRF Disabled:</b> Not needed for stateless JWT-based APIs</li>
 *   <li><b>Password Encoding:</b> BCrypt hashing for secure password storage</li>
 * </ul>
 * 
 * <p><b>Design Pattern:</b> This class uses the <b>Builder Pattern</b> extensively through
 * Spring Security's fluent API for configuring the security filter chain.
 * 
 * <p><b>Educational Note:</b> The {@code @EnableWebSecurity} annotation enables Spring Security's
 * web security support and provides the Spring MVC integration. Combined with {@code @Configuration},
 * it allows defining security beans that customize the security behavior.
 * 
 * @author WMS Development Team
 * @version 1.0
 * @see org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Constructs the SecurityConfig with required dependencies.
     * 
     * <p><b>Educational Note:</b> This uses Constructor Injection, which is the recommended
     * way to inject dependencies in Spring. It makes dependencies explicit and enables
     * immutability (final fields).
     * 
     * @param jwtAuthenticationFilter the JWT filter that processes authentication tokens
     */
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Configures the security filter chain for HTTP requests.
     * 
     * <p>This method defines how HTTP requests should be secured:
     * <ul>
     *   <li>CORS is enabled with custom configuration for frontend access</li>
     *   <li>CSRF protection is disabled (appropriate for stateless REST APIs)</li>
     *   <li>Sessions are stateless (each request must include authentication)</li>
     *   <li>Authentication endpoints are publicly accessible</li>
     *   <li>All other endpoints require authentication</li>
     *   <li>JWT filter processes tokens before username/password authentication</li>
     * </ul>
     * 
     * <p><b>Educational Note:</b> The {@code @Bean} annotation tells Spring to manage this
     * object in the application context. Spring Security will automatically use this
     * SecurityFilterChain to secure the application.
     * 
     * @param http the HttpSecurity builder to customize
     * @return the configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) settings.
     * 
     * <p>CORS is essential when the frontend and backend are served from different origins
     * (e.g., React on localhost:5173 and Spring Boot on localhost:8080).
     * 
     * <p><b>Configuration Details:</b>
     * <ul>
     *   <li><b>Allowed Origins:</b> React dev server ports (5173, 3000)</li>
     *   <li><b>Allowed Methods:</b> Standard REST methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)</li>
     *   <li><b>Allowed Headers:</b> Authorization (for JWT), Content-Type, X-Requested-With</li>
     *   <li><b>Credentials:</b> Allowed (for cookie-based or Authorization header auth)</li>
     *   <li><b>Max Age:</b> 1 hour cache for preflight responses</li>
     * </ul>
     * 
     * <p><b>Educational Note:</b> OPTIONS requests (preflight) are automatically sent by browsers
     * before actual cross-origin requests to check if the server allows them.
     * 
     * @return the CORS configuration source applied to all endpoints
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Creates a BCrypt password encoder for secure password hashing.
     * 
     * <p><b>Why BCrypt?</b>
     * <ul>
     *   <li>Includes a salt automatically to prevent rainbow table attacks</li>
     *   <li>Adaptive function - can increase work factor as hardware improves</li>
     *   <li>Industry standard for password storage</li>
     * </ul>
     * 
     * <p><b>Educational Note:</b> Never store passwords in plain text. BCrypt hashes
     * are one-way - you can verify a password matches but cannot reverse the hash.
     * 
     * @return the BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Exposes the AuthenticationManager as a Spring bean.
     * 
     * <p>The AuthenticationManager is the main strategy interface for authentication,
     * used primarily by the AuthController to authenticate login requests.
     * 
     * <p><b>Educational Note:</b> In Spring Security 6.x, the AuthenticationManager is
     * obtained from AuthenticationConfiguration and must be explicitly exposed as a bean
     * if needed by other components (like login endpoints).
     * 
     * @param config the authentication configuration provided by Spring Security
     * @return the configured authentication manager
     * @throws Exception if the authentication manager cannot be obtained
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
