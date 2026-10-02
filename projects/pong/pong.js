/*
 * Browser port of pong.py. The classes and rules match the Pygame version:
 * Paddle, Ball, ComputerPlayer, Scoreboard and Game. Drawing uses <canvas>
 * instead of Pygame, and touch/mouse dragging is added for phones.
 */

export const WIDTH = 800;
export const HEIGHT = 500;
export const WINNING_SCORE = 7;

const BACKGROUND = '#111827';
const FOREGROUND = '#f3f4f6';
const MUTED = '#6b7280';
const ACCENT = '#60a5fa';
const FONT = 'Inter, ui-sans-serif, system-ui, sans-serif';

const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
const radians = (degrees) => (degrees * Math.PI) / 180;

/** Axis-aligned rectangle with the same helpers as pygame.Rect. */
export class Rect {
  constructor(x, y, width, height) {
    Object.assign(this, { x, y, width, height });
  }
  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
  get centerx() { return this.x + this.width / 2; }
  get centery() { return this.y + this.height / 2; }
  colliderect(other) {
    return this.left < other.right && this.right > other.left && this.top < other.bottom && this.bottom > other.top;
  }
}

export class Paddle {
  static WIDTH = 12;
  static HEIGHT = 90;
  static SPEED = 420; // pixels per second

  constructor(x) {
    this.rect = new Rect(x - Paddle.WIDTH / 2, 0, Paddle.WIDTH, Paddle.HEIGHT);
    this.reset();
  }

  /** Move up (-1), down (1) or not at all (0) for dt seconds. */
  move(direction, dt) {
    this.rect.y = clamp(this.rect.y + direction * Paddle.SPEED * dt, 0, HEIGHT - Paddle.HEIGHT);
  }

  reset() {
    this.rect.y = HEIGHT / 2 - Paddle.HEIGHT / 2;
  }
}

export class Ball {
  static SIZE = 12;
  static START_SPEED = 330;
  static SPEED_UP = 1.06;
  static MAX_SPEED = 900;
  static MAX_BOUNCE_ANGLE = radians(55);

  constructor(random = Math.random) {
    this.random = random;
    this.rect = new Rect(0, 0, Ball.SIZE, Ball.SIZE);
    this.reset(1);
  }

  /** Centre the ball and aim it towards the given side (-1 left, 1 right). */
  reset(direction) {
    this.rect.x = WIDTH / 2 - Ball.SIZE / 2;
    this.rect.y = HEIGHT / 2 - Ball.SIZE / 2;
    const angle = (this.random() * 2 - 1) * radians(30);
    this.speed = Ball.START_SPEED;
    this.vx = direction * this.speed * Math.cos(angle);
    this.vy = this.speed * Math.sin(angle);
  }

  /** Move the ball, in small steps so it cannot pass through a paddle. */
  update(dt, paddles) {
    const distance = Math.hypot(this.vx, this.vy) * dt;
    const steps = Math.max(1, Math.ceil(distance / (Ball.SIZE / 2)));
    for (let i = 0; i < steps; i += 1) {
      this.rect.x += (this.vx * dt) / steps;
      this.rect.y += (this.vy * dt) / steps;
      this.#bounceOffWalls();
      for (const paddle of paddles) {
        if (this.rect.colliderect(paddle.rect) && this.#movingTowards(paddle)) this.bounceOff(paddle);
      }
    }
  }

  /** Send the ball back. Hitting nearer a paddle's end gives a steeper angle. */
  bounceOff(paddle) {
    const offset = clamp((this.rect.centery - paddle.rect.centery) / (Paddle.HEIGHT / 2), -1, 1);
    const angle = offset * Ball.MAX_BOUNCE_ANGLE;
    this.speed = Math.min(this.speed * Ball.SPEED_UP, Ball.MAX_SPEED);
    const direction = paddle.rect.centerx < WIDTH / 2 ? 1 : -1;
    this.vx = direction * this.speed * Math.cos(angle);
    this.vy = this.speed * Math.sin(angle);
    // Move the ball out of the paddle so it is not hit twice.
    this.rect.x = direction === 1 ? paddle.rect.right : paddle.rect.left - Ball.SIZE;
  }

  #bounceOffWalls() {
    if (this.rect.y <= 0) {
      this.rect.y = 0;
      this.vy = Math.abs(this.vy);
    } else if (this.rect.bottom >= HEIGHT) {
      this.rect.y = HEIGHT - Ball.SIZE;
      this.vy = -Math.abs(this.vy);
    }
  }

