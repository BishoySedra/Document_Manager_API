# Document Manager API

This is a **Document Manager API** built with **NestJS** and **Prisma ORM** that allows users to upload, manage, and organize documents. The API supports **user authentication**, **file uploads**, **folder management**, **role-based access**, and more.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Folder Model](#folder-model)
- [Document Model](#document-model)
- [Exception Handling](#exception-handling)
- [File Upload & Storage](#file-upload--storage)
- [JWT Authentication](#jwt-authentication)
- [Testing](#testing)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/BishoySedra/Document_Manager_API.git
```

### 2. Install dependencies

Navigate to the project directory and run:

```bash
npm install
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
PORT=3000 (optional, change if needed)
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

## Folder Model

The **Folder** model defines the folder structure within the application. Folders can have parent-child relationships (subfolders). The schema ensures that folder names are unique per user.

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

  @@unique([name, createdById])  // Ensure uniqueness of name and createdById together
  @@map("folders")
}
```

### Folder Fields:
- **name**: Name of the folder.
- **createdById**: User ID who created the folder (used for uniqueness).
- **parentFolderId**: Links to the parent folder (optional for subfolders).
- **subFolders**: A recursive relation to other folders.
- **createdAt**: Timestamp when the folder was created.
- **updatedAt**: Timestamp for the last update.

---

## Document Model

The **Document** model stores information about each document, including metadata such as the file path, file type, and the user who uploaded the document.

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

### Document Fields:
- **title**: Title of the document.
- **fileType**: Enum that determines the file type (PDF, DOCX, XLSX, etc.).
- **filePath**: Path to the file (could be a URL from Cloudinary or local storage).
- **fileSize**: Size of the file in bytes.
- **uploadedById**: User ID of the uploader.
- **folderId**: Optional link to a folder if the document is organized into a folder.
- **tags**: Tags associated with the document.

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

Custom exceptions can include additional context for the error in the `body`, allowing clients to receive meaningful error details.

---

## File Upload & Storage

The application uses **Multer** for file handling and **Cloudinary** for cloud storage. The uploaded files are processed and stored in Cloudinary. The following configurations have been set:

1. **Multer** handles file uploads with size restrictions and file type validation (PDF, DOCX, XLSX, etc.).
2. **Cloudinary** handles the storage and retrieval of files after being uploaded.

---

## JWT Authentication

The application uses **JWT (JSON Web Tokens)** for user authentication:

- **Access Token**: Used for authenticating requests to protected routes.
- **Refresh Token**: Used to obtain a new access token once it expires.

The application also supports a **JWT Refresh Token** mechanism to extend user sessions without requiring them to log in again.

---

## Testing

Ensure that your **PostgreSQL** database is running and your `.env` file is correctly configured. You can use **Postman** for testing the API. Below are the resources for testing:

- **Postman Documentation (Published URL)**:  
  Access the published Postman documentation to explore the available endpoints and their details.  
  [View the API Documentation](https://documenter.getpostman.com/view/32763635/2sB2cd3ctG)  

- **Postman Collection JSON File**:  
  You can also download and import the collection into Postman for quick testing:  
  [Download Postman Collection](https://github.com/BishoySedra/Document_Manager_API/blob/main/Document%20Manager.postman_collection.json)

After importing the collection, you can test the following and many more endpoints:

- **POST** `/auth/login`: Logs in a user and returns an access token.
- **POST** `/auth/register`: Registers a new user.
- **POST** `/documents/upload`: Uploads a new document.
- **GET** `/folders`: Retrieves all folders of the authenticated user.
- **GET** `/folders/:id`: Retrieves details of a specific folder.

---

### **Final Thoughts:**
This API is designed to allow document management with a focus on **user access control**, **file storage**, and **validation**. It also includes **JWT authentication** and **refresh tokens** for secure user sessions.
