-- CreateTable
CREATE TABLE "discordUsers" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL,
    "avatar" TEXT,
    "accessToken" TEXT NOT NULL,

    CONSTRAINT "discordUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discordUsers_discordId_key" ON "discordUsers"("discordId");
