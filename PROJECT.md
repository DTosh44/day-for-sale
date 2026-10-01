# Buy A Day — project status

Last reviewed: 1 October 2026

## Purpose

Let someone claim a calendar date, leave a featured message on it, and preserve that message in a permanent archive.

## Current state

The browser product model works end-to-end for browsing dates, demo purchases/messages and special-date auctions.

It remains **model mode**. Purchases and bids are stored locally in the browser, no real customer is charged and different visitors do not share state.

## What works

- Ordinary £1 date concept.
- Auctioned special dates.
- Today page.
- Permanent date pages.
- Year archive.
- 2027–2030 browsing.
- Bid history/minimum-next-bid logic.
- Five-minute anti-sniping model.
- Clearly labelled founding/house messages.

## Live / deployment status

No production transactional launch is evidenced.

## Current milestone

**Paused. If resumed, replace browser-local demo state with a production-safe shared backend and verified payment/auction flow.**

## Key decisions

- Ordinary dates cost £1.
- Selected special dates use auctions starting at £1.
- One featured message slot per date.
- Historic date pages remain permanently shareable.

## Current blockers / dependencies

- Shared database/state.
- Payhip/Stripe payment confirmation for ordinary purchases.
- Stripe payment-method authorisation for auctions.
- Server-side auction closing and winner selection.
- Moderation.
- Transactional email.

## Next actions if resumed

1. Choose the shared backend.
2. Model date claims, messages, bids and auction state server-side.
3. Add verified payment confirmation.
4. Implement server-authoritative auction closing.
5. Add moderation and transactional email.
6. Test concurrency and payment failure/retry cases.

## Deferred / out of scope

Do not add extra marketplace/social features before the core paid date-claiming flow is production-safe.

## Handoff notes

This project is intentionally paused. Preserve the working model and do not convert local demo state into real commerce without the backend/payment controls above.