  #movingTowards(paddle) {
    return paddle.rect.centerx < WIDTH / 2 ? this.vx < 0 : this.vx > 0;
  }
}

/** Moves a paddle towards the ball, with a dead zone so it can be beaten. */
export class ComputerPlayer {
  static DEAD_ZONE = 18;

  constructor(paddle) {
    this.paddle = paddle;
  }

  direction(ball) {
    const comingTowards = (ball.vx > 0) === (this.paddle.rect.centerx > WIDTH / 2);
    const target = comingTowards ? ball.rect.centery : HEIGHT / 2;
    const difference = target - this.paddle.rect.centery;
    if (Math.abs(difference) < ComputerPlayer.DEAD_ZONE) return 0;
    return difference > 0 ? 1 : -1;
  }
}

export class Scoreboard {
  constructor(winningScore = WINNING_SCORE) {
    this.winningScore = winningScore;
    this.reset();
  }

  reset() {
    this.left = 0;
    this.right = 0;
  }

  pointTo(side) {
    if (side === 'left') this.left += 1;
    else this.right += 1;
  }

  get winner() {
    if (this.left >= this.winningScore) return 'left';
    if (this.right >= this.winningScore) return 'right';
    return null;
  }
}

/** Runs the menu, the match and the game-over screen. */
export class Game {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.left = new Paddle(30);
    this.right = new Paddle(WIDTH - 30);
    this.ball = new Ball(random);
    this.scoreboard = new Scoreboard();
    this.computer = new ComputerPlayer(this.right);
    this.players = 1;
    this.state = 'menu'; // menu, serve, playing, paused, game_over
    this.onChange = () => {};
  }

  /** Handle a key press. Returns true if the game used the key. */
  handleKey(key) {
    if (key === 'Escape' && this.state !== 'menu') return this.#setState('menu');
    if (this.state === 'menu' && (key === '1' || key === '2')) {
      this.startMatch(Number(key));
      return true;
    }
    if (key === ' ' && this.state === 'serve') return this.#setState('playing');
    if (key === ' ' && this.state === 'game_over') {
      this.startMatch(this.players);
      return true;
    }
    if ((key === 'p' || key === 'P') && (this.state === 'playing' || this.state === 'paused')) {
      return this.#setState(this.state === 'playing' ? 'paused' : 'playing');
    }
    return false;
  }

  startMatch(players) {
    this.players = players;
    this.scoreboard.reset();
    this.left.reset();
    this.right.reset();
    this.ball.reset(this.random() < 0.5 ? -1 : 1);
    this.#setState('serve');
  }

  /**
   * Advance the game by dt seconds. input.left / input.right are -1, 0 or 1
   * (up, none, down) from the keyboard or touch.
   */
  update(dt, input) {
    if (this.state !== 'playing' && this.state !== 'serve') return;
    this.left.move(input.left, dt);
    this.right.move(this.players === 2 ? input.right : this.computer.direction(this.ball), dt);
    if (this.state !== 'playing') return;

    this.ball.update(dt, [this.left, this.right]);
    if (this.ball.rect.right < 0) this.score('right');
    else if (this.ball.rect.left > WIDTH) this.score('left');
  }

  score(side) {
    this.scoreboard.pointTo(side);
    if (this.scoreboard.winner) {
      this.#setState('game_over');
    } else {
      // Serve towards the player who conceded the point.
      this.ball.reset(side === 'right' ? -1 : 1);
      this.#setState('serve');
    }
  }

  #setState(state) {
    this.state = state;
    this.onChange(state);
    return true;
  }

  draw(ctx, { touch = false } = {}) {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.state !== 'menu' && this.state !== 'game_over') {
      ctx.fillStyle = MUTED;
      for (let y = 10; y < HEIGHT; y += 30) ctx.fillRect(WIDTH / 2 - 2, y, 4, 16);
    }
    ctx.fillStyle = FOREGROUND;
    for (const paddle of [this.left, this.right]) {
      roundRect(ctx, paddle.rect, 4);
    }
    ctx.font = `600 56px ${FONT}`;
    ctx.fillText(String(this.scoreboard.left), WIDTH / 4, 50);
    ctx.fillText(String(this.scoreboard.right), (3 * WIDTH) / 4, 50);

    // Phones show the court much smaller, so hint text is drawn larger there.
    const small = touch ? 34 : 20;
    if (this.state === 'menu') {
      text(ctx, 'PONG', 64, HEIGHT / 2 - 60, ACCENT, 700);
      text(ctx, touch ? 'Choose 1 or 2 players below' : 'Press 1 for one player, 2 for two players', touch ? 34 : 22, HEIGHT / 2 + 15);
      text(ctx, touch ? 'Drag on your side to move' : 'W/S moves left paddle · ↑/↓ moves right · P pauses', touch ? 30 : 18, HEIGHT / 2 + 65, MUTED);
    } else if (this.state === 'game_over') {
      const winner = this.scoreboard.winner === 'left' ? 'Left' : 'Right';
      text(ctx, `${winner} player wins!`, 52, HEIGHT / 2 - 30, ACCENT, 700);
      text(ctx, touch ? 'Tap to play again' : 'Space to play again · Esc for menu', touch ? 34 : 22, HEIGHT / 2 + 35);
    } else {
      ctx.fillStyle = ACCENT;
      roundRect(ctx, this.ball.rect, 3);
      if (this.state === 'serve') text(ctx, touch ? 'Tap to serve' : 'Press Space to serve', small, HEIGHT - 45, MUTED);
      if (this.state === 'paused') text(ctx, touch ? 'Paused · tap to resume' : 'Paused · P to resume', touch ? 38 : 26, HEIGHT / 2, ACCENT, 600);
    }
  }
}

