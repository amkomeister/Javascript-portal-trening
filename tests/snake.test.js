import { it, expect } from 'vitest';
import { createRuntime } from '../src/runtime/engine.js';
import { snakeCode } from '../src/content/snake.js';
it('allows entering the departing tail, but stops when entering the body', async () => {
  const r = await createRuntime();
  try {
    r.run(snakeCode(8));
    r.run('snake=[{x:5,y:6},{x:4,y:6},{x:4,y:5},{x:5,y:5}];direction={x:0,y:-1};food={x:8,y:6};');
    r.tick(160);
    expect(r.read('over')).toBe(false);
    r.run(
      'snake=[{x:5,y:6},{x:4,y:6},{x:4,y:5},{x:5,y:5},{x:6,y:5}];over=false;direction={x:0,y:-1};',
    );
    r.tick(160);
    expect(r.read('over')).toBe(true);
  } finally {
    r.dispose();
  }
});
it('prevents reverse/multiple turns, pauses, and restarts without duplicating the clock', async () => {
  const r = await createRuntime();
  try {
    r.run(snakeCode(8));
    r.event({ type: 'keydown', key: 'ArrowLeft', id: 'document' });
    expect(r.read('direction.x')).toBe(1);
    r.event({ type: 'keydown', key: 'ArrowUp', id: 'document' });
    r.event({ type: 'keydown', key: 'ArrowLeft', id: 'document' });
    r.tick(160);
    expect(r.read('[snake[0].x,snake[0].y]')).toEqual([5, 5]);
    r.event({ type: 'keydown', key: ' ', id: 'document' });
    r.tick(1000);
    expect(r.read('[snake[0].x,snake[0].y]')).toEqual([5, 5]);
    for (let i = 0; i < 3; i++) r.event({ type: 'keydown', key: 'r', id: 'document' });
    r.tick(160);
    expect(r.read('snake[0].x')).toBe(6);
    expect(r.read('score')).toBe(0);
  } finally {
    r.dispose();
  }
});
