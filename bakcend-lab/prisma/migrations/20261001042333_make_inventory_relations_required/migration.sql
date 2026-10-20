/*
  Warnings:

  - Made the column `laboratoriumId` on table `Inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `Inventory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_laboratoriumId_fkey`;

-- DropIndex
DROP INDEX `Inventory_categoryId_fkey` ON `Inventory`;

-- DropIndex
DROP INDEX `Inventory_laboratoriumId_fkey` ON `Inventory`;

-- AlterTable
ALTER TABLE `Inventory` MODIFY `laboratoriumId` INTEGER NOT NULL,
    MODIFY `categoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_laboratoriumId_fkey` FOREIGN KEY (`laboratoriumId`) REFERENCES `laboratorium`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
