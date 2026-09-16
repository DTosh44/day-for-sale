# Day For Sale

A lightweight static MVP for **Day For Sale** — a public archive where people can claim a date, leave a message, and have it preserved against that day.

## Current concept

- Ordinary 2027 dates: **£1**
- Selected special dates: **auctioned from £1**
- One message per date
- Messages are published when the date arrives and retained in the archive
- Future years can be opened as the project grows
- Initial populated dates are clearly labelled as Day For Sale launch messages rather than fake customers

## Files

- `index.html` — site structure and content
- `styles.css` — responsive Day For Sale visual system
- `app.js` — interactive 2027 calendar, date states, search, preview claim flow and local watchlist
- `.github/workflows/pages.yml` — GitHub Pages deployment

## Development

No build step is required. Open `index.html` locally or serve the repository root with any static web server.

## Next integrations

Before public launch, the static preview needs a real backend for:

1. payments for £1 dates;
2. customer accounts / ownership records;
3. message submission and moderation;
4. auctions and bid history;
5. transactional email;
6. automated social publishing when each date arrives.

## Brand

Primary palette:

- White `#ffffff`
- Charcoal `#0b0d10`
- Yellow `#ffd42a`
- Blue `#0c6cff`
- Mint `#d9f8e7`

Parent-brand signature: **An A Brighter Internet project.**
