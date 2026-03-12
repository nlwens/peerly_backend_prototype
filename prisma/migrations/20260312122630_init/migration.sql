-- CreateEnum
CREATE TYPE "edu_level" AS ENUM ('MBO', 'HBO', 'WO', 'Master HBO', 'Master WO');

-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('PENDING', 'DECLINED', 'ACCEPTED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "request_type" AS ENUM ('REQUEST', 'OFFER');

-- CreateTable
CREATE TABLE "requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requester_id" UUID,
    "receiver_id" UUID,
    "subject" VARCHAR(255) NOT NULL,
    "type" "request_type",
    "scheduled_datetime" TIMESTAMP(6),
    "status" "request_status" DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "scheduled_datetime" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "requester_completed" BOOLEAN NOT NULL DEFAULT false,
    "receiver_completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "major" VARCHAR(100),
    "education_level" "edu_level",
    "strengths" TEXT,
    "needs_help_with" TEXT,
    "description" TEXT,
    "token_balance" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "profile_image_url" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_sessions_request_id_key" ON "study_sessions"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
