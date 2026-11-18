const playerName = localStorage.getItem('nightshift_player');
if (!playerName) location.href = 'index.html';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
gameManager.loadAll();
gameManager.play();
