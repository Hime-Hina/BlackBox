import './style.css';
import { Renderer } from "./Game/Renderer/Renderer";
import { Pacman } from './Pacman/Pacman';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let renderer = new Renderer(canvas);

function Init() {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;

  let game = new Pacman(canvas);
  game.Start();
}

window.addEventListener('load', Init);