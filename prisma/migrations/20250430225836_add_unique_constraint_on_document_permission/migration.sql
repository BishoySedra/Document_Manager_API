/*
  Warnings:

  - A unique constraint covering the columns `[documentId,userId]` on the table `documentPermissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "documentPermissions_documentId_userId_key" ON "documentPermissions"("documentId", "userId");
