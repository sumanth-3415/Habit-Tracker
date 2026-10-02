# Daily Work Tracker

A mobile-friendly personal daily work tracker built with HTML, CSS and JavaScript.

## Features
- Add daily work items
- Tick items as completed
- Edit and delete today's items
- Category and priority
- Today's total/completed/pending/progress
- Previous-day history
- Excel export (.xlsx)
- CSV fallback if the Excel library is unavailable
- JSON backup and restore
- Dark mode
- Responsive mobile layout
- Local browser storage; no server/database required

## How to use
1. Extract the ZIP.
2. Open `index.html` in Chrome/Edge.
3. Add your work.
4. Tick the checkbox when finished.
5. Use **Export Excel** to save the complete work log.

## Important
The browser's localStorage is used as the live database. Clearing browser/site data can remove the live copy, so export an Excel file or JSON backup periodically.

For true multi-device syncing (same data on phone + laptop), a backend such as Supabase/Firebase would be needed.
