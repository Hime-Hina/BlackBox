import { Component, ComponentConstructor, ComponentID } from "./Component";
import { GetUUID, IsType } from "./utils/Utilities";

export class Entity {
  isActive: boolean = true;
  isDestroyed: boolean = false;
  uuid: string;
  components: Map<ComponentID, Component>;

  constructor(name: string, components?: Component[]) {
    this.uuid = name;
    this.components = new Map();
    if (!IsType(components, 'undefined')) {
      components.forEach(component => {
        this.components.set(
          Component.GetComponentID(component.constructor as ComponentConstructor),
          component
        );
      });
    }
  }

  AddComponent(this: Entity, component: Component) {
    this.components.set(
      Component.GetComponentID(component.constructor as ComponentConstructor),
      component
    );
    return this;
  }
  RemoveComponent(this: Entity, componentCtor: ComponentConstructor) {
    this.components.delete(Component.GetComponentID(componentCtor));
    return this;
  }
  GetComponent(this: Entity, componentCtor: ComponentConstructor) {
    return this.components.get(Component.GetComponentID(componentCtor));
  }
  HasComponent(this: Entity, componentCtor: ComponentConstructor) {
    return this.components.has(Component.GetComponentID(componentCtor));
  }
}

export class EntityManager {
  protected _entities: Map<string, Entity> = new Map();

  constructor() {}

  CreateEntity(this: EntityManager, components?: Component[]) {
    let uuid = GetUUID();
    let entity = new Entity(uuid, components);
    this._entities.set(uuid, entity);
    return entity;
  }
  RemoveEntity(this: EntityManager, entityOrID: string | Entity) {
    if (IsType(entityOrID, 'string')) {
      if (this._entities.has(entityOrID)) {
        this._entities.get(entityOrID)!.components.clear();
        return this._entities.delete(entityOrID);
      } else return false;
    } else {
      if (this._entities.has(entityOrID.uuid)) {
        this._entities.get(entityOrID.uuid)!.components.clear();
        return this._entities.delete(entityOrID.uuid);
      } else return false;
    }
  }
  RemoveDestroyed() {
    this._entities.forEach(
      entity => {
        if (entity.isDestroyed) {
          this.RemoveEntity(entity);
        }
      }
    );
  }

  GetEntityByID(this: EntityManager, uuid: string): Entity | undefined {
    return this._entities.get(uuid);
  }
  GetEntitiesByFilters(filter: (entity: Entity) => boolean) {
    let res: Entity[] = [];
    this._entities.forEach((entity) => {
      if (entity.isActive && filter(entity)) res.push(entity);
    });
    return res;
  }
}
