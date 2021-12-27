import { System } from '../System';
import '../Components/Shape';
import { Shape } from '../Components/Shape';
import { Entity, EntityManager } from '../EntityManager';
import { Renderer } from '../Renderer/Renderer';
import { Vector3 } from '../utils/Vector';
import { Img } from '../Renderer/Img';

export class RenderingSystem extends System {
  protected _offScreenImg: Img = new Img();
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
    this._offScreenImg.SetImage(this._offScreenRenderer.canvas);
  }

  Start() { }

  Update(time: number) {
    this._filtered = this._entityManager.GetEntitiesByFilters(this.Filter);
    if (this._offScreenCanvas) {
      this._offScreenRenderer.ClearCanvas();

      this._filtered.forEach(
        entity => {
          this._offScreenRenderer.Save();
          let shape = entity.GetComponent(Shape);
          this._offScreenRenderer.Translate(entity.transform.glbPosition);
          this._offScreenRenderer.Scale(entity.transform.scale);
          this._offScreenRenderer.Rotate(entity.transform.rotation);
          for (let renderable of shape.renderingGroup) {
            if (renderable) {
              renderable.Renderer.apply(this._offScreenRenderer, [renderable, shape.rendererSettings]);
            }
          }
          this._offScreenRenderer.Restore();
        }
      );

      this._renderer.ClearCanvas();
      this._renderer.DrawImage(this._offScreenImg);
    }
  }

  Filter(entity: Entity) {
    return entity.HasComponent(Shape);
  }
}