# Pong Game (Pygame)

Classic Pong in Python with [Pygame](https://www.pygame.org): one player
against the computer, or two players on one keyboard. First to 7 wins.

**Play in the browser:** https://ianwu.co.uk/projects/pong/ (a JavaScript port
of this code with the same classes and rules).

## Design

| Class | Responsibility |
| --- | --- |
| `Paddle` | Moves at a fixed speed and stays inside the court |
| `Ball` | Moves in small steps each frame, bounces off walls and paddles, speeds up after each hit |
| `ComputerPlayer` | Follows the ball when it approaches, with a dead zone so it can be beaten |
| `Scoreboard` | Counts points and decides the winner |
| `Game` | Input, game states (menu, serve, playing, paused, game over), drawing and the main loop |

- **Collision detection** uses rectangle overlap (`pygame.Rect.colliderect`).
  The ball moves in steps no larger than half its size, so even at top speed
  it cannot pass through a paddle between frames.
- **Bounce angle** depends on where the ball hits the paddle (up to 55°).
- **Movement is frame-rate independent**: speeds are in pixels per second and
  multiplied by the time since the last frame.

## Run it

Python 3.10+:

```sh
python -m pip install -r requirements.txt
python pong.py
```

| Key | Action |
| --- | --- |
| `1` / `2` | One player / two players |
| `W` / `S` | Move the left paddle |
| `↑` / `↓` | Move the right paddle (two players) |
| `Space` | Serve, or play again |
| `P` | Pause |
| `Esc` | Menu, or quit from the menu |

## Tests

```sh
python -m unittest test_pong -v
```

The tests run without opening a window. They cover paddle limits, wall and
paddle bounces, fast balls not tunnelling through paddles, scoring and
serving, and a full computer-vs-computer match. The browser port has matching
tests in `tests/pong.test.mjs` at the repository root (`npm test`).
