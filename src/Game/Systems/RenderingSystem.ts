import { System } from '../System';
import '../Components/Renderable';
import { Renderable } from '../Components/Renderable';
import { Transform } from '../Components/Transform';
import { Entity, EntityManager } from '../EntityManager';
import { Renderer } from '../Renderer/Renderer';
import { Vector3 } from '../utils/Vector';

export class RenderingSystem extends System {
  protected _offScreenCanvas: HTMLCanvasElement | null = null;
  protected _offScreenRenderer: Renderer;
  protected _renderer: Renderer;

  constructor(entityManager: EntityManager, canvas: HTMLCanvasElement | null, origin?: Vector3) {
    super(entityManager);
    if (canvas) {
      this._offScreenCanvas = canvas.cloneNode() as HTMLCanvasElement;
      this._offScreenCanvas.id = "off-screen-canvas";
    }
    this._offScreenRenderer = new Renderer(this._offScreenCanvas);
    this._renderer = new Renderer(canvas);
    if (origin) {
      this._offScreenRenderer.Translate(origin);
      // this._renderer.Translate(origin);
    }
  }

  Start() {}

  #With = (entity: Entity) => {
    let transfrom = entity.GetComponent(Transform) as Transform;
    let shape = entity.GetComponent(Renderable) as Renderable;
    if (transfrom) {
      this._offScreenRenderer.Translate(transfrom.glbPosition);
      this._offScreenRenderer.Scale(transfrom.scale);
      this._offScreenRenderer.Rotate(transfrom.rotation);
      if (shape) {
        this._offScreenRenderer.DrawPath(shape.path, shape.rendererSettings);
        if (shape.img)
          this._offScreenRenderer.DrawImage(
            shape.img,
            undefined,
            shape.rendererSettings);
      }
    }
  }

  Update(time: number) {
    let shapeEntities = this._entityManager.GetEntitiesByFilters(this.Filter);
    if (this._offScreenCanvas) {
      this._offScreenRenderer.ClearCanvas();

      let i = 0;
      while (i < shapeEntities.length) {
        this._offScreenRenderer.With(this.#With, shapeEntities[i]);
        ++i;
      }

      this._renderer.ClearCanvas();
      this._renderer.DrawImage(this._offScreenCanvas);
    }
  }

  Filter(entity: Entity) {
    return entity.HasComponent(Transform) && entity.HasComponent(Renderable);
  }
}