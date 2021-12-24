import { Renderer } from "../Game/Renderer/Renderer";
import { Bezier } from "../Game/utils/Bezier";
import { Vector3 } from "../Game/utils/Vector";

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
      renderer.DrawArc({
        center: p,
        width: 1
      });
    }
  }
}