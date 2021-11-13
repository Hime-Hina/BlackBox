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

  Start() { }

  #With = (entity: Entity) => {
    let shape = entity.GetComponent(Renderable) as Renderable;
    this._offScreenRenderer.Translate(entity.transform.glbPosition);
    this._offScreenRenderer.Scale(entity.transform.scale);
    this._offScreenRenderer.Rotate(entity.transform.rotation);
    if (shape) {
      this._offScreenRenderer.DrawPath(shape.path, shape.rendererSettings);
      if (shape.img)
        this._offScreenRenderer.DrawImage(
          shape.img,
          undefined,
          shape.rendererSettings);
    }
  }

  Update(time: number) {
    this._filtered = this._entityManager.GetEntitiesByFilters(this.Filter);
    if (this._offScreenCanvas) {
      this._offScreenRenderer.ClearCanvas();

      let i = 0;
      this._filtered.forEach(
        entity => {
          this._offScreenRenderer.With(this.#With, entity);
        }
      );

      this._renderer.ClearCanvas();
      this._renderer.DrawImage(this._offScreenCanvas);
    }
  }

  Filter(entity: Entity) {
    return entity.HasComponent(Renderable);
  }
}