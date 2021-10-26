import { Component } from "../Component";
import { ModClamp, ErrorHelper, IsType, IsTypePos } from "../utils/Utilities";
import { Vector2 } from "../utils/Vector";

export interface ITransform {
  get position(): Vector2;
  get rotation(): number;
  get scale(): Vector2;
}

@Component.component()
export class Transform extends Component implements ITransform {
  protected _locPosition: Vector2;
  protected _position: Vector2;
  protected _rotation: number;
  protected _scale: Vector2;

  constructor(pos: Pos | Vector2);
  constructor(pos: Pos | Vector2, scale: Vector2);
  constructor(pos: Pos | Vector2, rotation: number);
  constructor(pos: Pos | Vector2, rotation: number, scale: Vector2);
  constructor(pos: Pos | Vector2, rotOrScl?: number | Vector2, scale?: Vector2) {
    super();
    this._locPosition = new Vector2();
    this._position = new Vector2();
    this._rotation = 0;
    this._scale = new Vector2(1, 1);

    if ((IsTypePos(pos) || IsType(pos, Vector2))) {
      this._position.x = pos.x;
      this._position.y = pos.y;
    } else {
      ErrorHelper.ErrConstructorArgs(this.constructor, 'Wrong arg: pos');
    }
    if (IsType(rotOrScl, 'undefined')) {
    } else if (IsType(rotOrScl, 'number')) {
      if (IsType(scale, 'undefined')) {
        this._rotation = ModClamp(rotOrScl, 0, 2 * Math.PI);
      } else if (IsType(scale, Vector2)) {
        this._rotation = ModClamp(rotOrScl, 0, 2 * Math.PI);
        this._scale.x = scale.x;
        this._scale.y = scale.y;
      } else {
        ErrorHelper.ErrConstructorArgs(this.constructor, 'Wrong arg: scale.');
      }
    } else if (IsType(rotOrScl, Vector2)) {
      this._scale.x = rotOrScl.x;
      this._scale.y = rotOrScl.y;
    } else {
      ErrorHelper.ErrConstructorArgs(this.constructor, 'Wrong arg: rotation.');
    }
  }

  Translate(dirVec: Vector2) {
    this._position.add(dirVec);
  }
  Rotate(rotation: number) {
    this._rotation = ModClamp(this._rotation + rotation, 0, 2 * Math.PI);
  }
  Scale(scale: Vector2) {
    this._scale.x = scale.x;
    this._scale.y = scale.y;
  }

  get position() {
    return this._position;
  }
  get rotation() {
    return this._rotation;
  }
  get scale() {
    return this._scale;
  }
}
