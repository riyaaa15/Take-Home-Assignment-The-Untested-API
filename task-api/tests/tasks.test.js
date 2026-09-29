const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('POST /tasks', () => {
  it('creates a task with valid data', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Write tests', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.priority).toBe('high');
    expect(res.body.status).toBe('todo');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ priority: 'high' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when status is invalid', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test', status: 'invalid_status' });

    expect(res.status).toBe(400);
  });
});

describe('GET /tasks', () => {
  it('returns empty array when no tasks exist', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });

    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

describe('PUT /tasks/:id', () => {
  it('updates an existing task', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Old title' });
    const id = createRes.body.id;

    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: 'New title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New title');
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/tasks/fake-id-123')
      .send({ title: 'New title' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deletes an existing task', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'To delete' });
    const id = createRes.body.id;

    const res = await request(app).delete(`/tasks/${id}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get('/tasks');
    expect(getRes.body.length).toBe(0);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app).delete('/tasks/fake-id-123');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /tasks/:id/complete', () => {
  it('marks a task as done and keeps priority unchanged', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .send({ title: 'Task', priority: 'high' });
    const id = createRes.body.id;

    const res = await request(app).patch(`/tasks/${id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.priority).toBe('high');
    expect(res.body.completedAt).not.toBeNull();
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app).patch('/tasks/fake-id-123/complete');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /tasks/:id/assign', () => {
  it('assigns a task to someone', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task' });
    const id = createRes.body.id;

    const res = await request(app)
      .patch(`/tasks/${id}/assign`)
      .send({ assignee: 'Riya' });

    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('Riya');
  });

  it('returns 400 when assignee is empty', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task' });
    const id = createRes.body.id;

    const res = await request(app)
      .patch(`/tasks/${id}/assign`)
      .send({ assignee: '' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .patch('/tasks/fake-id-123/assign')
      .send({ assignee: 'Riya' });

    expect(res.status).toBe(404);
  });
});

describe('GET /tasks?status=', () => {
  it('filters tasks by status', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1', status: 'todo' });
    await request(app).post('/tasks').send({ title: 'Task 2', status: 'done' });

    const res = await request(app).get('/tasks?status=done');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('done');
  });
});

describe('GET /tasks?page=&limit=', () => {
  it('returns paginated results', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    await request(app).post('/tasks').send({ title: 'Task 3' });

    const res = await request(app).get('/tasks?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(2);
  });
});

describe('GET /tasks/stats', () => {
  it('returns counts by status and overdue count', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1', status: 'todo' });
    await request(app).post('/tasks').send({ title: 'Task 2', status: 'done' });

    const res = await request(app).get('/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body.todo).toBe(1);
    expect(res.body.done).toBe(1);
    expect(res.body.overdue).toBeDefined();
  });
});

describe('malformed JSON', () => {
  it('returns an error status for invalid JSON body', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});