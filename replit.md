# Doctless Paint E-commerce Platform

## Overview

Doctless Paint is a Flask-based e-commerce platform specializing in premium quality paints, brushes, and painting accessories. The platform provides a complete online shopping experience with user authentication, product browsing, cart management, order processing, and admin controls. Built with a modern web stack, it features responsive design, secure payment processing through Paystack, and comprehensive administrative functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Problem**: Need for responsive, user-friendly interface across all device types
**Solution**: Bootstrap 5 with custom CSS and vanilla JavaScript
**Rationale**: Bootstrap provides rapid development with consistent UI components while custom CSS allows brand-specific styling. Vanilla JavaScript keeps the frontend lightweight without framework dependencies.

### Backend Architecture
**Problem**: Need for scalable web application with clear separation of concerns
**Solution**: Flask with Blueprint-based modular architecture
**Components**:
- `main_bp`: Core e-commerce functionality (products, cart, orders)
- `auth_bp`: User authentication and profile management
- `admin_bp`: Administrative interface for business operations
- `google_auth`: OAuth integration for social login

**Rationale**: Flask provides flexibility while Blueprints enable clean code organization and maintainability. This modular approach allows different teams to work on separate features independently.

### Data Storage Architecture
**Problem**: Need for relational data with complex relationships between users, products, and orders
**Solution**: SQLAlchemy ORM with SQLite (development) and PostgreSQL support (production)
**Schema Design**:
- User authentication with social login support (Google OAuth)
- Product catalog with categories, inventory, and pricing
- Shopping cart with user sessions
- Order management with item tracking
- Contact form submissions
- Admin privilege system

**Rationale**: SQLAlchemy provides database abstraction and relationship management while supporting multiple database backends for different environments.

### Authentication System
**Problem**: Secure user authentication with multiple login options
**Solution**: Flask-Login with password hashing and OAuth integration
**Features**:
- Traditional email/password authentication
- Google OAuth integration
- Admin role-based access control
- Session management with remember functionality

**Rationale**: Flask-Login provides session management while OAuth offers user convenience and security. Role-based access ensures proper administrative controls.

### Payment Processing
**Problem**: Secure payment processing for Nigerian market
**Solution**: Paystack integration for payment processing
**Features**:
- Secure payment gateway integration
- Transaction reference tracking
- Payment status management
- Nigerian Naira currency support

**Rationale**: Paystack is optimized for African markets and provides robust payment processing with strong security features.

### Admin Dashboard
**Problem**: Need for comprehensive business management interface
**Solution**: Dedicated admin blueprint with role-based access
**Features**:
- Product catalog management (CRUD operations)
- Order processing and status updates
- User management and analytics
- Contact message handling
- Dashboard with business metrics

**Rationale**: Separate admin interface ensures business users can manage the platform without technical knowledge while maintaining security through role-based access.

### File Management
**Problem**: Handle product images and media files efficiently
**Solution**: Custom utility functions with PIL (Python Imaging Library)
**Features**:
- Image upload and processing
- Automatic resizing and optimization
- Secure filename handling
- Static file serving

**Rationale**: PIL provides robust image processing while custom utilities ensure security and performance optimization.

## External Dependencies

### Payment Gateway
- **Paystack**: Primary payment processor for secure transactions and Nigerian market support

### Authentication Services
- **Google OAuth**: Social login integration for user convenience

### Frontend Libraries
- **Bootstrap 5**: UI framework for responsive design
- **Font Awesome**: Icon library for consistent iconography
- **Google Fonts**: Typography (Inter and Poppins fonts)

### Python Packages
- **Flask**: Core web framework
- **SQLAlchemy**: Database ORM and management
- **Flask-Login**: User session management
- **WTForms**: Form handling and validation
- **Werkzeug**: Security utilities and password hashing
- **PIL (Pillow)**: Image processing and optimization
- **Requests**: HTTP client for external API calls
- **OAuthLib**: OAuth protocol implementation

### Database Systems
- **SQLite**: Development database
- **PostgreSQL**: Production database support (configurable via environment variables)

### Development Tools
- **Flask-WTF**: CSRF protection and form integration
- **Python-dotenv**: Environment variable management (implicit)