# Stripe Test Mode Price IDs

Generated: January 7, 2026

## Test Mode Prices (Semi-Aggressive Pricing - Corbin Method)

### Creator Tier
- **Monthly** (`price_1Sn7xERb0thGyayrkYCp79pZ`): $1.60/unit
  - Metadata: `tier=creator`, `interval=monthly`, `unit_rate=1.60`, `pricing_model=corbin_method`, `annual_discount=20%`
- **Annual** (`price_1Sn7xGRb0thGyayriuXKWTdY`): $1.28/unit (20% discount)
  - Metadata: `tier=creator`, `interval=yearly`, `unit_rate=1.28`, `pricing_model=corbin_method`, `annual_discount=20%`

### Studio Tier
- **Monthly** (`price_1Sn7xIRb0thGyayr3KNveEbD`): $1.00/unit
  - Metadata: `tier=studio`, `interval=monthly`, `unit_rate=1.00`, `pricing_model=corbin_method`, `annual_discount=20%`
- **Annual** (`price_1Sn7xKRb0thGyayrzLyzNrzR`): $0.80/unit (20% discount)
  - Metadata: `tier=studio`, `interval=yearly`, `unit_rate=0.80`, `pricing_model=corbin_method`, `annual_discount=20%`

## Environment Variables

Add these to your `.env.local` for testing:

```bash
# Stripe Test Mode Prices (Semi-Aggressive - Corbin Method)
STRIPE_PRICE_CREATOR_MONTHLY=price_1Sn7xERb0thGyayrkYCp79pZ
STRIPE_PRICE_CREATOR_ANNUAL=price_1Sn7xGRb0thGyayriuXKWTdY
STRIPE_PRICE_STUDIO_MONTHLY=price_1Sn7xIRb0thGyayr3KNveEbD
STRIPE_PRICE_STUDIO_ANNUAL=price_1Sn7xKRb0thGyayrzLyzNrzR
```

## Live Mode Prices

When ready to go live, use these Price IDs (already created):

```bash
# Stripe Live Mode Prices (Semi-Aggressive - Corbin Method)
STRIPE_PRICE_CREATOR_MONTHLY=price_1Sn7ZDRb0thGyayr2gQNFGlL
STRIPE_PRICE_CREATOR_ANNUAL=price_1Sn7ZDRb0thGyayrokJSnZFC
STRIPE_PRICE_STUDIO_MONTHLY=price_1Sn7ZDRb0thGyayrnIANu0F8
STRIPE_PRICE_STUDIO_ANNUAL=price_1Sn7ZDRb0thGyayrWRlIdXdl
```

**Note:** Live mode prices need metadata added manually in Stripe Dashboard (restricted API key permissions).

## Blot Quantities per Tier

### Creator Tier
- 500 Blots = $8/mo or $76.80/year
- 1,000 Blots = $16/mo or $153.60/year (Popular)
- 2,000 Blots = $32/mo or $307.20/year
- 3,000 Blots = $48/mo or $460.80/year
- 4,500 Blots = $72/mo or $691.20/year (Ceiling)

### Studio Tier
- 7,500 Blots = $75/mo or $720/year
- 10,000 Blots = $100/mo or $960/year (Popular)
- 15,000 Blots = $150/mo or $1,440/year

## Testing Checklist

- [ ] Update `.env.local` with test price IDs
- [ ] Test subscription checkout flow
- [ ] Test quantity selector dropdown
- [ ] Test Stripe webhook handling
- [ ] Verify blot allocation on subscription
- [ ] Test mid-cycle upgrades/downgrades
- [ ] Test annual vs monthly pricing
- [ ] Verify metadata in Stripe Dashboard

## When Ready for Production

1. Manually add metadata to live prices in Stripe Dashboard:
   - Nickname
   - tier, interval, unit_rate, pricing_model, annual_discount
2. Switch `.env.local` to use live price IDs
3. Archive old test/live prices no longer needed
