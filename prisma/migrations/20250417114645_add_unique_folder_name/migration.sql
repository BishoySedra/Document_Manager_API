/*
  Warnings:

  - A unique constraint covering the columns `[name,createdById]` on the table `folders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "folders_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "folders_name_createdById_key" ON "folders"("name", "createdById");
