import { Component } from "../Component";
import { Entity } from "../EntityManager";
import { Tween } from "../Tween/Tween";
import { ErrorHelper } from "../utils/Utilities";
import { AnimatorController } from "./AnimatorController";

export type StateChangingPred = () => boolean;
export interface Tweens {
  [animName: string]: Tween;
}

@Component.component()
export class Animator extends Component {
  #controller: AnimatorController;

  constructor(controller: AnimatorController) {
    super();
    this.#controller = controller;
  }

  Update(timeStamp: number, delta: number) {
    for (let asm of this.#controller.stateMachines.values()) {
      asm.Transit();
      asm.currentState.Update(timeStamp, delta);
    }
  }
}