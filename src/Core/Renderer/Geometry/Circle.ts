import { Pos, Size } from "../../utils/Utilities";
import { Ellipse } from "./Ellipse";

export class Circle extends Ellipse {
  protected _radius: number = 0;
  constructor(pos: Pos, radius?: number) {
    super(pos, new Size(radius, radius));
  }

  SetRadius(radius: number) {
    this._hasChanged = this._radius !== radius;
    if (this._hasChanged) {
      this._radius = radius;
      this._size.width = this._size.height = radius;
    }
    return this;
  }

}