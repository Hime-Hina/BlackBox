import { GameMap, ObjInMap } from "../Pacman/Components/ObjInMap";
import { Shape } from "../Core/Components/Shape";
import { Transform } from "../Core/Components/Transform";
import { EntityManager } from "../Core/EntityManager";
import { Renderer } from "../Core/Renderer/Renderer";
import { RenderingSystem } from "../Core/Systems/RenderingSystem";
import { Pos, Size } from "../Core/utils/Utilities";
import { Vector3 } from "../Core/utils/Vector";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let renderer = new Renderer(canvas);
canvas.width = 900;
canvas.height = 600;

export function Test1() {
  let path = new Path2D();
  path.moveTo(8, 8);
  path.lineTo(80, 10);
  path.lineTo(30, 80);
  path.closePath();

  renderer.DrawPath(path, {
    style: { fill: 'transparent', stroke: 'red' },
    path: {width: 8}
  });
}

export function Test2() {
  renderer.Translate(new Pos(80, 80));
  renderer.Rotate(-Math.PI / 3);
}
