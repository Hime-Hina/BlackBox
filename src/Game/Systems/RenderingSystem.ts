import { System } from '../System';
import '../Components/Shape';
import { Shape } from '../Components/Shape';
import { Transform } from '../Components/Transform';
import { Entity } from '../EntityManager';
import { Renderer } from '../Renderer/Renderer';

class RenderingSystem extends System {
  renderer: Renderer;

  constructor(canvas: HTMLCanvasElement | null) {
    super();
    this.renderer = new Renderer(canvas);
  }

  Update(shapeEntities: Entity[]) {
    let i = 0;
    while (i < shapeEntities.length) {
      this.renderer;
      ++i;
    }
  }

  Filter(entity: Entity) {
    return entity.HasComponent(Transform) && entity.HasComponent(Shape);
  }
}