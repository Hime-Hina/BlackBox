import { EntityManager } from "./EntityManager";
import { System } from "./System";

export class Scene {
  protected _entityManager: EntityManager = new EntityManager();
  protected _systems: System[] = [];
  protected _canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  set canvas(newCanvas: HTMLCanvasElement) {
    this._canvas = newCanvas;
  }
  get canvas() {
    return this._canvas;
  }
  get systems() {
    return this._systems;
  }

}