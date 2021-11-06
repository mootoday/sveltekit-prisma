-- CreateTable
CREATE TABLE "Todo" (
    "uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL,

    PRIMARY KEY ("uid")
);
