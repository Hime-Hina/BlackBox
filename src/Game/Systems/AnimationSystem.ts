import { Animation } from "../Components/Animation";
import { EntityManager } from "../EntityManager";
import { System } from "../System";

export class AnimationSystem extends System {
  constructor(entityManager: EntityManager) {
    super(entityManager);
  }

  Start() {}
  Update(timeStamp: number) {
    let filtered = this._entityManager.GetEntitiesByFilters(this.Filter);
    filtered.forEach(
      entity => (entity.GetComponent(Animation) as Animation)?.UpdateTweens(timeStamp)
    );
  }
  Filter() { return true; }
}