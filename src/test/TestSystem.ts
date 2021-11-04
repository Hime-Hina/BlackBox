import { Easings } from "../Game/Animation/Easings";
import { Renderable } from "../Game/Components/Renderable";
import { Transform } from "../Game/Components/Transform";
import { Entity, EntityManager } from "../Game/EntityManager";
import { RenderingSystem } from "../Game/Systems/RenderingSystem";
import { RandInt, Size } from "../Game/utils/Utilities";
import { Vector3 } from "../Game/utils/Vector";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

export function TestRenderingSys() {
  canvas.width = 900;
  canvas.height = 600;

  let entityManager = new EntityManager;
  let renderingSys = new RenderingSystem(canvas);
  let entities: Entity[] = [];
  let edges = [
    new Vector3(-10, -10),
    new Vector3(-10, 30),
    new Vector3(0, 50),
    new Vector3(20, 70),
    new Vector3(10, 40),
    new Vector3(30, -40),
  ];

  for (let i = 0; i < 100; ++i) {
    let newEntity = entityManager.CreateEntity(
      [
        new Transform(
          new Vector3(RandInt(0, canvas.width), RandInt(0, canvas.height))
        ),
        new Renderable(Renderable.Ellipse(new Size(30, 20), new Vector3(40, 10)), {
          style: {fill: 'rgba(255,0,0,0.4)', stroke: 'yellow'},
        })
      ]
    );
    entities.push(newEntity);
  }

  let tt = 0;
  function Update(t: number) {
    t /= 1000;
    tt = t;
    tt %= 1;

    // entities.forEach(entity => {
    //   let transfrom = entity.GetComponent(Transform) as Transform;
    //   transfrom.Scale(2 * Math.cos(t * Math.PI));
    //   transfrom.rotation = Easings.InOutExpo(tt) * (2 * Math.PI);
    // });

    let filtered = entityManager.GetEntitiesByFilters(renderingSys.Filter);
    renderingSys.Update(filtered);

    window.requestAnimationFrame(Update);
  }
  window.requestAnimationFrame(Update);
}
