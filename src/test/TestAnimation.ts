import { Tween, EasingObject } from "../Game/Tween/Tween";
import { Easings } from "../Game/Tween/Easings";
import { Renderable } from "../Game/Components/Renderable";
import { Transform } from "../Game/Components/Transform";
import { ArcDrawingSettings, Renderer } from "../Game/Renderer/Renderer";
import { RenderingSystem } from "../Game/Systems/RenderingSystem";
import { Pos, Size } from "../Game/utils/Utilities";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let renderer = new Renderer(canvas);
canvas.width = 900;
canvas.height = 600;

export function TestAnimation() {
  let center = {x: 0, y: 0, z: 0};
  let anim = new Tween(center)
             .To({x: 100, y: 100}, 2000)
             .Easing(Easings.InOutExpo)
             .OnUpdate(() => {
               console.log(center);
             });
  let arcDrawing: ArcDrawingSettings = {
    center: center,
    width: 50,
  };

  function Update(timeStamp: number) {
    renderer.ClearCanvas();
    renderer.DrawArc(arcDrawing);
    anim.Update(timeStamp);
    window.requestAnimationFrame(Update);
  }

  renderer.DrawArc(arcDrawing);
  setTimeout(() => {
    window.requestAnimationFrame(Update);
  }, 2000);
}