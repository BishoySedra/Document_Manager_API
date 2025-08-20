# Document Manager API

**Live Swagger Docs**: 👉 [https://document-manager-api.onrender.com/docs/](https://document-manager-api.onrender.com/docs/)

This is a **Document Manager API** built with **NestJS** and **Prisma ORM** that allows users to upload, manage, and organize documents. The API supports **user authentication**, **file uploads**, **folder management**, **role-based access**, and more.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Steps to Run the Docker Container](#steps-to-run-the-docker-container)
- [Features](#features)
- [Professional API Design](#professional-api-design)
- [API Endpoints](#api-endpoints)
- [User Model](#user-model)
- [DocumentPermission Model](#documentpermission-model)
- [Folder Model](#folder-model)
- [Document Model](#document-model)
- [Enums](#enums)
- [Exception Handling](#exception-handling)
- [File Upload & Storage](#file-upload--storage)
- [JWT Authentication](#jwt-authentication)
- [Testing](#testing)
- [Final Thoughts](#final-thoughts)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/BishoySedra/Document_Manager_API.git
```

### 2. Install dependencies

Navigate to the project directory and run:

```bash
npm install --legacy-peer-deps
```

> **Note**: The `--legacy-peer-deps` flag is used to resolve dependency conflicts between NestJS and Swagger packages for optimal compatibility.

### 3. Set up your database

The project uses **PostgreSQL** as the database. Make sure you have a PostgreSQL instance running, and set up the connection string in the `.env` file.

```plaintext
DATABASE_URL=postgresql://user:password@localhost:5432/your-database
```

Run the Prisma migrations to set up the database as a container by running the following script:

```bash
npm run db:dev:restart
```

### 4. Start the application

Once the database is set up, start the application:

```bash
npm run start:dev
```

The application should now be running on `http://localhost:3000`.

---

## Environment Variables

Make sure to configure the following environment variables in your `.env` file:

```plaintext
DATABASE_URL=postgresql://user:password@localhost:5432/your-database
PORT=3000
SALT_ROUNDS=10
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
PREFIX_URL="/api/v1"
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_api_secret
```

---

## Steps to Run the Docker Container

1. **Update the Database URL in `.env`**:

   * Replace `localhost` in the `DATABASE_URL` with `dev-db` (the container name for the PostgreSQL service provided by Docker).

   ```plaintext
   DATABASE_URL="postgresql://postgres:123@dev-db:5432/document_manager?schema=public"
   ```

2. **Run the Docker Container**:

   * Use one of the following commands to start the container:

     * To start the container in the background:

       ```bash
       npm run app:container:up
       ```
     * To restart the container (if necessary):

       ```bash
       npm run app:container:restart
       ```

3. **Revert Database URL to `localhost`**:

   * After successfully running the container, revert the `DATABASE_URL` in the `.env` file to use `localhost` for listening to the database service.

   ```plaintext
   DATABASE_URL="postgresql://postgres:123@localhost:5432/document_manager?schema=public"
   ```

4. **Ensure Correct Port**:

   * Verify that the `PORT` in your `.env` file is different from the port the `nest-app` container is listening to.

---

## Features

- **User Authentication**: Supports **JWT** authentication for users with refresh token mechanisms.
- **Folder Management**: Users can create folders, organize them, and manage hierarchical subfolder structures.
- **File Upload**: Supports uploading of documents (PDF, DOCX, XLSX, TXT, etc.) using **Multer** and **Cloudinary**.
- **Role-Based Access Control (RBAC)**: Allows assigning permissions to users for documents (view, edit, download). Admins can manage all users.
- **Exception Handling**: Custom exceptions with **JSON response formatting** based on the JSend specification.
- **JWT Refresh Tokens**: Support for refreshing JWT tokens with the refresh token mechanism.
- **User Role Management**: Admins can view, update, and delete user profiles with role-based access.
- **Professional API Documentation**: Comprehensive Swagger/OpenAPI documentation with detailed examples and use cases.
- **Permission System**: Fine-grained document access control with VIEW, EDIT, and DOWNLOAD permissions.

---

## Professional API Design

This API follows enterprise-grade design principles and industry best practices:

### 🏗️ **Architecture & Standards**
- **RESTful Design**: Clean, intuitive endpoints following REST conventions
- **JSend Specification**: Consistent response format across all endpoints
- **OpenAPI 3.0**: Professional API documentation with comprehensive Swagger UI
- **TypeScript**: Full type safety and enhanced developer experience
- **Validation**: Robust input validation using class-validator decorators

### 🔐 **Security & Authentication**
- **JWT-based Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Admin and User roles with different permission levels
- **Permission-Based Authorization**: Fine-grained document access control
- **Input Sanitization**: Comprehensive request validation and sanitization

### 📊 **Data Management**
- **Prisma ORM**: Type-safe database operations with automatic migrations
- **PostgreSQL**: Robust relational database with ACID compliance
- **Cloudinary Integration**: Secure cloud-based file storage and management
- **Hierarchical Organization**: Nested folder structures for document organization

### 🚀 **Developer Experience**
- **Interactive Documentation**: Swagger UI with live API testing capabilities
- **Comprehensive Examples**: Realistic request/response examples with proper UUIDs
- **Error Handling**: Detailed error responses with actionable troubleshooting information
- **Professional Code Structure**: Clean, maintainable codebase with comprehensive documentation

---

## API Endpoints

### Authentication
- **POST** `/auth/register`: Registers a new user and returns an access token.
- **POST** `/auth/login`: Logs in a user and returns access and refresh tokens.
- **POST** `/auth/refresh`: Refreshes the access token using the refresh token.
- **POST** `/auth/logout`: Logs the user out by invalidating the refresh token.
- **GET** `/auth/profile/`: Retrieves the authenticated user's profile information.
- **PATCH** `/auth/password/`: Allows a user to change their password.

### File Management
- **POST** `/documents/upload`: Upload a new document to the server (requires authentication).
- **GET** `/documents/:id`: Retrieve document details by ID.
- **PATCH** `/documents/:id`: Update document metadata by ID (e.g., rename, add tags).
- **DELETE** `/documents/:id`: Delete a document by ID.

### Folder Management
- **POST** `/folders`: Create a new folder (requires authentication).
- **GET** `/folders`: List all folders created by the current user.
- **GET** `/folders/:id`: Retrieve details of a specific folder.
- **GET** `/folders/:id/documents`: Retrieve documents associated with a specific folder.
- **PATCH** `/folders/:id`: Update a folder (e.g., rename) by ID.
- **DELETE** `/folders/:id`: Delete a folder by ID.

### User Management (Admin Only)
- **GET** `/users`: Retrieve all users (admin-only).
- **GET** `/users/:id`: Retrieve a user by ID (admin-only or users can access their own).
- **PATCH** `/users/:id`: Update a user profile by ID (admin-only or users can update their own).
- **DELETE** `/users/:id`: Delete a user by ID (admin-only).

---

## User Model

```prisma
model User {
  id                  String                @id @default(uuid())
  name                String
  email               String                @unique
  password            String
  hashedRt            String?
  role                Role                  @default(USER)
  folders             Folder[]
  documents           Document[]
  documentPermissions DocumentPermission[]

  @@map("users")
}
```

---

## DocumentPermission Model

```prisma
model DocumentPermission {
  id         String     @id @default(uuid())
  document   Document   @relation(fields: [documentId], references: [id])
  documentId String
  user       User       @relation(fields: [userId], references: [id])
  userId     String
  permission Permission

  @@unique([documentId, userId])
  @@map("documentPermissions")
}
```

---

## Folder Model

```prisma
model Folder {
  id             String    @id @default(uuid())
  name           String
  parentFolder   Folder?   @relation("FolderToFolder", fields: [parentFolderId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  parentFolderId String?
  subFolders     Folder[]  @relation("FolderToFolder")
  createdBy      User      @relation(fields: [createdById], references: [id], onDelete: Cascade, onUpdate: Cascade)
  createdById    String
  documents      Document[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([name, createdById])
  @@map("folders")
}
```

---

## Document Model

```prisma
model Document {
  id                  String                @id @default(uuid())
  title               String
  description         String?
  tags                String[]
  filePath            String
  fileType            FileType
  fileSize            Int
  uploadedBy          User                  @relation(fields: [uploadedById], references: [id])
  uploadedById        String
  folder              Folder?               @relation(fields: [folderId], references: [id])
  folderId            String?
  documentPermissions DocumentPermission[]
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt

  @@map("documents")
}
```

---

## Enums

### FileType Enum

```prisma
enum FileType {
  PDF
  DOCX
  DOC
  CSV
  XLS
  XLSX
  PPT
  PPTX
  TXT
}
```

### Permission Enum

```prisma
enum Permission {
  VIEW
  EDIT
  DOWNLOAD
}
```

### Role Enum

```prisma
enum Role {
  USER
  ADMIN
}
```

---

## Exception Handling

The application uses a **Global Exception Filter** to catch and format all exceptions. The custom exception (`CustomException`) provides flexibility to send a structured response with a **message** and **body**. The exception is formatted as follows:

```json
{
  "status": 400,
  "message": "Unauthorized",
  "body": null
}
```

---

## File Upload & Storage

- Uses **Multer** to handle local file uploads.
- Uses **Cloudinary** to store and serve uploaded files.
- Validates file size and supported file types based on the `FileType` enum.

---

## JWT Authentication

- Authenticates users using **access tokens**.
- Supports **refresh tokens** for session extension.
- Tokens are secured via environment-configured secrets.

---

## Testing

The API comes with built-in **Swagger UI documentation** that allows you to test all endpoints interactively. After starting the application, you can access the Swagger documentation at:

```
http://localhost:3000/docs
```

### Features of Swagger Documentation:
- **Interactive API testing**: Try out endpoints directly from your browser with live request/response testing
- **Comprehensive authentication support**: Easily authorize using JWT tokens with built-in token management
- **Professional documentation**: Detailed endpoint descriptions, use cases, and operational workflows
- **Request body templates**: Pre-filled request bodies with realistic examples for all endpoints
- **Response examples**: Comprehensive response formats with success and error scenarios
- **Endpoint grouping**: Organized by functionality (Authentication, Users, Documents, Folders, Permissions)
- **Parameter documentation**: Detailed parameter descriptions with validation rules and constraints
- **Error handling documentation**: Complete error response schemas with troubleshooting information
- **Permission-based documentation**: Clear documentation of required permissions for each operation

### Enhanced API Documentation Features:
- **JSend Specification Compliance**: All responses follow consistent JSend format for predictable API behavior
- **Detailed Operation Descriptions**: Each endpoint includes comprehensive descriptions with:
  - Step-by-step operation workflows
  - Authorization requirements and permission levels  
  - Validation rules and constraints
  - Use cases and practical examples
  - Security considerations
- **Professional Examples**: Realistic request/response examples using proper UUIDs and meaningful data
- **Hierarchical Organization**: Clear documentation of folder structures and document relationships
- **Permission System Documentation**: Comprehensive access control documentation with permission hierarchies

To use the Swagger UI:
1. Start your application (`npm run start:dev`)
2. Open `http://localhost:3000/docs` in your browser
3. For protected endpoints:
   - First authenticate via the Auth endpoints
   - Click the "Authorize" button and enter your JWT token
   - Now you can test all protected routes

The Swagger UI provides complete documentation for:
- All request parameters
- Required headers
- Possible response codes
- Response schemas

---

### Final Thoughts

This API represents a **professional-grade document management solution** built with enterprise standards and best practices. It combines the power of **NestJS**, **Prisma ORM**, and **TypeScript** to deliver a robust, scalable, and maintainable system.

#### 🎯 **Key Strengths**
- **Enterprise Architecture**: Professional codebase structure with comprehensive documentation
- **Security-First Design**: Multi-layered security with JWT authentication and fine-grained permissions
- **Developer-Friendly**: Extensive Swagger documentation with interactive testing capabilities
- **Scalable Foundation**: Built for growth with modular architecture and type safety
- **Industry Standards**: Follows REST conventions, JSend specification, and OpenAPI standards

#### 🚀 **Perfect For**
- Document management systems requiring secure access control
- Team collaboration platforms with file sharing capabilities
- Enterprise applications needing hierarchical document organization
- Projects requiring professional API documentation and developer experience
- Systems that need to scale with comprehensive permission management

The API is designed to provide a solid foundation for document management with a focus on **user access control**, **secure file storage**, **professional documentation**, and **maintainable code architecture**. With its comprehensive JWT authentication system, refresh token mechanisms, and fine-grained permission controls, it's ready for production use in enterprise environments.

