# Real Estate Marketplace Platform

## Overview

A modern, full-featured real estate marketplace platform that connects buyers, sellers, and agents. The application provides comprehensive property listing capabilities, advanced search functionality, user management with role-based access control, and real-time communication features. Built with a focus on visual appeal and user experience, inspired by modern platforms like Zillow, Realtor.com, and Airbnb.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript running on Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI components
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom design tokens with CSS variables for theming, following a reference-based approach inspired by modern real estate platforms

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the full stack
- **Authentication**: Replit Auth integration with session-based authentication using connect-pg-simple for session storage
- **Authorization**: Role-based access control supporting buyer, seller, agent, and admin roles
- **Password Security**: bcrypt for password hashing with configurable salt rounds
- **API Pattern**: RESTful API design with standardized error handling and logging middleware

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: 
  - Users table with role-based permissions and profile management
  - Properties table with comprehensive listing details and agent relationships
  - Messages table for in-app communication between users
  - Favorites table for property bookmarking functionality
  - Sessions table for authentication state management

### Authentication and Authorization
- **Primary Auth**: Replit Auth with OpenID Connect (OIDC) integration
- **Session Management**: Secure session storage with PostgreSQL backend
- **Role-Based Access**: Middleware-based authorization with granular permissions
- **Security Features**: Password strength validation, secure session configuration with CSRF protection

### Component Architecture
- **UI Components**: Modular component library built on Radix UI primitives
- **Property Management**: Comprehensive property card, grid, search, and detail components
- **Communication**: Contact forms and agent profile components for user interaction
- **Authentication**: Modal-based authentication flow with social login options

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database for scalable data storage
- **Authentication**: Replit Auth service for OAuth and user management
- **UI Framework**: Radix UI for accessible, unstyled component primitives
- **Styling**: Tailwind CSS for utility-first styling approach

### Development Dependencies
- **Build Tools**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript compiler for static type analysis
- **Database Tools**: Drizzle Kit for database migrations and schema management

### Planned Integrations
- **Maps**: Google Maps or Mapbox integration for location-based search and property mapping
- **Media Storage**: Cloud storage solution for property images and virtual tours
- **Communication**: Email and SMS notification services for alerts and messaging
- **Payment Processing**: Payment gateway integration for premium features or transactions