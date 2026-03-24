/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Livre` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Livre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "annee" INTEGER,
    "genre" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Livre" ("annee", "auteur", "createdAt", "disponible", "genre", "id", "titre") SELECT "annee", "auteur", "createdAt", "disponible", "genre", "id", "titre" FROM "Livre";
DROP TABLE "Livre";
ALTER TABLE "new_Livre" RENAME TO "Livre";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
