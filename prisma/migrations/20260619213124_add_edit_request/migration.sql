-- CreateTable
CREATE TABLE "EditRequest" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "newTitle" TEXT NOT NULL,
    "newAuthor" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "EditRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApprovalRelation" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApprovalRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ApprovalRelation_B_index" ON "_ApprovalRelation"("B");

-- AddForeignKey
ALTER TABLE "EditRequest" ADD CONSTRAINT "EditRequest_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalRelation" ADD CONSTRAINT "_ApprovalRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "EditRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalRelation" ADD CONSTRAINT "_ApprovalRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
