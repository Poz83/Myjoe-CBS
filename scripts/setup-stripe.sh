#!/bin/bash
# Myjoe Stripe Setup Script
# Run: stripe login && bash scripts/setup-stripe.sh
# Requires: Stripe CLI (https://stripe.com/docs/stripe-cli)

set -e

echo "Creating Myjoe Stripe products and prices..."
echo ""

# Create the main product (unit-based: 1 unit = 100 Blots)
echo "Creating product: Myjoe Blots (100-pack)..."
PRODUCT_ID=$(stripe products create \
  --name="Myjoe Blots (100-pack)" \
  --description="AI coloring book generation credits. 1 unit = 100 Blots." \
  --metadata[type]=blots \
  --metadata[blots_per_unit]=100 \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

echo "Product created: $PRODUCT_ID"
echo ""

# Create subscription prices
echo "Creating subscription prices..."

# Creator Monthly: $1.60/unit
CREATOR_MONTHLY=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=160 \
  --currency=usd \
  --recurring[interval]=month \
  --lookup-key=creator_monthly \
  --metadata[tier]=creator \
  --metadata[interval]=monthly \
  --metadata[blots_per_unit]=100 \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Creator Monthly: $CREATOR_MONTHLY"

# Creator Annual: $1.28/unit
CREATOR_ANNUAL=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=128 \
  --currency=usd \
  --recurring[interval]=year \
  --lookup-key=creator_annual \
  --metadata[tier]=creator \
  --metadata[interval]=yearly \
  --metadata[blots_per_unit]=100 \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Creator Annual: $CREATOR_ANNUAL"

# Studio Monthly: $1.00/unit
STUDIO_MONTHLY=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=100 \
  --currency=usd \
  --recurring[interval]=month \
  --lookup-key=studio_monthly \
  --metadata[tier]=studio \
  --metadata[interval]=monthly \
  --metadata[blots_per_unit]=100 \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Studio Monthly: $STUDIO_MONTHLY"

# Studio Annual: $0.80/unit
STUDIO_ANNUAL=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=80 \
  --currency=usd \
  --recurring[interval]=year \
  --lookup-key=studio_annual \
  --metadata[tier]=studio \
  --metadata[interval]=yearly \
  --metadata[blots_per_unit]=100 \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Studio Annual: $STUDIO_ANNUAL"

echo ""
echo "Creating one-time pack prices..."

# Top-Up Pack: $5 for 100 Blots
PACK_TOPUP=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=500 \
  --currency=usd \
  --lookup-key=pack_topup \
  --metadata[type]=blot_pack \
  --metadata[pack_id]=topup \
  --metadata[blots]=100 \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Pack Top-Up: $PACK_TOPUP"

# Boost Pack: $20 for 500 Blots
PACK_BOOST=$(stripe prices create \
  --product="$PRODUCT_ID" \
  --unit-amount=2000 \
  --currency=usd \
  --lookup-key=pack_boost \
  --metadata[type]=blot_pack \
  --metadata[pack_id]=boost \
  --metadata[blots]=500 \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "Pack Boost: $PACK_BOOST"

echo ""
echo "=========================================="
echo "STRIPE SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "Add these to your .env.local:"
echo ""
echo "# Stripe Price IDs"
echo "STRIPE_PRICE_CREATOR_MONTHLY=$CREATOR_MONTHLY"
echo "STRIPE_PRICE_CREATOR_ANNUAL=$CREATOR_ANNUAL"
echo "STRIPE_PRICE_STUDIO_MONTHLY=$STUDIO_MONTHLY"
echo "STRIPE_PRICE_STUDIO_ANNUAL=$STUDIO_ANNUAL"
echo "STRIPE_PRICE_TOPUP=$PACK_TOPUP"
echo "STRIPE_PRICE_BOOST=$PACK_BOOST"
echo ""
echo "=========================================="
