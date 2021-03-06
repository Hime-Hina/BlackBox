import { Component, ComponentConstructor, ComponentID } from "./Component";
import { Transform } from "./Components/Transform";
import { FilterFn } from "./System";
import { GetUUID, IsType } from "./utils/Utilities";

export class Entity {
  isActive: boolean = true;
  isDestroyed: boolean = false;
  uuid: string;
  components: Map<ComponentID, Component>;
  transform: Transform = new Transform();

  constructor(name: string, components?: Component[]) {
    this.uuid = name;
    this.components = new Map();
    let hasTransform = false;
    if (!IsType(components, 'undefined')) {
      for (const component of components) {
        if (IsType(component, Transform)) {
          this.transform = component;
          hasTransform = true;
        }
        this.components.set(
          Component.GetComponentID(component.constructor as ComponentConstructor<Component>),
          component
        );
      }
    }
    if (!hasTransform) {
      this.components.set(Component.GetComponentID(Transform), this.transform);
    }
  }

  AddComponent<T extends Component>(this: Entity, component: T) {
    this.components.set(
      Component.GetComponentID(component.constructor as ComponentConstructor<T>),
      component
    );
    return this;
  }
  RemoveComponent<T extends Component>(this: Entity, componentCtor: ComponentConstructor<T>) {
    this.components.delete(Component.GetComponentID(componentCtor));
    return this;
  }
  GetComponent<T extends Component>(this: Entity, componentCtorOrID: number | ComponentConstructor<T>) {
    if (IsType(componentCtorOrID, Function)) {
      return this.components.get(Component.GetComponentID(componentCtorOrID)) as T;
    } else {
      return this.components.get(componentCtorOrID as ComponentID) as T;
    } 
  }
  HasComponent<T extends Component>(this: Entity, componentCtor: ComponentConstructor<T>) {
    return this.components.has(Component.GetComponentID(componentCtor));
  }
}

export class EntityManager {
  protected _entities: Map<string, Entity> = new Map();

  constructor() { }

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
  GetEntitiesByFilters(filter: FilterFn) {
    let res: Set<Entity> = new Set();
    this._entities.forEach((entity) => {
      if (entity.isActive && filter(entity)) res.add(entity);
    });
    return res;
  }
}
