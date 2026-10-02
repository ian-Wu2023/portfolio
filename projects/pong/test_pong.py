"""Tests for pong.py. Run with: python -m unittest test_pong (no window opens)."""

import os
import random
import unittest

os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
os.environ.setdefault("SDL_AUDIODRIVER", "dummy")

import pygame  # noqa: E402

import pong  # noqa: E402
from pong import HEIGHT, WIDTH, Ball, ComputerPlayer, Game, Paddle, Scoreboard  # noqa: E402


class FakeKeys(dict):
    """Stands in for pygame.key.get_pressed(): missing keys are not pressed."""

    def __missing__(self, key):
        return False


class PaddleTest(unittest.TestCase):
    def test_moves_and_stays_inside_the_court(self):
        paddle = Paddle(30)
        start = paddle.rect.y
        paddle.move(1, 0.1)
        self.assertGreater(paddle.rect.y, start)
        paddle.move(-1, 10)
        self.assertEqual(paddle.rect.top, 0)
        paddle.move(1, 10)
        self.assertEqual(paddle.rect.bottom, HEIGHT)


class BallTest(unittest.TestCase):
    def setUp(self):
        self.ball = Ball(random.Random(1))

    def test_bounces_off_the_top_wall(self):
        self.ball.x, self.ball.y = WIDTH / 2, 5
        self.ball.vx, self.ball.vy = 0, -300
        self.ball.update(0.1, [])
        self.assertGreater(self.ball.vy, 0)
        self.assertGreaterEqual(self.ball.rect.top, 0)

    def test_bounces_off_a_paddle_and_speeds_up(self):
        paddle = Paddle(30)
        self.ball.x, self.ball.y = paddle.rect.right + 5, paddle.rect.centery - Ball.SIZE / 2
        self.ball.vx, self.ball.vy = -400, 0
        self.ball.speed = 400
        self.ball.update(0.05, [paddle])
        self.assertGreater(self.ball.vx, 0, "ball should now travel right")
        self.assertGreater(self.ball.speed, 400)
        self.assertGreaterEqual(self.ball.rect.left, paddle.rect.right)

    def test_hitting_the_paddle_edge_gives_a_steeper_angle(self):
        paddle = Paddle(30)
        self.ball.y = paddle.rect.top - Ball.SIZE / 2
        self.ball._sync_rect()
        self.ball.speed = 400
        self.ball.bounce_off(paddle)
        self.assertLess(self.ball.vy, -200, "a hit near the top edge should go steeply upwards")

    def test_fast_ball_does_not_pass_through_a_paddle(self):
        paddle = Paddle(WIDTH - 30)
        self.ball.x = paddle.rect.left - 40
        self.ball.y = paddle.rect.centery - Ball.SIZE / 2
        self.ball.vx, self.ball.vy = Ball.MAX_SPEED, 0
        self.ball.update(1 / 30, [paddle])  # moves 30 px in one frame, more than the paddle is wide
        self.assertLess(self.ball.vx, 0, "ball should bounce back, not tunnel through")


class ScoreboardTest(unittest.TestCase):
    def test_first_to_the_winning_score_wins(self):
        board = Scoreboard(winning_score=3)
        for _ in range(2):
            board.point_to("left")
        self.assertIsNone(board.winner)
        board.point_to("left")
        self.assertEqual(board.winner, "left")


class ComputerPlayerTest(unittest.TestCase):
    def test_follows_the_ball_when_it_approaches(self):
        paddle = Paddle(WIDTH - 30)
        ball = Ball(random.Random(1))
        ball.vx = 300
        ball.y = 20
        ball._sync_rect()
        self.assertEqual(ComputerPlayer(paddle).direction(ball), -1)

    def test_returns_to_the_middle_when_the_ball_moves_away(self):
        paddle = Paddle(WIDTH - 30)
        paddle.move(1, 10)  # bottom of the court
        ball = Ball(random.Random(1))
        ball.vx = -300
        self.assertEqual(ComputerPlayer(paddle).direction(ball), -1)


class GameTest(unittest.TestCase):
    def setUp(self):
        self.game = Game(seed=7)

    def tearDown(self):
        pygame.quit()

    def press(self, key):
        self.game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=key))

    def test_menu_starts_a_match_and_space_serves(self):
        self.press(pygame.K_1)
        self.assertEqual(self.game.state, "serve")
        self.press(pygame.K_SPACE)
        self.assertEqual(self.game.state, "playing")
        self.press(pygame.K_p)
        self.assertEqual(self.game.state, "paused")

    def test_ball_leaving_the_court_scores_and_serves_again(self):
        self.press(pygame.K_2)
        self.press(pygame.K_SPACE)
        self.game.ball.x, self.game.ball.vx, self.game.ball.vy = -50, -300, 0
        self.game.update(1 / 60, FakeKeys())
        self.assertEqual((self.game.scoreboard.left, self.game.scoreboard.right), (0, 1))
        self.assertEqual(self.game.state, "serve")
        self.assertLess(self.game.ball.vx, 0, "the player who conceded receives the serve")

    def test_reaching_the_winning_score_ends_the_game(self):
        self.press(pygame.K_1)
        self.game.scoreboard.left = pong.WINNING_SCORE - 1
        self.game.score("left")
        self.assertEqual(self.game.state, "game_over")
        self.press(pygame.K_SPACE)
        self.assertEqual(self.game.state, "serve")
        self.assertEqual(self.game.scoreboard.left, 0)

    def test_a_simulated_match_runs_to_completion(self):
        """Two computer players play a full match through the real update and draw code."""
        self.press(pygame.K_1)
        left_ai = ComputerPlayer(self.game.left)
        frames = 0
        while self.game.state != "game_over" and frames < 60 * 60 * 10:
            if self.game.state == "serve":
                self.press(pygame.K_SPACE)
            direction = left_ai.direction(self.game.ball)
            keys = FakeKeys({pygame.K_s: direction > 0, pygame.K_w: direction < 0})
            self.game.update(1 / 60, keys)
            if frames % 30 == 0:
                self.game.draw()
            frames += 1
        self.assertEqual(self.game.state, "game_over")
        self.assertIn(pong.WINNING_SCORE, (self.game.scoreboard.left, self.game.scoreboard.right))


if __name__ == "__main__":
    unittest.main()
