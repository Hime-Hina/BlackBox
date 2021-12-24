import { Component } from "../Game/Component";
import { Animation } from "../Game/Components/Animation/Animation";
import { Animator } from "../Game/Components/Animator";
import { AnimatorController } from "../Game/Components/AnimatorController";
import { Renderable } from "../Game/Components/Renderable";
import { Transform } from "../Game/Components/Transform";
import { EntityManager } from "../Game/EntityManager";
import { Renderer } from "../Game/Renderer/Renderer";
import { Easings } from "../Game/Tween/Easings";
import { Tween } from "../Game/Tween/Tween";
import { Size } from "../Game/utils/Utilities";
import { Vector3 } from "../Game/utils/Vector";

export class AnimationTester {
  static Test1() {
    let entityM = new EntityManager();

    entityM.CreateEntity([
      new Renderable(Renderable.Rect(new Size(200, 100))),
      new Animator(new AnimatorController()),
    ]);
  }
  static Test2() {
    let entityM = new EntityManager();
    let entity = entityM.CreateEntity([
      new Renderable(Renderable.Rect(new Size(200, 100))),
    ]);

    let anim = new Animation(entity);
    anim.AddKey(Transform, 'glbPosition', 'x', [
      {
        frameNumber: 10,
        keyframeInfo: {
          value: 8,
          ctrlVecs: [undefined, new Vector3(80, 0)],
        }
      }, {
        frameNumber: 20,
        keyframeInfo: {
          value: 100,
          ctrlVecs: [new Vector3(30, 0)],
        }
      }, {
        frameNumber: 30,
        keyframeInfo: {
          value: 80,
          ctrlVecs: [new Vector3(20, 0)],
        }
      }, {
        frameNumber: 40,
        keyframeInfo: {
          value: 60,
          ctrlVecs: [new Vector3(200, 0)],
        }
      }, {
        frameNumber: 60,
        keyframeInfo: {
          value: 200,
          ctrlVecs: [],
        }
      }
    ]);

    let renderer = new Renderer(document.getElementById('canvas') as HTMLCanvasElement);

    renderer.Translate({ x: 0, y: renderer.ctx.canvas.height, z: 0 });
    renderer.Scale({ x: 1, y: -1, z: 0 });

    let scale = 10;
    let pos: Vector3;
    let curve = anim.properties[Component.GetComponentID(Transform)]['glbPosition']['x'].curve;
    let keyframes = Array.from(anim.properties[Component.GetComponentID(Transform)]['glbPosition']['x'].keyframes.entries());
    for (let i = 0, j = 0; i < curve.length; ++i) {
      pos = new Vector3(scale * (i + 10), curve[i] + 100);
      if (j < keyframes.length && keyframes[j][0] === i) {
        renderer.DrawArc({
          center: pos,
          width: 3,
        }, {style: {fill: 'yellow'}});
        renderer.DrawArc({
          center: pos.Add(new Vector3(scale * keyframes[j][1].ctrlVecs[0].x, keyframes[j][1].ctrlVecs[0].y)),
          width: 3,
        }, { style: { fill: 'blue' } });
        renderer.DrawArc({
          center: pos.Add(new Vector3(scale * keyframes[j][1].ctrlVecs[1].x, keyframes[j][1].ctrlVecs[1].y)),
          width: 3,
        }, { style: { fill: 'red' } });
        ++j;
      }
      renderer.DrawArc({
        center: pos,
        width: 1,
      });
    }
  }
  static Test3() {
    let entityM = new EntityManager();
    let entity = entityM.CreateEntity([
      new Renderable(Renderable.Rect(new Size(200, 100))),
    ]);

    let anim = new Animation(entity);
    anim.AddKey(Transform, 'glbPosition', 'x', [
      {
        frameNumber: 10,
        keyframeInfo: {
          value: 8,
          ctrlVecs: [undefined, new Vector3(80, 0)],
        }
      }, {
        frameNumber: 20,
        keyframeInfo: {
          value: 100,
          ctrlVecs: [new Vector3(30, 0)],
        }
      }, {
        frameNumber: 30,
        keyframeInfo: {
          value: 80,
          ctrlVecs: [new Vector3(20, 0)],
        }
      }, {
        frameNumber: 40,
        keyframeInfo: {
          value: 60,
          ctrlVecs: [new Vector3(200, 0)],
        }
      }, {
        frameNumber: 60,
        keyframeInfo: {
          value: 200,
          ctrlVecs: [],
        }
      }
    ]);

    let lastTime = 0;
    let renderer = new Renderer(document.getElementById('canvas') as HTMLCanvasElement);
    function animate(t: number) {
      renderer.ClearCanvas();
      renderer.With(() => {
        renderer.Translate(entity.transform.glbPosition);
        renderer.DrawPath((entity.GetComponent(Renderable) as Renderable).path);
      });
      anim.Update(t, t - lastTime);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    lastTime = window.performance.now();
  }
}