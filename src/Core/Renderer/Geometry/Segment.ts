import { Pos } from "../../utils/Utilities";
import { Vector3 } from "../../utils/Vector";
import { Geometry } from "./Geometry";

export class Segment extends Geometry {
  protected _direction: Vector3 = new Vector3;
  constructor(pos?: Pos, direction?: Vector3) {
    super(pos);
    if (direction) {
      this.SetDirection(direction);
    }
  }

  get direction() {
    return this._direction;
  }

  protected _UpdatePath(): void {
    this._path = new Path2D;
    this._path.moveTo(this._pos.x, this._pos.y);
    this._path.lineTo(this._pos.x + this._direction.x, this._pos.y + this._direction.y);
    this._path.closePath();
  }

  IsEmpty(): boolean {
    return this._direction.Equals(Vector3.zero);
  }

  SetDirection(direction: Vector3) {
    this._hasChanged = !this._direction.Equals(direction);
    if (this._hasChanged) this._direction.set(direction);
    return this;
  }

}