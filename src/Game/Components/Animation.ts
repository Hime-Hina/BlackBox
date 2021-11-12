import { Component } from "../Component";
import { Tween } from "../Tween/Tween";

@Component.component()
export class Animation extends Component {
  #tweens: Set<Tween> = new Set();

  constructor(tweens?: Tween[]) {
    super();
    if (tweens) {
      tweens.forEach(
        tween => this.#tweens.add(tween)
      );
    }
  }

  Add(this: Animation, tween: Tween) {
    this.#tweens.add(tween);
    console.log(this.#tweens.size);
    return this;
  }
  Remove(this: Animation, tween: Tween) {
    this.#tweens.delete(tween);
    return this;
  }
  UpdateTweens(timeStamp: number) {
    this.#tweens.forEach(
      tween => {
        tween.Update(timeStamp);
      }
    );
    return this;
  }
}