import { startGame } from './pong.js';

const canvas = document.getElementById('court');
const pauseButton = document.getElementById('pause');
const menuButton = document.getElementById('menu');
const playerButtons = document.querySelectorAll('[data-players]');

function showControls(state) {
  const inMatch = state === 'serve' || state === 'playing' || state === 'paused';
  pauseButton.hidden = !(state === 'playing' || state === 'paused');
  pauseButton.textContent = state === 'paused' ? 'Resume' : 'Pause';
  menuButton.hidden = !inMatch && state !== 'game_over';
  playerButtons.forEach((button) => { button.hidden = inMatch; });
}

const game = startGame(canvas, { onStateChange: showControls });

playerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    game.startMatch(Number(button.dataset.players));
    canvas.focus({ preventScroll: true });
  });
});
pauseButton.addEventListener('click', () => {
  game.handleKey('p');
  canvas.focus({ preventScroll: true });
});
menuButton.addEventListener('click', () => game.handleKey('Escape'));

showControls(game.state);
