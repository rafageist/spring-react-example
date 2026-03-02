# 🔐 Security Documentation

> JWT Authentication and Authorization in WMS

## Overview

WMS implements **stateless JWT (JSON Web Token) authentication** using Spring Security 6. This provides:

- 🔑 Token-based authentication
- 🛡️ Stateless session management
- ⏱️ Configurable token expiration
- 🔒 BCrypt password hashing

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant S as Security Filter
    participant C as Controller
    participant J as JWT Service
    participant D as Database

    rect rgb(230, 245, 255)
        Note over U,D: Registration Flow
        U->>F: Fill registration form
        F->>A: POST /api/auth/register
        A->>C: AuthController.register()
        C->>D: Check username exists
        D-->>C: Not found
        C->>C: Hash password (BCrypt)
        C->>D: Save new user
        D-->>C: User saved
        C->>J: Generate JWT
        J-->>C: Token
        C-->>F: { token, username, fullName }
        F->>F: Store token in localStorage
        F-->>U: Redirect to dashboard
    end

    rect rgb(255, 245, 230)
        Note over U,D: Login Flow
        U->>F: Enter credentials
        F->>A: POST /api/auth/login
        A->>C: AuthController.login()
        C->>D: Find user by username
        D-->>C: User found
        C->>C: Verify password (BCrypt)
        C->>J: Generate JWT
        J-->>C: Token
        C-->>F: { token, username, fullName }
        F->>F: Store token in localStorage
        F-->>U: Redirect to dashboard
    end

    rect rgb(230, 255, 230)
        Note over U,D: Authenticated Request
        U->>F: Access protected resource
        F->>F: Get token from localStorage
        F->>A: GET /api/products<br/>Authorization: Bearer {token}
        A->>S: JwtAuthenticationFilter
        S->>J: Extract & validate token
        J-->>S: Token valid + username
        S->>D: Load user details
        D-->>S: UserDetails
        S->>S: Set authentication
        S->>C: Forward request
        C-->>F: Protected resource
        F-->>U: Display data
    end
```

---

## Security Configuration

### Public Endpoints

These endpoints are accessible without authentication:

```java
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/api/hello").permitAll()
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/hello` | GET | Health check |

### Protected Endpoints

All other endpoints require a valid JWT token:

```java
.anyRequest().authenticated()
```

---

## JWT Structure

### Token Format

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcwOTEyMzQ1NiwiZXhwIjoxNzA5MjA5ODU2fQ.abc123...
```

### Token Payload (Claims)

```json
{
  "sub": "admin",           // Subject (username)
  "iat": 1709123456,        // Issued at (Unix timestamp)
  "exp": 1709209856         // Expiration (Unix timestamp)
}
```

### Token Lifetime

Default: **24 hours** (86,400,000 milliseconds)

```java
private long jwtExpirationMs = 86400000;
```

---

## Password Security

### Hashing Algorithm

Passwords are hashed using **BCrypt** with a strength factor of 10:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

### Password Verification

```java
if (!passwordEncoder.matches(password, user.getPasswordHash())) {
    throw new RuntimeException("Invalid credentials");
}
```

---

## Security Components

### JwtService

Handles JWT operations:

```mermaid
classDiagram
    class JwtService {
        -String jwtSecret
        -long jwtExpirationMs
        +generateToken(UserDetails) String
        +extractUsername(String) String
        +validateToken(String, UserDetails) boolean
        -extractClaim(String, Function) T
        -extractAllClaims(String) Claims
        -getSigningKey() SecretKey
        -isTokenExpired(String) boolean
    }
```

| Method | Purpose |
|--------|---------|
| `generateToken()` | Creates new JWT for authenticated user |
| `extractUsername()` | Extracts username from token |
| `validateToken()` | Validates token signature and expiration |
| `isTokenExpired()` | Checks if token has expired |

### JwtAuthenticationFilter

Intercepts requests and validates tokens:

```java
@Override
protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain
) {
    // 1. Extract token from Authorization header
    // 2. Validate token
    // 3. Set authentication in SecurityContext
    // 4. Continue filter chain
}
```

### CustomUserDetailsService

Loads user data from database:

```java
@Override
public UserDetails loadUserByUsername(String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException(...));
    
    return org.springframework.security.core.userdetails.User
        .withUsername(user.getUsername())
        .password(user.getPasswordHash())
        .authorities("ROLE_USER")
        .build();
}
```

---

## Frontend Integration

### Storing Token

```typescript
// After successful login
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify({
    username: response.username,
    fullName: response.fullName
}));
```

### Sending Token

```typescript
// API client configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Handling Token Expiration

```typescript
// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## CORS Configuration

Cross-Origin Resource Sharing (CORS) allows frontend to access the API:

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ));
    configuration.setAllowedMethods(Arrays.asList(
        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
    ));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## Security Best Practices

### Implemented

| Practice | Implementation |
|----------|---------------|
| Password Hashing | BCrypt with strength 10 |
| Stateless Sessions | JWT tokens, no server-side sessions |
| Token Expiration | 24-hour token lifetime |
| CSRF Disabled | Not needed for stateless API |
| CORS Configured | Whitelist allowed origins |

### Recommendations for Production

| Enhancement | Description |
|-------------|-------------|
| HTTPS | Use TLS/SSL certificates |
| Token Refresh | Implement refresh token flow |
| Rate Limiting | Prevent brute force attacks |
| JWT Secret | Use strong, environment-specific secrets |
| Audit Logging | Log authentication events |
| Password Policy | Enforce minimum complexity |

---

## Error Responses

### 401 Unauthorized

```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 401,
    "error": "Unauthorized",
    "message": "Full authentication is required"
}
```

### 403 Forbidden

```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 403,
    "error": "Forbidden",
    "message": "Access Denied"
}
```

---

## Security Flow Diagram

```mermaid
flowchart TB
    subgraph Request["Incoming Request"]
        R[HTTP Request]
    end
    
    subgraph Filters["Security Filter Chain"]
        F1[CorsFilter]
        F2[JwtAuthenticationFilter]
        F3[UsernamePasswordAuthenticationFilter]
        F4[ExceptionTranslationFilter]
        F5[FilterSecurityInterceptor]
    end
    
    subgraph Auth["Authentication"]
        A1{Has Token?}
        A2[Extract Token]
        A3{Token Valid?}
        A4[Load UserDetails]
        A5[Set Authentication]
    end
    
    subgraph Access["Access Control"]
        AC1{Authenticated?}
        AC2{Authorized?}
        AC3[Allow Access]
        AC4[Deny Access]
    end
    
    R --> F1
    F1 --> F2
    F2 --> A1
    A1 -->|Yes| A2
    A1 -->|No| F3
    A2 --> A3
    A3 -->|Yes| A4
    A3 -->|No| F3
    A4 --> A5
    A5 --> F3
    F3 --> F4
    F4 --> F5
    F5 --> AC1
    AC1 -->|Yes| AC2
    AC1 -->|No| AC4
    AC2 -->|Yes| AC3
    AC2 -->|No| AC4
```

---

[← Back to Documentation Index](./README.md)
