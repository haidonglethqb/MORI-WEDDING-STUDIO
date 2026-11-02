CREATE TYPE "ProductType" AS ENUM ('PAPER', 'DIGITAL');
CREATE TYPE "ProductState" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "PaperShape" AS ENUM ('FLAT', 'BIFOLD', 'TRIFOLD');
CREATE TYPE "VariantAvailability" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'QUOTE_REQUIRED');
CREATE TYPE "PriceBookState" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "description" TEXT NOT NULL,
    "state" "ProductState" NOT NULL DEFAULT 'DRAFT',
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    "styleTags" TEXT[],
    "colourTags" TEXT[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

CREATE TABLE "product_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "shape" "PaperShape" NOT NULL,
    "availability" "VariantAvailability" NOT NULL,
    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

CREATE TABLE "price_books" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "versionLabel" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "state" "PriceBookState" NOT NULL DEFAULT 'DRAFT',
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_books_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "price_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "priceBookId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "quantityMin" INTEGER NOT NULL,
    "quantityMax" INTEGER NOT NULL,
    "unitAmountVnd" BIGINT NOT NULL,
    "setupAmountVnd" BIGINT NOT NULL,
    CONSTRAINT "price_rules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "price_rules_variantId_idx" ON "price_rules"("variantId");

ALTER TABLE "price_rules" ADD CONSTRAINT "price_rules_quantity_range"
CHECK ("quantityMin" >= 1 AND "quantityMax" >= "quantityMin" AND "quantityMax" <= 10000);
ALTER TABLE "price_rules" ADD CONSTRAINT "price_rules_amounts_nonnegative"
CHECK ("unitAmountVnd" >= 0 AND "setupAmountVnd" >= 0);

ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "price_rules" ADD CONSTRAINT "price_rules_priceBookId_fkey"
FOREIGN KEY ("priceBookId") REFERENCES "price_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "price_rules" ADD CONSTRAINT "price_rules_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
