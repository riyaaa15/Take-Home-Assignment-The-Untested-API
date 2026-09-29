# Bug Report

## Bug 1: Malformed JSON returns 500 instead of 400
- **Expected:** 400 Bad Request
- **Actual:** 500 Internal Server Error
- **How discovered:** Sent invalid JSON in a POST /tasks request body.
- **Why:** express.json() throws a SyntaxError with its own 400 status for invalid JSON, but the error handler in app.js ignores that status and always responds with 500.
- **Suggested fix:** In the error handler, use `res.status(err.status || 500)` instead of hardcoding 500.

## Bug 2: Status filter uses substring match instead of exact match — FIXED
- **Expected:** GET /tasks?status=do should return no tasks (since "do" is not a valid status)
- **Actual:** It returns tasks with status "todo"
- **How discovered:** Sent GET /tasks?status=do and got back tasks with status "todo".
- **Why:** getByStatus uses `t.status.includes(status)` instead of `t.status === status`.
- **Fix applied:** Changed `.includes(status)` to `=== status` for an exact match.

## Bug 3: Pagination has an off-by-one error
- **Expected:** page=1 should return the first `limit` tasks
- **Actual:** page=1 skips the first `limit` tasks
- **How discovered:** Created 4 tasks, sent GET /tasks?page=1&limit=2, got tasks 3 and 4 instead of 1 and 2.
- **Why:** getPaginated calculates `offset = page * limit` instead of `offset = (page - 1) * limit`.
- **Suggested fix:** Change the offset formula to `(page - 1) * limit`.

## Bug 4: Pagination silently returns wrong results for invalid page/limit
- **Expected:** A negative or zero page number should return an error (400)
- **Actual:** It silently returns an empty array
- **How discovered:** Sent GET /tasks?page=-1&limit=2 with 4 tasks existing, got back an empty array.
- **Why:** No validation on page/limit. A negative page produces a negative offset, and Array.slice() interprets negative indices from the end of the array, producing unexpected results instead of an error.
- **Suggested fix:** Validate that page and limit are positive integers before using them, and return 400 if not.

## Bug 5: completeTask overwrote priority to "medium" — FIXED
- **Expected:** Completing a task should not change its priority
- **Actual:** Completing a task always set priority to "medium", even if it was "high" or "low"
- **How discovered:** Created a task with priority "high", called PATCH /tasks/:id/complete, and the response showed priority "medium".
- **Why:** completeTask hardcoded `priority: 'medium'` in the updated task object.
- **Fix applied:** Removed the hardcoded `priority: 'medium'` line so the existing priority is preserved.

## Bug 6: PUT allows overwriting protected fields like id
- **Expected:** A client should not be able to change a task's id, createdAt, or completedAt via PUT
- **Actual:** Sending `{ "id": "hacked-id" }` in a PUT request body changes the task's id
- **How discovered:** Sent PUT /tasks/:id with `{ "id": "hacked-id" }`, and the response showed the task's id had changed.
- **Why:** validateUpdateTask doesn't restrict which fields are allowed, and taskService.update() spreads the entire request body onto the existing task (`{ ...tasks[index], ...fields }`), so any field can be overwritten.
- **Suggested fix:** Whitelist only the fields allowed to be updated (title, description, status, priority, dueDate) before merging.