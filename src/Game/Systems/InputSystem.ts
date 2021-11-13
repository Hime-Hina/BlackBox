import { InputCom } from "../Components/InputCom";
import { Entity, EntityManager } from "../EntityManager";
import { System } from "../System";
import { Queue } from "../utils/Queue";
import { Vector3 } from "../utils/Vector";

export class InputSystem extends System {
  static #isMouseDown = false;
  static #curMousePos = new Vector3();
  static #mouseEvent: MouseEvent;
  static #isKeyDown: Set<string> = new Set();

  constructor(entityManager: EntityManager) {
    super(entityManager);
  }

  Start(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mouseup', (ev) => {
      InputSystem.#isMouseDown = false;
      InputSystem.#mouseEvent = ev;
    });
    canvas.addEventListener('mousedown', (ev) => {
      InputSystem.#isMouseDown = true;
      InputSystem.#mouseEvent = ev;
      InputSystem.#curMousePos.x = ev.offsetX;
      InputSystem.#curMousePos.y = ev.offsetY;
    });
    window.addEventListener('keyup', (ev) => {
      InputSystem.#isKeyDown.delete(ev.key);
    });
    window.addEventListener('keypress', (ev) => {
      if (!InputSystem.#isKeyDown.has(ev.key))
        InputSystem.#isKeyDown.add(ev.key);
    });
  }

  Update(timeStamp: number) {
    this._filtered = this._entityManager.GetEntitiesByFilters(this.Filter);
    InputSystem.#isKeyDown.forEach((key) => {
      this._filtered.forEach(entity => {
        let handler = (entity.GetComponent(InputCom) as InputCom).inputEventHandlers.get(key);
        if (handler) handler(key);
      });
    });
  }

  Filter(entity: Entity) { return entity.HasComponent(InputCom); }
}