# Notes

## Bugs / doubts
- [ ] app.js: Sending malformed JSON returns 500, but it should return 400.
  - Why: express.json() throws a SyntaxError for invalid JSON, but the error handler always sends 500 and ignores the error's own status.
  - Error name (from terminal): SyntaxError: Expected property name or '}' in JSON at position 1

## What surprised me
-

## If I had more time
-