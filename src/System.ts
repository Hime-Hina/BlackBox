import { Entity } from "./Game/EntityManager";

export abstract class System {
  priority: number = 0;

  constructor() {}

  abstract Update(timeStamp: number): void;

  abstract Filter(entity: Entity): boolean;
}