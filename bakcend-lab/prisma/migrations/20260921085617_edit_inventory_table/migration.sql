/*
  Warnings:

  - Made the column `tanggalbeli` on table `Inventory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Inventory` MODIFY `tanggalbeli` DATETIME(3) NOT NULL;
