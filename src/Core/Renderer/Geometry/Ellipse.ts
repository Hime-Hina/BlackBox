import _ from "lodash";
import { Pos, Size } from "../../utils/Utilities";
import { Geometry } from "./Geometry";

export class Ellipse extends Geometry {
  protected _size: Size = new Size;
  protected _rotation: number = 0;
  protected _startAngle: number = 0;
  protected _endAngle: number = 2 * Math.PI;
  protected _clockwise: boolean = false;

  constructor(pos: Pos, size?: Size) {
    super(pos);
    if (size) this.SetSize(size);
  }

  get size() {
    return this._size;
  }
  get rotation() {
    return this._rotation;
  }
  get startAngle() {
    return this._startAngle;
  }
  get endAngle() {
    return this._endAngle;
  }
  get clockwise() {
    return this._clockwise;
  }

  protected _UpdatePath(): void {
    this._path = new Path2D;
    this._path.ellipse(
      this._pos.x,
      this._pos.y,
      this._size.width / 2,
      this._size.height / 2,
      this._rotation,
      this._startAngle, this._endAngle,
      !this._clockwise
    );
    this._path.closePath();
  }

  IsEmpty(): boolean {
    return this._size.width === 0 || this._size.height === 0 || this._startAngle === this._endAngle;
  }

  SetSize(size: Size) {
    this._hasChanged = (this._size.width !== size.width) || (this._size.height !== size.height);
    if (this._hasChanged) {
      this._size.width = size.width;
      this._size.height = size.height;
    }
    return this;
  }
  SetRotation(rotation: number) {
    this._hasChanged = this._rotation !== rotation;
    if (this._hasChanged) this._rotation = rotation;
    return this;
  }
  SetAngle(start: number = 0, end: number = 2 * Math.PI) {
    this._hasChanged = this._startAngle !== start || this._endAngle !== end;
    if (this._hasChanged) {
      this._startAngle = start;
      this._endAngle = end;
    }
    return this;
  }
  SetClockwise(clockwise: boolean) {
    this._hasChanged = this._clockwise !== clockwise;
    if (this._hasChanged) this._clockwise = clockwise;
    return this;
  }
}