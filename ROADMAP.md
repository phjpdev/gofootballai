# Roadmap

Work planned for GO Football AI, roughly in priority order.

## Testing and CI

- [ ] Unit tests for pick settlement: home/away, handicap and over/under picks, including void and half-win handicap lines
- [ ] Unit tests for win-rate calculation, VIP expiry checks and analysis normalisation
- [ ] API tests for sign-up, login, roles and the records upload flow
- [ ] GitHub Actions workflow that lints, type-checks and builds both `frontend/` and `backend/` on every push

## Backend

- [ ] Replace the `CREATE TABLE IF NOT EXISTS` start-up code with versioned database migrations
- [ ] Tidy `backend/scripts/`: keep and document the useful maintenance scripts, remove one-off debug scripts
- [ ] Clearer API errors and retry hints when the HKJC feed is unreachable
- [ ] Document the Hong Kong proxy setup for servers outside Hong Kong

## Frontend

- [ ] Remove the leftover exploration scripts in `frontend/scripts/`
- [ ] Friendly empty and error states on the match list when HKJC data can't be loaded
- [ ] Finish English copy on every page and keep both message files in sync
- [ ] Accessibility pass: keyboard navigation, focus states and colour contrast on the match cards and modals

## Docs

- [ ] Screenshots of the main pages in the README
- [ ] Short guide for running the admin tools (records, featured matches, pick overrides)
