import { Component } from "../Component";
import { ModClamp, ErrorHelper, IsType, IsTypePos } from "../utils/Utilities";
import { Vector3 } from "../utils/Vector";

export interface ITransform {
  get glbPosition(): Vector3;
  get locPosition(): Vector3;
  get rotation(): number;
  get scale(): Vector3;
}

@Component.component()
export class Transform extends Component implements ITransform {
  protected _locPosition: Vector3;
  protected _glbPosition: Vector3;
  protected _rotation: number;
  protected _scale: Vector3;

  constructor();
  constructor(pos: Pos | Vector3);
  constructor(pos: Pos | Vector3, scale: Vector3);
  constructor(pos: Pos | Vector3, rotation: number);
  constructor(pos: Pos | Vector3, rotation: number, scale: Vector3);
  constructor(pos?: Pos | Vector3, rotOrScl?: number | Vector3, scale?: Vector3) {
    super();
    this._locPosition = new Vector3();
    this._glbPosition = new Vector3();
    this._rotation = 0;
    this._scale = new Vector3(1, 1);

    if (IsType(pos, 'undefined')) {
    } else if (IsTypePos(pos) || IsType(pos, Vector3)) {
      this._glbPosition.x = pos.x;
      this._glbPosition.y = pos.y;
    } else {
      return ErrorHelper.ErrConstructorArgs(this.constructor, 'Wrong arg: pos');
    }
    if (IsType(rotOrScl, 'undefined')) {
    } else if (IsType(rotOrScl, 'number')) {
      if (IsType(scale, 'undefined')) {
        this._rotation = ModClamp(rotOrScl, 0, 2 * Math.PI);
      } else if (IsType(scale, Vector3)) {
        this._rotation = ModClamp(rotOrScl, 0, 2 * Math.PI);
        this._scale.x = scale.x;
        this._scale.y = scale.y;
      } else {
        return ErrorHelper.ErrConstructorArgs(this.constructor, 'Wrong arg: scale.');
      }
    } else if (IsType(rotOrScl, Vector3)) {
      this._scale.x = rotOrScl.x;
      this._scale.y = rotOrScl.y;
    } else {
      return ErrorHelper.ErrConstructorArgs(this.constructor, 'Wrong arg: rotation.');
    }
  }

  Translate(dirVec: Vector3): this {
    this._glbPosition.add(dirVec);
    return this;
  }
  Rotate(rotation: number): this {
    this._rotation = ModClamp(this._rotation + rotation, -Math.PI, Math.PI);
    return this;
  }
  Scale(scale: number | Vector3): this {
    if (IsType(scale, 'number')) {
      this._scale.x = scale;
      this._scale.y = scale;
      this._scale.z = scale;
    } else {
      this._scale.set(scale);
    }
    return this;
  }

  get glbPosition() {
    return this._glbPosition;
  }
  get locPosition() {
    return this._locPosition;
  }
  set rotation(rotation: number) {
    this._rotation = ModClamp(rotation, -Math.PI, Math.PI);
  }
  get rotation() {
    return this._rotation;
  }
  get scale() {
    return this._scale;
  }
}
