import './style.css';
import { Pacman } from './Pacman/Pacman';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

function Init() {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;

  let game = new Pacman(canvas);
  game.Start();
}

window.addEventListener('load', Init);