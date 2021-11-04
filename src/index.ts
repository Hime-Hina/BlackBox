import { Renderer } from './Game/Renderer/Renderer';
import { TestRenderingSys } from './test/TestSystem';
import './style.css';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let renderer = new Renderer(canvas);

function Init() {
  TestRenderingSys();
}

window.addEventListener('load', Init);