"""Pong, built with Pygame.

Controls
    1 / 2        choose one player (against the computer) or two players
    W / S        move the left paddle
    Up / Down    move the right paddle (two-player mode)
    Space        serve, or play again after a game ends
    P            pause
    Esc          back to the menu, or quit from the menu

The game is split into small classes (Paddle, Ball, ComputerPlayer, Scoreboard
and Game) so that each part can be tested and changed on its own.
"""

import math
import random

import pygame

WIDTH, HEIGHT = 800, 500
FPS = 60
WINNING_SCORE = 7

BACKGROUND = (17, 24, 39)
FOREGROUND = (243, 244, 246)
MUTED = (107, 114, 128)
ACCENT = (96, 165, 250)


class Paddle:
    """A player's paddle. It moves vertically and stays inside the court."""

    WIDTH = 12
    HEIGHT = 90
    SPEED = 420  # pixels per second

    def __init__(self, x):
        self.rect = pygame.Rect(0, 0, self.WIDTH, self.HEIGHT)
        self.rect.center = (x, HEIGHT // 2)
        self.y = float(self.rect.y)

    def move(self, direction, dt):
        """Move up (-1), down (1) or not at all (0) for dt seconds."""
        self.y += direction * self.SPEED * dt
        self.y = max(0.0, min(self.y, HEIGHT - self.HEIGHT))
        self.rect.y = round(self.y)

    def reset(self):
        self.rect.centery = HEIGHT // 2
        self.y = float(self.rect.y)

    def draw(self, surface):
        pygame.draw.rect(surface, FOREGROUND, self.rect, border_radius=4)


class Ball:
    """The ball. It bounces off the top and bottom walls and off paddles."""

    SIZE = 12
    START_SPEED = 330  # pixels per second
    SPEED_UP = 1.06  # multiplier after each paddle hit
    MAX_SPEED = 900
    MAX_BOUNCE_ANGLE = math.radians(55)

    def __init__(self, rng=None):
        self.rng = rng or random.Random()
        self.rect = pygame.Rect(0, 0, self.SIZE, self.SIZE)
        self.reset(direction=1)

    def reset(self, direction):
        """Centre the ball and aim it towards the given side (-1 left, 1 right)."""
        self.x = WIDTH / 2 - self.SIZE / 2
        self.y = HEIGHT / 2 - self.SIZE / 2
        angle = self.rng.uniform(-math.radians(30), math.radians(30))
        self.speed = self.START_SPEED
        self.vx = direction * self.speed * math.cos(angle)
        self.vy = self.speed * math.sin(angle)
        self._sync_rect()

    def update(self, dt, paddles):
        """Move the ball, in small steps so it cannot pass through a paddle."""
        distance = math.hypot(self.vx, self.vy) * dt
        steps = max(1, math.ceil(distance / (self.SIZE / 2)))
        for _ in range(steps):
            self.x += self.vx * dt / steps
            self.y += self.vy * dt / steps
            self._bounce_off_walls()
            self._sync_rect()
            for paddle in paddles:
                if self.rect.colliderect(paddle.rect) and self._moving_towards(paddle):
                    self.bounce_off(paddle)

    def bounce_off(self, paddle):
        """Send the ball back. Hitting nearer a paddle's end gives a steeper angle."""
        offset = (self.rect.centery - paddle.rect.centery) / (paddle.HEIGHT / 2)
        offset = max(-1.0, min(offset, 1.0))
        angle = offset * self.MAX_BOUNCE_ANGLE
        self.speed = min(self.speed * self.SPEED_UP, self.MAX_SPEED)
        direction = 1 if paddle.rect.centerx < WIDTH / 2 else -1
        self.vx = direction * self.speed * math.cos(angle)
        self.vy = self.speed * math.sin(angle)
        # Move the ball out of the paddle so it is not hit twice.
        if direction == 1:
            self.x = paddle.rect.right
        else:
            self.x = paddle.rect.left - self.SIZE
        self._sync_rect()

    def _bounce_off_walls(self):
        if self.y <= 0:
            self.y = 0
            self.vy = abs(self.vy)
        elif self.y + self.SIZE >= HEIGHT:
            self.y = HEIGHT - self.SIZE
            self.vy = -abs(self.vy)

    def _moving_towards(self, paddle):
        return (self.vx < 0) if paddle.rect.centerx < WIDTH / 2 else (self.vx > 0)

    def _sync_rect(self):
        self.rect.x = round(self.x)
        self.rect.y = round(self.y)

    def draw(self, surface):
        pygame.draw.rect(surface, ACCENT, self.rect, border_radius=3)


class ComputerPlayer:
    """Moves a paddle towards the ball, with a dead zone so it can be beaten."""

    DEAD_ZONE = 18

    def __init__(self, paddle):
        self.paddle = paddle

    def direction(self, ball):
        # Only follow the ball when it is coming towards this paddle.
        coming_towards = (ball.vx > 0) == (self.paddle.rect.centerx > WIDTH / 2)
        target = ball.rect.centery if coming_towards else HEIGHT / 2
        difference = target - self.paddle.rect.centery
        if abs(difference) < self.DEAD_ZONE:
            return 0
        return 1 if difference > 0 else -1


class Scoreboard:
    """Keeps the score and decides the winner."""

    def __init__(self, winning_score=WINNING_SCORE):
        self.winning_score = winning_score
        self.reset()

    def reset(self):
        self.left = 0
        self.right = 0

    def point_to(self, side):
        if side == "left":
            self.left += 1
        else:
            self.right += 1

    @property
    def winner(self):
        if self.left >= self.winning_score:
            return "left"
        if self.right >= self.winning_score:
            return "right"
        return None


class Game:
    """Runs the menu, the match and the game-over screen."""

    def __init__(self, seed=None):
        pygame.init()
        pygame.display.set_caption("Pong")
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.large_font = pygame.font.Font(None, 72)
        self.font = pygame.font.Font(None, 30)

        self.left = Paddle(30)
        self.right = Paddle(WIDTH - 30)
        self.ball = Ball(random.Random(seed))
        self.scoreboard = Scoreboard()
        self.computer = ComputerPlayer(self.right)
        self.players = 1
        self.state = "menu"  # menu, serve, playing, paused, game_over
        self.serve_direction = 1
        self.running = True

    # ---- input ----

    def handle_event(self, event):
        if event.type == pygame.QUIT:
            self.running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                if self.state == "menu":
                    self.running = False
                else:
                    self.state = "menu"
            elif self.state == "menu" and event.key in (pygame.K_1, pygame.K_2):
                self.players = 1 if event.key == pygame.K_1 else 2
                self.start_match()
            elif event.key == pygame.K_SPACE and self.state == "serve":
                self.state = "playing"
            elif event.key == pygame.K_SPACE and self.state == "game_over":
                self.start_match()
            elif event.key == pygame.K_p and self.state in ("playing", "paused"):
                self.state = "paused" if self.state == "playing" else "playing"

    def start_match(self):
        self.scoreboard.reset()
        self.left.reset()
        self.right.reset()
        self.serve_direction = random.choice((-1, 1))
        self.ball.reset(self.serve_direction)
        self.state = "serve"

    # ---- update ----

    def update(self, dt, keys):
        if self.state not in ("playing", "serve"):
            return
        self.left.move(keys[pygame.K_s] - keys[pygame.K_w], dt)
        if self.players == 2:
            self.right.move(keys[pygame.K_DOWN] - keys[pygame.K_UP], dt)
        else:
            self.right.move(self.computer.direction(self.ball), dt)
        if self.state != "playing":
            return

        self.ball.update(dt, (self.left, self.right))
        if self.ball.rect.right < 0:
            self.score("right")
        elif self.ball.rect.left > WIDTH:
            self.score("left")

    def score(self, side):
        self.scoreboard.point_to(side)
        if self.scoreboard.winner:
            self.state = "game_over"
        else:
            # Serve towards the player who conceded the point.
            self.serve_direction = -1 if side == "right" else 1
            self.ball.reset(self.serve_direction)
            self.state = "serve"

    # ---- drawing ----

    def draw(self):
        self.screen.fill(BACKGROUND)
        if self.state not in ("menu", "game_over"):
            for y in range(10, HEIGHT, 30):
                pygame.draw.rect(self.screen, MUTED, (WIDTH // 2 - 2, y, 4, 16))
        self.left.draw(self.screen)
        self.right.draw(self.screen)
        self._text(str(self.scoreboard.left), self.large_font, (WIDTH // 4, 50))
        self._text(str(self.scoreboard.right), self.large_font, (3 * WIDTH // 4, 50))

        if self.state == "menu":
            self._text("PONG", self.large_font, (WIDTH // 2, HEIGHT // 2 - 60), ACCENT)
            self._text("Press 1 for one player, 2 for two players", self.font, (WIDTH // 2, HEIGHT // 2 + 10))
            self._text("W/S moves left paddle · Up/Down moves right · P pauses", self.font,
                       (WIDTH // 2, HEIGHT // 2 + 50), MUTED)
        elif self.state == "game_over":
            winner = "Left" if self.scoreboard.winner == "left" else "Right"
            self._text(f"{winner} player wins!", self.large_font, (WIDTH // 2, HEIGHT // 2 - 30), ACCENT)
            self._text("Space to play again · Esc for menu", self.font, (WIDTH // 2, HEIGHT // 2 + 30))
        else:
            self.ball.draw(self.screen)
            if self.state == "serve":
                self._text("Press Space to serve", self.font, (WIDTH // 2, HEIGHT - 40), MUTED)
            elif self.state == "paused":
                self._text("Paused · P to resume", self.font, (WIDTH // 2, HEIGHT // 2), ACCENT)

        pygame.display.flip()

    def _text(self, text, font, centre, colour=FOREGROUND):
        image = font.render(text, True, colour)
        self.screen.blit(image, image.get_rect(center=centre))

    # ---- main loop ----

    def run(self):
        while self.running:
            dt = min(self.clock.tick(FPS) / 1000, 1 / 30)
            for event in pygame.event.get():
                self.handle_event(event)
            self.update(dt, pygame.key.get_pressed())
            self.draw()
        pygame.quit()


if __name__ == "__main__":
    Game().run()
