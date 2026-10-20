-- CreateTable
CREATE TABLE `jadwal_slot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `catatan` VARCHAR(191) NULL,
    `tglmulai` DATETIME(3) NOT NULL,
    `tglselesai` DATETIME(3) NOT NULL,
    `status` ENUM('TERSEDIA', 'DIBOOKING', 'BATAL') NOT NULL DEFAULT 'TERSEDIA',
    `bookedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `laboratoriumId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `bookedById` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jadwal_slot` ADD CONSTRAINT `jadwal_slot_laboratoriumId_fkey` FOREIGN KEY (`laboratoriumId`) REFERENCES `laboratorium`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_slot` ADD CONSTRAINT `jadwal_slot_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_slot` ADD CONSTRAINT `jadwal_slot_bookedById_fkey` FOREIGN KEY (`bookedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
