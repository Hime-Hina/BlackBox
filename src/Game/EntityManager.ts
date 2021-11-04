import { Component, ComponentConstructor, ComponentID } from "./Component";
import { GetUUID, IsType } from "./utils/Utilities";

export class Entity {
  uuid: string;
  components: Map<ComponentID, Component>;
  children: Set<Entity>;

  constructor(name: string, components?: Component[], children?: Entity[]) {
    this.uuid = name;
    this.components = new Map();
    this.children = new Set<Entity>(children);
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

  AddChild(this: Entity, entity: Entity) {
    this.children.add(entity);
    return this;
  }
  RemoveChild(this: Entity, childEntity: Entity) {
    return this.children.delete(childEntity);
  }
}

export class EntityManager {
  protected _entities: Map<string, Entity> = new Map();

  constructor() {}

  CreateEntity(this: EntityManager, components?: Component[], children?: Entity[] | string[]) {
    let uuid = GetUUID();
    let entity = new Entity(uuid, components);
    this._entities.set(uuid, entity);
    return entity;
  }
  RemoveEntity(this: EntityManager, entityID?: string) {
    if (IsType(entityID, 'undefined')) return true;
    if (this._entities.has(entityID)) {
      let flag = true;
      let entity = this._entities.get(entityID);
      entity!.children.forEach(
        childEntity => {
          if (!this.RemoveEntity(childEntity.uuid)) flag = false;
        }
      );
      return this._entities.delete(entityID) && flag;
    } else return false;
  }

  GetEntityByID(this: EntityManager, uuid: string): Entity | undefined {
    return this._entities.get(uuid);
  }
  GetEntitiesByFilters(filter: (entity: Entity) => boolean) {
    let res: Entity[] = [];
    this._entities.forEach((entity, uuid) => {
      if (filter(entity)) res.push(entity);
    });
    return res;
  }
}
