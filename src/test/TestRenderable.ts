import { Shape } from "../Core/Components/Shape";
import { Entity, EntityManager } from "../Core/EntityManager";
import { Circle } from "../Core/Renderer/Geometry/Circle";
import { Ellipse } from "../Core/Renderer/Geometry/Ellipse";
import { Polygon } from "../Core/Renderer/Geometry/Polygon";
import { Rectangle } from "../Core/Renderer/Geometry/Rectangle";
import { Triangle } from "../Core/Renderer/Geometry/Triangle";
import { Img } from "../Core/Renderer/Img";
import { Renderer } from "../Core/Renderer/Renderer";
import { Text } from "../Core/Renderer/Text";
import { RenderingSystem } from "../Core/Systems/RenderingSystem";
import { Pos, RandInt, Size } from "../Core/utils/Utilities";
import { Vector3 } from "../Core/utils/Vector";
import bgPath from "../HansDungeon/assets/bg.png";

export class RenderableTester {
  static Test1() {
    let renderer = new Renderer(document.getElementById('canvas') as HTMLCanvasElement);
    let e = new Ellipse(new Pos(300, 400), new Size(300, 200));
    let p = new Polygon(
      new Pos(400, 300),
      new Vector3(100, 10), new Vector3(30, -20)
    );
    let rect = new Rectangle(
      new Pos(400, 0),
      new Size(300, 200),
    )
    let bg = new Img(bgPath, () => {
      bg.SetDest({
        pos: new Vector3(50, 50),
        size: new Size(400, 200)
      }, true);
      renderer.DrawImage(bg);
    });
    let text = new Text(
      new Pos(600, 100), '你好，世界！😅', {
      font: '60px Arial',
      baseline: 'middle',
      align: 'center'
    });

    renderer.DrawText(text);
    renderer.DrawGeometry(e);
    renderer.DrawGeometry(p);
    renderer.DrawGeometry(rect, {
      style: {
        fill: 'transparent',
        stroke: 'red'
      }
    });
  }
  static Test2() {
    const tot = 100;
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    let manager = new EntityManager();
    let entities: Entity[] = new Array<Entity>(tot);
    let bg = new Img(bgPath, () => {
      bg.SetDest({
        size: new Size(100, 200)
      }, true);
    });
    let text = new Text(new Pos, 'Hello', {
      font: '40px Arial',
      baseline: 'top'
    });
    for (let i = 0; i < tot; ++i) {
      entities[i] = manager.CreateEntity([
        new Shape().AddGeometries([new Circle(new Pos, 10),]).AddImage(bg).AddText(text),
      ]);
      entities[i].transform.glbPosition.set(
        RandInt(10, canvas.width - 10), RandInt(10, canvas.height - 10)
      );
    }

    let renderingSys = new RenderingSystem(
      manager, canvas
    );

    function Update(t: number) {
      renderingSys.Update(t);
      for (let i = 0; i < tot; ++i) {
        entities[i].transform.Translate(Vector3.RandUnit2D().mul(4));
      }

      requestAnimationFrame(Update);
    }

    renderingSys.Start();
    requestAnimationFrame(Update);
  }
}