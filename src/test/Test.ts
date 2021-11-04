import { Renderer } from "../Game/Renderer/Renderer";
import { Pos } from "../Game/utils/Utilities";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let renderer = new Renderer(canvas);
canvas.width = 900;
canvas.height = 600;

export function Test1() {
  if (renderer.ctx) {
    renderer.ctx.strokeStyle = 'red';
    renderer.ctx.moveTo(70, 70);
    renderer.ctx.lineTo(100, 200);
    renderer.ctx.stroke();

    renderer.ctx.save();
    renderer.ctx.strokeStyle = 'yellow';
    renderer.ctx.moveTo(200, 300);
    renderer.ctx.lineTo(200, 100);
    renderer.ctx.stroke();
    renderer.ctx.restore();

    renderer.ctx.lineTo(0, 0);
    renderer.ctx.stroke();
  }
}