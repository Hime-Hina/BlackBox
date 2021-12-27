import { IsType, Opaque } from "./utils/Utilities";

export type ComponentID = Opaque<'ComponentID', number>;
export interface ComponentNameToID {
  [componentName: string]: ComponentID;
}
export interface ComponentIDToCtor {
  [componentID: ComponentID]: ComponentConstructor<Component>;
}
export interface ComponentConstructor<T extends Component> {
  new(...args: any[]): T;
}

// TODO: 修改映射变量类型为Map
export class Component {
  isEnabled = true;
  static #amountComponents = 0;
  static #componentCtor2ID: ComponentNameToID = {};
  static #componentID2Ctor: ComponentIDToCtor = {};

  constructor() { }

  protected static component(targetOrID?: number) {
    if (IsType(targetOrID, 'number')) {
      return function (target: ComponentConstructor<Component>) {
        Component.#componentID2Ctor[targetOrID as ComponentID] = target;
        Component.#componentCtor2ID[target.name] = targetOrID as ComponentID;
        ++Component.#amountComponents;
      }
    } else {
      return function (target: ComponentConstructor<Component>) {
        Component.#componentID2Ctor[Component.#amountComponents as ComponentID] = target;
        Component.#componentCtor2ID[target.name] = Component.#amountComponents++ as ComponentID;
      }
    }
  }

  static get componentsAmount() {
    return Component.#amountComponents;
  }
  static GetComponentID(component: ComponentConstructor<Component>) {
    return Component.#componentCtor2ID[component.name];
  }
  static GetComponentCtor(id: ComponentID) {
    return Component.#componentID2Ctor[id];
  }
}
