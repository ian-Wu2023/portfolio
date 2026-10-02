// Mirrors projects/pong/test_pong.py for the browser port.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WIDTH, HEIGHT, WINNING_SCORE, Paddle, Ball, ComputerPlayer, Scoreboard, Game,
} from '../projects/pong/pong.js';

const still = { left: 0, right: 0 };
const seeded = () => {
  let seed = 7;
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
};

test('paddle moves and stays inside the court', () => {
  const paddle = new Paddle(30);
  const start = paddle.rect.y;
  paddle.move(1, 0.1);
  assert.ok(paddle.rect.y > start);
  paddle.move(-1, 10);
  assert.equal(paddle.rect.top, 0);
  paddle.move(1, 10);
  assert.equal(paddle.rect.bottom, HEIGHT);
});

test('ball bounces off the top wall', () => {
  const ball = new Ball(seeded());
  Object.assign(ball.rect, { x: WIDTH / 2, y: 5 });
  Object.assign(ball, { vx: 0, vy: -300 });
  ball.update(0.1, []);
  assert.ok(ball.vy > 0);
  assert.ok(ball.rect.top >= 0);
});

test('ball bounces off a paddle and speeds up', () => {
  const paddle = new Paddle(30);
  const ball = new Ball(seeded());
  Object.assign(ball.rect, { x: paddle.rect.right + 5, y: paddle.rect.centery - Ball.SIZE / 2 });
  Object.assign(ball, { vx: -400, vy: 0, speed: 400 });
  ball.update(0.05, [paddle]);
  assert.ok(ball.vx > 0);
  assert.ok(ball.speed > 400);
  assert.ok(ball.rect.left >= paddle.rect.right);
});

test('hitting the paddle edge gives a steeper angle', () => {
  const paddle = new Paddle(30);
  const ball = new Ball(seeded());
  ball.rect.y = paddle.rect.top - Ball.SIZE / 2;
  ball.speed = 400;
  ball.bounceOff(paddle);
  assert.ok(ball.vy < -200);
});

test('a fast ball does not pass through a paddle', () => {
  const paddle = new Paddle(WIDTH - 30);
  const ball = new Ball(seeded());
  Object.assign(ball.rect, { x: paddle.rect.left - 40, y: paddle.rect.centery - Ball.SIZE / 2 });
  Object.assign(ball, { vx: Ball.MAX_SPEED, vy: 0 });
  ball.update(1 / 30, [paddle]);
  assert.ok(ball.vx < 0);
});

test('first to the winning score wins', () => {
  const board = new Scoreboard(3);
  board.pointTo('left');
  board.pointTo('left');
  assert.equal(board.winner, null);
  board.pointTo('left');
  assert.equal(board.winner, 'left');
});

test('computer player follows the ball, then returns to the middle', () => {
  const paddle = new Paddle(WIDTH - 30);
  const ball = new Ball(seeded());
  ball.vx = 300;
  ball.rect.y = 20;
  assert.equal(new ComputerPlayer(paddle).direction(ball), -1);
  paddle.move(1, 10);
  ball.vx = -300;
  assert.equal(new ComputerPlayer(paddle).direction(ball), -1);
});

test('menu starts a match, space serves, P pauses', () => {
  const game = new Game({ random: seeded() });
  game.handleKey('1');
  assert.equal(game.state, 'serve');
  game.handleKey(' ');
  assert.equal(game.state, 'playing');
  game.handleKey('p');
  assert.equal(game.state, 'paused');
});

test('ball leaving the court scores and serves towards the player who conceded', () => {
  const game = new Game({ random: seeded() });
  game.handleKey('2');
  game.handleKey(' ');
  game.ball.rect.x = -50;
  Object.assign(game.ball, { vx: -300, vy: 0 });
  game.update(1 / 60, still);
  assert.deepEqual([game.scoreboard.left, game.scoreboard.right], [0, 1]);
  assert.equal(game.state, 'serve');
  assert.ok(game.ball.vx < 0);
});

test('a simulated match runs to completion', () => {
  const game = new Game({ random: seeded() });
  game.handleKey('1');
  const leftAi = new ComputerPlayer(game.left);
  let frames = 0;
  while (game.state !== 'game_over' && frames < 60 * 60 * 10) {
    if (game.state === 'serve') game.handleKey(' ');
    game.update(1 / 60, { left: leftAi.direction(game.ball), right: 0 });
    frames += 1;
  }
  assert.equal(game.state, 'game_over');
  assert.ok([game.scoreboard.left, game.scoreboard.right].includes(WINNING_SCORE));
});
