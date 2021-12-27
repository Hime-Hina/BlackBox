import { Circle } from "../Core/Renderer/Geometry/Circle";
import { Renderer } from "../Core/Renderer/Renderer";
import { Bezier } from "../Core/utils/Bezier";
import { Pos } from "../Core/utils/Utilities";
import { Vector3 } from "../Core/utils/Vector";

export class BezierTester {
  static Test1() {
    let renderer = new Renderer(document.getElementById('canvas') as HTMLCanvasElement);
    let st = new Vector3(190, 100);
    let ed = new Vector3(300, 200);
    let b = new Bezier(
      [
        st,
        st.Add(new Vector3(20, 30)),
        ed.Add(new Vector3(4, 30)),
        ed
      ]
    );

    let ps = b.Trace(10);
    for (let p of ps) {
      renderer.DrawGeometry(new Circle(p, 2))
    }
  }
}