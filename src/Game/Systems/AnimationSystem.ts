import { Animation } from "../Components/Animation";
import { Entity, EntityManager } from "../EntityManager";
import { System } from "../System";

export class AnimationSystem extends System {
  constructor(entityManager: EntityManager) {
    super(entityManager);
  }

  Start() {}
  Update(timeStamp: number) {
    this._filtered = this._entityManager.GetEntitiesByFilters(this.Filter);
    this._filtered.forEach(
      entity => (entity.GetComponent(Animation) as Animation).UpdateTweens(timeStamp)
    );
  }
  Filter(entity: Entity) { 
    return entity.HasComponent(Animation);
  }
}