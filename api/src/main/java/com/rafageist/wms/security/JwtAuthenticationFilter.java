package com.rafageist.wms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter that intercepts HTTP requests and validates JWT tokens.
 * 
 * <p>This filter is a critical component of the security architecture. It runs once per request
 * (extending {@link OncePerRequestFilter}) and checks for a valid JWT in the Authorization header.
 * If valid, it sets up the security context to authenticate the user.
 * 
 * <p><b>Request Flow:</b>
 * <pre>
 * 1. Client sends request with "Authorization: Bearer <token>" header
 * 2. This filter extracts and validates the token
 * 3. If valid, creates an Authentication object and sets it in SecurityContext
 * 4. Request proceeds to the controller with the user authenticated
 * 5. If invalid/missing, request proceeds unauthenticated (may be rejected by security rules)
 * </pre>
 * 
 * <p><b>Design Pattern:</b> This implements the <b>Filter Pattern</b> (also known as
 * Intercepting Filter), which processes requests before they reach the application logic.
 * 
 * <p><b>Educational Note:</b> The {@code @Component} annotation registers this filter as a
 * Spring bean. In SecurityConfig, we add it to the filter chain before
 * UsernamePasswordAuthenticationFilter to ensure JWT auth is checked first.
 * 
 * @author WMS Development Team
 * @version 1.0
 * @see org.springframework.web.filter.OncePerRequestFilter
 * @see org.springframework.security.core.context.SecurityContextHolder
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Constructs the filter with required dependencies.
     * 
     * @param jwtService service for JWT token operations
     * @param userDetailsService service for loading user details from the database
     */
    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Core filter logic executed for each HTTP request.
     * 
     * <p>This method:
     * <ol>
     *   <li>Extracts the JWT token from the Authorization header</li>
     *   <li>Validates the token (signature, expiration)</li>
     *   <li>Loads the user details from the database</li>
     *   <li>Creates an Authentication token with user details and authorities</li>
     *   <li>Sets the Authentication in the SecurityContext</li>
     *   <li>Passes the request to the next filter in the chain</li>
     * </ol>
     * 
     * <p><b>Educational Note:</b> The SecurityContext is thread-local, meaning each request
     * thread has its own context. This allows concurrent requests to have different
     * authenticated users without interference.
     * 
     * @param request the HTTP request being processed
     * @param response the HTTP response
     * @param filterChain the chain of filters to continue processing
     * @throws ServletException if a servlet error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtService.validateToken(token)) {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT token from the Authorization header.
     * 
     * <p>Expected header format: {@code Authorization: Bearer <token>}
     * 
     * <p><b>Educational Note:</b> The "Bearer" scheme is a standard for token-based
     * authentication defined in RFC 6750. The word "Bearer" indicates that the
     * bearer (holder) of the token is authorized to access the resource.
     * 
     * @param request the HTTP request containing the Authorization header
     * @return the JWT token string without the "Bearer " prefix, or null if not present
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
