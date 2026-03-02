package com.rafageist.wms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Service for JSON Web Token (JWT) generation and validation.
 * 
 * <p>JWT is a compact, URL-safe means of representing claims between two parties.
 * This service handles the creation of tokens during login and validation of tokens
 * on subsequent requests.
 * 
 * <p><b>JWT Structure:</b>
 * A JWT consists of three parts separated by dots:
 * <pre>
 * Header.Payload.Signature
 * </pre>
 * <ul>
 *   <li><b>Header:</b> Contains token type (JWT) and signing algorithm (HS256)</li>
 *   <li><b>Payload:</b> Contains claims (subject/username, issued at, expiration)</li>
 *   <li><b>Signature:</b> Verifies the token hasn't been tampered with</li>
 * </ul>
 * 
 * <p><b>Security Considerations:</b>
 * <ul>
 *   <li>The secret key must be at least 256 bits for HMAC-SHA256</li>
 *   <li>Tokens should have a reasonable expiration time</li>
 *   <li>Never log or expose tokens in URLs</li>
 * </ul>
 * 
 * <p><b>Educational Note:</b> The {@code @Service} annotation marks this as a Spring service
 * bean. Spring will automatically create an instance and inject it where needed.
 * 
 * @author WMS Development Team
 * @version 1.0
 * @see io.jsonwebtoken.Jwts
 */
@Service
public class JwtService {

    /**
     * The secret key used for signing JWT tokens.
     * 
     * <p><b>Educational Note:</b> The {@code @Value} annotation injects values from
     * application.properties. The syntax {@code ${property:default}} provides a default
     * value if the property is not configured. In production, always configure a
     * strong, unique secret key.
     */
    @Value("${jwt.secret:mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong}")
    private String secret;

    /**
     * Token expiration time in milliseconds (default: 24 hours = 86400000ms).
     */
    @Value("${jwt.expiration:86400000}")
    private long expiration;

    /**
     * Creates a cryptographic key for signing tokens from the secret string.
     * 
     * <p><b>Educational Note:</b> HMAC-SHA256 requires a key of at least 256 bits.
     * The Keys.hmacShaKeyFor() method creates a SecretKey suitable for the
     * HMAC-SHA algorithm based on the provided bytes.
     * 
     * @return the SecretKey for JWT signing and verification
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a new JWT token for an authenticated user.
     * 
     * <p>The token includes:
     * <ul>
     *   <li><b>subject:</b> The username (used to identify the user)</li>
     *   <li><b>issuedAt:</b> Current timestamp</li>
     *   <li><b>expiration:</b> When the token becomes invalid</li>
     *   <li><b>signature:</b> Cryptographic signature using the secret key</li>
     * </ul>
     * 
     * @param username the username to encode in the token
     * @return the JWT token string (Base64-encoded)
     */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts the username (subject) from a JWT token.
     * 
     * <p><b>Educational Note:</b> The "subject" claim is a standard JWT claim
     * typically used to identify the principal (user) the token represents.
     * 
     * @param token the JWT token string
     * @return the username encoded in the token
     * @throws JwtException if the token is invalid or expired
     */
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Validates a JWT token's authenticity and expiration.
     * 
     * <p>Validation checks:
     * <ul>
     *   <li>The signature matches (token wasn't tampered with)</li>
     *   <li>The token hasn't expired</li>
     *   <li>The token is properly formatted</li>
     * </ul>
     * 
     * @param token the JWT token string to validate
     * @return {@code true} if the token is valid, {@code false} otherwise
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Parses and validates a JWT token, returning its claims.
     * 
     * <p><b>Educational Note:</b> Claims are the key-value pairs stored in the JWT payload.
     * Standard claims include: sub (subject), iat (issued at), exp (expiration).
     * You can also add custom claims for roles, permissions, etc.
     * 
     * @param token the JWT token string to parse
     * @return the Claims object containing all token claims
     * @throws JwtException if parsing or validation fails
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
