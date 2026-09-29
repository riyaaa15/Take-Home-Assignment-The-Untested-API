const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('taskService.create', () => {
  it('creates a task with default values', () => {
    const task = taskService.create({ title: 'Test' });
    expect(task.title).toBe('Test');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.id).toBeDefined();
  });
});

describe('taskService.completeTask', () => {
  it('does not change priority when completing a task', () => {
    const task = taskService.create({ title: 'Test', priority: 'high' });
    const completed = taskService.completeTask(task.id);
    expect(completed.priority).toBe('high');
    expect(completed.status).toBe('done');
  });

  it('returns null for a non-existent task', () => {
    const result = taskService.completeTask('fake-id');
    expect(result).toBeNull();
  });
});

describe('taskService.assignTask', () => {
  it('sets the assignee on a task', () => {
    const task = taskService.create({ title: 'Test' });
    const assigned = taskService.assignTask(task.id, 'Riya');
    expect(assigned.assignee).toBe('Riya');
  });
});

describe('taskService.remove', () => {
  it('removes an existing task and returns true', () => {
    const task = taskService.create({ title: 'Test' });
    const result = taskService.remove(task.id);
    expect(result).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });
});