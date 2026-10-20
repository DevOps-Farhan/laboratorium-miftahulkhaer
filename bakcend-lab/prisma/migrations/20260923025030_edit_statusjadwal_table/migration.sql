/*
  Warnings:

  - You are about to alter the column `status` on the `jadwal_lab` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `jadwal_lab` MODIFY `status` ENUM('BELUM_MULAI', 'BATAL', 'DALAM_SESI', 'SELESAI') NOT NULL DEFAULT 'BELUM_MULAI';
