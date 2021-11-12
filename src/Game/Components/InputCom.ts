import { Component } from "../Component";

type InputEventHandler = (key?: string) => void;
export interface Key2InputEventHandler {
  [key: string]: InputEventHandler;
};

export class InputCom extends Component {
  #inputEventHandlers: Map<string, InputEventHandler> = new Map();

  constructor(key2Handlers?: Key2InputEventHandler) {
    super();
    if (key2Handlers) {
      for (const key in key2Handlers) {
        this.#inputEventHandlers.set(key, key2Handlers[key]);
      }
    }
  }

  get inputEventHandlers() {
    return this.#inputEventHandlers;
  }

  Add(key: string, handler: InputEventHandler) {
    this.#inputEventHandlers.set(key, handler);
    return this;
  }
  Remove(key: string) {
    this.#inputEventHandlers.delete(key);
    return this;
  }
}