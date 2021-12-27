import { Entity, EntityManager } from "./EntityManager";

export type FilterFn = (entity: Entity) => boolean;

export abstract class System {
  priority: number = 0;
  protected _filtered: Set<Entity>;
  protected _entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this._entityManager = entityManager;
    this._filtered = new Set();
  }

  abstract Start(...args: any[]): void;

  abstract Update(timeStamp: number, delta?: number): void;

  abstract Filter(entity: Entity): boolean;
}