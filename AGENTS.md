# Buy A Day — repository instructions

## Read first

Before significant work, read `AGENTS.md`, `PROJECT.md`, `README.md` and inspect the relevant browser logic.

## Product boundary

Buy A Day is a date-ownership/message product model with ordinary £1 dates and auctioned special dates. The current implementation is intentionally non-transactional model mode.

Do not present demo purchases/bids as real transactions.

## Money and state

- Do not accept real money until shared server-side state, verified payment confirmation and server-controlled auction closing are implemented.
- Browser localStorage is demo state only.
- Do not trust client-side bid/purchase state for production.
- Special-date auction winner selection must be server-authoritative.
- Payment/provider credentials must never be committed.

## Product integrity

- One date = one featured message slot under the current model.
- Preserve permanent shareable date/archive behaviour.
- House/founding messages must remain clearly labelled as such.
- Moderation is required before public paid launch.

## Documentation is part of done

Update `PROJECT.md` whenever the stage, payment/backend readiness, auction logic, moderation state or current milestone materially changes.

## Handoff

Read `PROJECT.md` first. Update it last with the current milestone, blockers and next action.
