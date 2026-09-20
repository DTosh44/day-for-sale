# Buy A Day

A working product model for **Buy A Day** — pick a date, leave a message, become the featured message on that day, then remain in a permanent archive.

## Product model

- Ordinary dates: **£1**
- Selected special dates: **auctioned from £1**
- One message slot per date
- Dedicated **Today** page
- Permanent shareable page for every date
- Archive by year
- 2027–2030 calendar browsing
- Bid history and minimum-next-bid logic
- Five-minute anti-sniping extension for auction bids
- Initial quirky entries are explicitly house/founding messages, not fake customers

## Current model vs production

The UI and customer journeys work end-to-end in the browser.

For safety, this repository currently runs in **model mode**:
- demo purchases, messages and bids are stored in browser localStorage;
- no customer is charged;
- bids are not shared between different visitors.

Before accepting public money, wire the same flows to:
1. a shared database for claims, messages and bids;
2. Payhip/Stripe confirmation for £1 purchases;
3. Stripe payment-method authorisation for auctions;
4. server-side auction closing/winner selection;
5. moderation and transactional email.

The front end has been structured so those integrations can replace the local storage layer without redesigning the product.

## Routes

- `#/` — home
- `#/today` — today's page
- `#/dates/2027/1` — calendar
- `#/day/2027-06-15` — permanent date page
- `#/auctions` — special-date auctions
- `#/archive/2027` — year archive
- `#/about` — explanation and content rules

## Brand

Primary palette:
- White `#ffffff`
- Charcoal `#0b0d10`
- Yellow `#ffd42a`
- Blue `#0b6cff`
- Mint `#dff9eb`

Parent-brand signature: **An A Brighter Internet project.**
