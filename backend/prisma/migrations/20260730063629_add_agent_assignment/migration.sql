-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "agentId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