function text(ctx, value, size, y, colour = FOREGROUND, weight = 500) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = colour;
  ctx.fillText(value, WIDTH / 2, y);
}

function roundRect(ctx, rect, radius) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
  else ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.fill();
}

/** Connect a Game to a canvas, the keyboard and touch input, and start the loop. */
export function startGame(canvas, controls = {}) {
  const game = new Game();
  const ctx = canvas.getContext('2d');
  const keys = new Set();
  const touchTargets = { left: null, right: null };
  let touchMode = window.matchMedia('(pointer: coarse)').matches;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WIDTH * ratio;
    canvas.height = HEIGHT * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const gameKeys = new Set(['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown', ' ', 'p', 'P', '1', '2', 'Escape']);
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || !gameKeys.has(event.key)) return;
    // Only take over keys like Space and arrows while a match is on screen, so they still scroll the page otherwise.
    const inMatch = game.state !== 'menu' || document.activeElement === canvas;
    if (!inMatch && !['1', '2'].includes(event.key)) return;
    if (inMatch) event.preventDefault();
    keys.add(event.key.toLowerCase());
    touchMode = false;
    game.handleKey(event.key);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => {
    keys.clear();
    if (game.state === 'playing') game.handleKey('p');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state === 'playing') game.handleKey('p');
  });

  // Touch and mouse: drag on your half of the court to move that paddle; tap to serve, resume or restart.
  function courtPoint(event) {
    const box = canvas.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * WIDTH, y: ((event.clientY - box.top) / box.height) * HEIGHT };
  }
  function side(point) {
    return game.players === 2 && point.x > WIDTH / 2 ? 'right' : 'left';
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') touchMode = true;
    canvas.setPointerCapture(event.pointerId);
    const point = courtPoint(event);
    touchTargets[side(point)] = point.y;
    if (game.state === 'serve' || game.state === 'paused') game.handleKey(game.state === 'serve' ? ' ' : 'p');
    else if (game.state === 'game_over') game.handleKey(' ');
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!canvas.hasPointerCapture(event.pointerId)) return;
    const point = courtPoint(event);
    touchTargets[side(point)] = point.y;
  });
  const release = () => { touchTargets.left = null; touchTargets.right = null; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  function directionTowards(paddle, target) {
    if (target === null) return 0;
    const difference = target - paddle.rect.centery;
    return Math.abs(difference) < 6 ? 0 : Math.sign(difference);
  }

  function input() {
    const keyboardLeft = (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0);
    const keyboardRight = (keys.has('arrowdown') ? 1 : 0) - (keys.has('arrowup') ? 1 : 0);
    return {
      left: keyboardLeft || directionTowards(game.left, touchTargets.left),
      right: keyboardRight || directionTowards(game.right, touchTargets.right),
    };
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    game.update(dt, input());
    game.draw(ctx, { touch: touchMode });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  game.onChange = (state) => controls.onStateChange?.(state);
  return game;
}
