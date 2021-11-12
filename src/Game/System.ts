import { Entity, EntityManager } from "./EntityManager";

export abstract class System {
  priority: number = 0;
  protected _entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this._entityManager = entityManager;
  }

  abstract Start(...args: any[]): void;

  abstract Update(time: number, deltaTime?: number): void;

  abstract Filter(entity: Entity): boolean;
}