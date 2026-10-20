-- AlterTable
ALTER TABLE `jadwal_slot` ADD COLUMN `rutinId` INTEGER NULL;

-- CreateTable
CREATE TABLE `jadwal_rutin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jamMulai` VARCHAR(191) NOT NULL,
    `jamSelesai` VARCHAR(191) NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `laboratoriumId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jadwal_rutin` ADD CONSTRAINT `jadwal_rutin_laboratoriumId_fkey` FOREIGN KEY (`laboratoriumId`) REFERENCES `laboratorium`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_rutin` ADD CONSTRAINT `jadwal_rutin_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_slot` ADD CONSTRAINT `jadwal_slot_rutinId_fkey` FOREIGN KEY (`rutinId`) REFERENCES `jadwal_rutin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
