import { IsType, Opaque } from "./utils/Utilities";

export type ComponentID = Opaque<'ComponentID', number>;
export interface ComponentsNameToID {
  [componentName: string]: ComponentID;
}
export interface ComponentIDToCtor {
  [componentID: ComponentID]: ComponentConstructor;
}
export interface ComponentConstructor {
  new(...args: any[]): Component;
}

export class Component {
  isEnabled = true;
  static #amountComponents = 0 as ComponentID;
  static #componentsName2id: ComponentsNameToID = {};
  static #componentsid2ctor: ComponentIDToCtor = {};

  constructor() {}

  protected static component(targetOrID?: number) {
    if (IsType(targetOrID, 'number')) {
      return function(target: ComponentConstructor) {
      Component.#componentsid2ctor[targetOrID as ComponentID] = target;
      Component.#componentsName2id[target.name] = targetOrID as ComponentID;
      ++Component.#amountComponents;
      }
    } else {
      return function(target: ComponentConstructor) {
        Component.#componentsid2ctor[Component.#amountComponents] = target;
        Component.#componentsName2id[target.name] = Component.#amountComponents++ as ComponentID;
      }
    }
  }

  static get amountComponents() {
      return Component.#amountComponents;
  }
  static GetComponentID(component: ComponentConstructor) {
    return Component.#componentsName2id[component.name];
  }
}
