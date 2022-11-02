/*
  Warnings:

  - You are about to drop the column `discordId` on the `discordUsers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `discordUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "discordUsers_discordId_key";

-- AlterTable
ALTER TABLE "discordUsers" DROP COLUMN "discordId",
ALTER COLUMN "accessToken" DROP NOT NULL;

-- CreateTable
CREATE TABLE "giveaways" (
    "id" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "winnersCount" INTEGER NOT NULL,
    "endsAt" TIMESTAMP(3),
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GiveawayEntries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GiveawayWinners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GiveawayEntries_AB_unique" ON "_GiveawayEntries"("A", "B");

-- CreateIndex
CREATE INDEX "_GiveawayEntries_B_index" ON "_GiveawayEntries"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GiveawayWinners_AB_unique" ON "_GiveawayWinners"("A", "B");

-- CreateIndex
CREATE INDEX "_GiveawayWinners_B_index" ON "_GiveawayWinners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "discordUsers_id_key" ON "discordUsers"("id");

-- AddForeignKey
ALTER TABLE "_GiveawayEntries" ADD CONSTRAINT "_GiveawayEntries_A_fkey" FOREIGN KEY ("A") REFERENCES "discordUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GiveawayEntries" ADD CONSTRAINT "_GiveawayEntries_B_fkey" FOREIGN KEY ("B") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GiveawayWinners" ADD CONSTRAINT "_GiveawayWinners_A_fkey" FOREIGN KEY ("A") REFERENCES "discordUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GiveawayWinners" ADD CONSTRAINT "_GiveawayWinners_B_fkey" FOREIGN KEY ("B") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;
