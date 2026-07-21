-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "ScriptCategory" AS ENUM ('COUPON', 'POST_SALE', 'QUOTE_RECOVERY', 'LAUNCH', 'SEASONAL_OFFER', 'FREE_SHIPPING', 'FEATURED_PRODUCT', 'RETURNING_CUSTOMER');

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" "CouponDiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "min_order_value" DECIMAL(12,2),
    "max_discount_value" DECIMAL(12,2),
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "usage_limit_per_customer" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_seasonal" BOOLEAN NOT NULL DEFAULT false,
    "seasonal_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_scripts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "message_template" TEXT NOT NULL,
    "category" "ScriptCategory" NOT NULL DEFAULT 'COUPON',
    "linked_coupon_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_is_active_idx" ON "coupons"("is_active");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupon_scripts_category_idx" ON "coupon_scripts"("category");

-- CreateIndex
CREATE INDEX "coupon_scripts_linked_coupon_id_idx" ON "coupon_scripts"("linked_coupon_id");

-- CreateIndex
CREATE INDEX "coupon_scripts_is_active_idx" ON "coupon_scripts"("is_active");

-- AddForeignKey
ALTER TABLE "coupon_scripts" ADD CONSTRAINT "coupon_scripts_linked_coupon_id_fkey" FOREIGN KEY ("linked_coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
