# Document Manager API

This is a **Document Manager API** built with **NestJS** and **Prisma ORM** that allows users to upload, manage, and organize documents. The API supports **user authentication**, **file uploads**, **folder management**, **role-based access**, and more.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Steps to Run the Docker Container](#steps-to-run-the-docker-container)
- [Features](#features)
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

- **User Authentication**: Supports **JWT** authentication for users.
- **Folder Management**: Users can create folders, organize them, and manage subfolders.
- **File Upload**: Supports uploading of documents (PDF, DOCX, XLSX, TXT, etc.) using **Multer** and **Cloudinary**.
- **Role-Based Access Control (RBAC)**: Allows assigning permissions to users for documents (view, edit, download). Admins can manage all users.
- **Exception Handling**: Custom exceptions with **JSON response formatting** based on the JSend specification.
- **JWT Refresh Tokens**: Support for refreshing JWT tokens with the refresh token mechanism.
- **User Role Management**: Admins can view, update, and delete user profiles with role-based access.

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
- **Interactive API testing**: Try out endpoints directly from your browser
- **Authentication support**: Easily authorize using JWT tokens
- **Request body templates**: Pre-filled request bodies for all endpoints
- **Response examples**: See expected response formats
- **Endpoint grouping**: Organized by functionality (Auth, Users, Documents, etc.)

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

This API is designed to allow document management with a focus on user access control, file storage, and validation. It also includes JWT authentication and refresh tokens for secure user sessions.

