# Notes

## Bugs / doubts
- [ ] app.js: Sending malformed JSON returns 500, but it should return 400.
  - Why: express.json() throws a SyntaxError for invalid JSON, but the error handler always sends 500 and ignores the error's own status.
  - Error name (from terminal): SyntaxError: Expected property name or '}' in JSON at position 1

- [ ] taskService.js: getByStatus uses substring match instead of exact match.
  - Why: uses `t.status.includes(status)` instead of `t.status === status`.
  - How I discovered it: GET /tasks?status=do returned tasks with status "todo", even though "do" isn't a valid status.

- [ ] taskService.js: getPaginated has an off-by-one error.
  - Why: uses `offset = page * limit` instead of `offset = (page - 1) * limit`, so page=1 skips the first `limit` items instead of showing them.
  - How I discovered it: GET /tasks?page=1&limit=2 returned Task 3 and Task 4, not Test task and Task 2.

- [ ] taskService.js: getPaginated silently returns wrong results for invalid page/limit.
  - Why: no validation on page/limit - negative or zero values produce a negative offset, which Array.slice() interprets from the end, silently returning empty or wrong results instead of an error.
  - How I discovered it: GET /tasks?page=-1&limit=2 returned an empty array instead of an error, even though 4 tasks exist.

- [ ] taskService.js: completeTask overwrites priority to "medium".
  - Why: the completeTask function hardcodes `priority: 'medium'` when marking a task done, even if the task had a different priority (e.g. "high").
  - How I discovered it: created a task with priority "high", called PATCH /tasks/:id/complete, and the response showed priority changed to "medium" instead of staying "high".

- [ ] taskService.js / validators.js: PUT allows overwriting protected fields like id.
  - Why: validateUpdateTask doesn't restrict which fields are allowed, and taskService.update() spreads req.body directly onto the task (`{ ...tasks[index], ...fields }`), so a client can change a task's id, createdAt, or completedAt.
  - How I discovered it: sent PUT /tasks/:id with { "id": "hacked-id" } in the body, and the task's id changed to "hacked-id" in the response.

## What surprised me
-

## If I had more time
-