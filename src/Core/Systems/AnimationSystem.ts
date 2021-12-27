import { Animator } from "../Components/Animator";
import { Entity, EntityManager } from "../EntityManager";
import { System } from "../System";

export class AnimationSystem extends System {
  constructor(entityManager: EntityManager) {
    super(entityManager);
  }

  Start() {}
  Update(timeStamp: number, delta: number) {
    this._filtered = this._entityManager.GetEntitiesByFilters(this.Filter);
    this._filtered.forEach(
      entity => {
        entity.GetComponent(Animator).Update(timeStamp, delta);
      }
    );
  }
  Filter(entity: Entity) { 
    return entity.HasComponent(Animator);
  }
}