import { Entity } from "./EntityManager";

export abstract class System {
  priority: number = 0;

  constructor() {}

  abstract Update(entities: Entity[]): void;

  abstract Filter(entity: Entity): boolean;
}