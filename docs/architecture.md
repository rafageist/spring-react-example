# 🏗️ System Architecture

> Technical architecture documentation for WMS - Warehouse Management System

## Overview

WMS follows a modern **three-tier architecture** with clear separation of concerns:

1. **Presentation Layer** - React SPA with TypeScript
2. **Business Logic Layer** - Spring Boot REST API
3. **Data Layer** - PostgreSQL Database

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser[Web Browser]
    end
    
    subgraph Frontend["Frontend Layer (Port 5173)"]
        React[React 18 + TypeScript]
        Vite[Vite Dev Server]
        AntD[Ant Design UI]
        Konva[react-konva Canvas]
        i18n[i18next]
        TanStack[TanStack Query/Table]
    end
    
    subgraph Backend["Backend Layer (Port 8080)"]
        Spring[Spring Boot 3.3]
        Security[Spring Security]
        JPA[Spring Data JPA]
        JWT[JWT Authentication]
    end
    
    subgraph Database["Data Layer (Port 5432)"]
        PostgreSQL[(PostgreSQL 16)]
    end
    
    Browser -->|HTTP| React
    React --> Vite
    React --> AntD
    React --> Konva
    React --> i18n
    React --> TanStack
    TanStack -->|REST API| Spring
    Spring --> Security
    Spring --> JPA
    Security --> JWT
    JPA -->|JDBC| PostgreSQL
```

## Backend Architecture

### Package Structure

```
com.rafageist.wms
├── WmsApplication.java          # Application entry point
├── config/
│   └── SecurityConfig.java      # Security configuration
├── controller/
│   ├── AuthController.java      # Authentication endpoints
│   ├── CategoryController.java  # Category CRUD
│   ├── LocationController.java  # Location CRUD  
│   └── ProductController.java   # Product CRUD
├── dto/
│   ├── AuthResponse.java        # JWT response DTO
│   ├── LoginRequest.java        # Login request DTO
│   └── RegisterRequest.java     # Registration DTO
├── model/
│   ├── Category.java            # Category entity
│   ├── Location.java            # Warehouse location entity
│   ├── Product.java             # Product entity
│   └── User.java                # User entity
├── repository/
│   ├── CategoryRepository.java  # Category data access
│   ├── LocationRepository.java  # Location data access
│   ├── ProductRepository.java   # Product data access
│   └── UserRepository.java      # User data access
└── security/
    ├── CustomUserDetailsService.java  # User details service
    ├── JwtAuthenticationFilter.java   # JWT filter
    └── JwtService.java                # JWT operations
```

### Layered Architecture Pattern

```mermaid
graph LR
    subgraph "HTTP Layer"
        Request[HTTP Request]
    end
    
    subgraph "Controller Layer"
        Controllers[REST Controllers]
    end
    
    subgraph "Service Layer"
        Services[Business Logic]
    end
    
    subgraph "Repository Layer"
        Repositories[Spring Data JPA]
    end
    
    subgraph "Database"
        DB[(PostgreSQL)]
    end
    
    Request --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> DB
```

### Security Flow

```mermaid
sequenceDiagram
    participant Client
    participant JwtFilter as JWT Filter
    participant Controller
    participant JwtService
    participant UserService
    participant DB as Database
    
    Client->>JwtFilter: Request with JWT
    JwtFilter->>JwtService: Validate Token
    JwtService-->>JwtFilter: Token Valid
    JwtFilter->>UserService: Load User
    UserService->>DB: Find User
    DB-->>UserService: User Data
    UserService-->>JwtFilter: UserDetails
    JwtFilter->>Controller: Authenticated Request
    Controller-->>Client: Response
```

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TB
    App[App.tsx]
    
    subgraph Routes["Router"]
        Login[LoginPage]
        Protected[ProtectedRoute]
    end
    
    subgraph MainLayout["MainLayout"]
        Header[Header + Language Selector]
        Sider[Navigation Menu]
        Content[Content Area]
    end
    
    subgraph Pages["Pages"]
        Warehouse[WarehouseCanvas]
        Products[ProductsPage]
        Locations[LocationsPage]
    end
    
    subgraph Components["Shared Components"]
        ProductsTable[ProductsTable]
        ProductFormModal[ProductFormModal]
        StatsCards[StatsCards]
    end
    
    App --> Routes
    Routes --> Login
    Routes --> Protected
    Protected --> MainLayout
    MainLayout --> Header
    MainLayout --> Sider
    MainLayout --> Content
    Content --> Pages
    Pages --> Warehouse
    Pages --> Products
    Pages --> Locations
    Products --> ProductsTable
    Products --> ProductFormModal
    Products --> StatsCards
```

