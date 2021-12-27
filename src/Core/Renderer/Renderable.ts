import { Pos } from "../utils/Utilities";
import { Vector3 } from "../utils/Vector";
import { RendererFn } from "./Renderer";

export abstract class Renderable<T extends Renderable<T>> {
  abstract readonly Renderer: RendererFn<T>;

  protected _pos: Vector3 = new Vector3;
  protected _hasChanged: boolean = true;

  constructor(pos?: Pos) {
    if (pos) {
      this.SetPos(pos);
    }
  }

  get pos() {
    return this._pos;
  }

  abstract IsEmpty(): boolean;

  SetPos(newPos: Pos) {
    this._hasChanged = !this._pos.Equals(newPos);
    if (this._hasChanged) this._pos.set(newPos.x, newPos.y, newPos.z);
    return this;
  }

}