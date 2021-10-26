import { Component, ComponentConstructor, ComponentID } from "./Component";
import { Shape } from "./Components/Shape";
import { GetUUID, IsType, Opaque } from "./utils/Utilities";

export class Entity {
  name: string;
  components: Map<ComponentID, Component>;

  constructor(name: string, components?: Component[]) {
    this.name = name;
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

  CreateEntity(this: EntityManager, name: string, components?: Component[]) {
    let uuid = GetUUID();
    this._entities.set(uuid, new Entity(name, components));
    return uuid;
  }

  GetEntityByID(this: EntityManager, uuid: string): Entity | undefined {
    return this._entities.get(uuid);
  }
  GetEntitiesByName(this: EntityManager, name: string) {
    let res: Entity[] = [];
    this._entities.forEach((entity, uuid) => {
      if (entity.name === name) res.push(entity);
    });
    return res;
  }
}
