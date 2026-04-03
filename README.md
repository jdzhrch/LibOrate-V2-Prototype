# LibOrate Prototype

This prototype now follows a stricter product split:

- `Zoom` only handles emotional check-ins
- `Web` handles meeting-linked check-in history and a web-only letter to self
- `/` shows both surfaces side by side so the sync can be reviewed live

## Routes

- `/` shared workspace
- `/zoom` Zoom-only surface
- `/web` Web-only surface

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run test:run
npm run lint
npm run build
```

## Prototype behavior

- Check-ins are bound to mock meeting info
- Check-ins created from Zoom appear immediately in Web history
- Letter to self exists only on the Web side
- Shared data is persisted locally in browser storage for demo purposes