### State Management

```mermaid
graph LR
    subgraph "Server State (TanStack Query)"
        useProducts[useProducts]
        useLocations[useLocations]
        useCategories[useCategories]
    end
    
    subgraph "Local State (useState)"
        modalState[Modal Open/Close]
        selectedItem[Selected Item]
        formValues[Form Values]
    end
    
    subgraph "Auth State (Context)"
        authContext[AuthContext]
        token[JWT Token]
        user[User Info]
    end
    
    subgraph "i18n State"
        language[Current Language]
        translations[Translation Keys]
    end
```

### Data Flow

```mermaid
flowchart LR
    subgraph "UI Components"
        UI[User Interface]
    end
    
    subgraph "React Query"
        Queries[useQuery]
        Mutations[useMutation]
        Cache[(Query Cache)]
    end
    
    subgraph "API Layer"
        Fetch[Fetch API]
    end
    
    subgraph "Backend"
        API[REST API]
    end
    
    UI -->|User Action| Mutations
    Mutations -->|Invalidate| Cache
    Queries -->|Read| Cache
    Cache -->|Cache Miss| Fetch
    Fetch -->|HTTP| API
    API -->|Response| Fetch
    Fetch -->|Update| Cache
    Cache -->|Data| Queries
    Queries -->|Render| UI
```

## Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : owns
    CATEGORIES ||--o{ PRODUCTS : contains
    LOCATIONS ||--o{ PRODUCTS : stores
    
    USERS {
        uuid id PK
        string username UK
        string password_hash
        string full_name
        timestamp created_at
    }
    
    CATEGORIES {
        uuid id PK
        string name UK
        string description
        string color
    }
    
    LOCATIONS {
        uuid id PK
        string name
        string description
        int x
        int y
        int width
        int height
        int capacity
        string color
        string border_color
    }
    
    PRODUCTS {
        uuid id PK
        string name
        string description
        decimal price
        int stock
        string image_url
        double pos_x
        double pos_y
        uuid category_id FK
        uuid location_id FK
        uuid owner_id FK
    }
```

## Design Patterns Used

### Backend Patterns

| Pattern | Usage |
|---------|-------|
| **Repository Pattern** | Spring Data JPA repositories abstract data access |
| **DTO Pattern** | Separate request/response objects from entities |
| **Filter Chain** | JWT authentication via security filter |
| **Dependency Injection** | Spring IoC container manages all beans |
| **Builder Pattern** | JWT token construction |

### Frontend Patterns

| Pattern | Usage |
|---------|-------|
| **Component Pattern** | Reusable UI components |
| **Custom Hooks** | Encapsulate stateful logic (useProducts, useAuth) |
| **Render Props** | TanStack Table column definitions |
| **Provider Pattern** | Auth context, i18n provider |
| **Composition** | Complex UIs from simple components |

## Technology Stack Summary

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Language runtime |
| Spring Boot | 3.3.2 | Application framework |
| Spring Security | 6.x | Authentication/Authorization |
| Spring Data JPA | 3.x | ORM and data access |
| PostgreSQL | 16 | Relational database |
| JJWT | 0.12.6 | JWT library |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Ant Design | 5.22 | UI component library |
| TanStack Query | 5.x | Server state management |
| TanStack Table | 8.x | Data tables |
| react-konva | 18.x | 2D canvas rendering |
| i18next | 23.x | Internationalization |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |

## Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Web Container"
            Vite[Vite Dev Server<br/>Port: 5173]
        end
        
        subgraph "API Container"
            Spring[Spring Boot<br/>Port: 8080]
        end
        
        subgraph "DB Container"
            Postgres[PostgreSQL<br/>Port: 5432]
        end
        
        Volume[(postgres_data<br/>Volume)]
    end
    
    Vite -->|API Calls| Spring
    Spring -->|JDBC| Postgres
    Postgres -.->|Persist| Volume
```

---

[← Back to Documentation Index](./README.md)
