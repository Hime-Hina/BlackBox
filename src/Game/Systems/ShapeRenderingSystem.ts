import { System } from '../../System';
import '../Components/Shape';
import { Shape } from '../Components/Shape';
import { Transform } from '../Components/Transform';
import { Entity } from '../EntityManager';

class ShapeRenderingSystem extends System {
  constructor() {
    super();
  }

  Update(timeStamp: number) {
  }

  Filter(entity: Entity) {
    return entity.HasComponent(Transform) && entity.HasComponent(Shape);
  }
}