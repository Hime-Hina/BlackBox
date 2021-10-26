import { ErrorHelper, IsType, IsTypePos, IsTypePos3D, Pos, Pos3D } from './Utilities';

export class Vector3 {
  protected _x: number = 0;
  protected _y: number = 0;
  protected _z: number = 0;

  constructor(x: number, y: number, z: number);
  constructor(pos3d: Pos3D);
  constructor(xOrPos?: number | Pos3D, y?: number, z?: number) {
    if (arguments.length === 0) {
    } else if (arguments.length === 1 && IsTypePos3D(xOrPos) && IsType(y, 'undefined') && IsType(z, 'undefined')) {
      this._x = xOrPos.x;
      this._y = xOrPos.y;
      this._z = xOrPos.z;
    } else if (arguments.length === 3 && IsType(xOrPos, 'number') && IsType(y, 'number') && IsType(z, 'number')) {
      this._x = xOrPos;
      this._y = y;
      this._z = z;
    } else {
      ErrorHelper.ErrConstructorArgs(Vector3);
    }
  }


  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get z() {
    return this._z;
  }

  Norm(this: Vector3) {
    return Math.sqrt(this.Dot(this));
  }
  Normalize(): this {
    let norm = this.Norm();
    this._x /= norm, this._y /= norm, this._z /= norm;
    return this;
  }
  Id(this: Vector3) {
    return new Vector3(this._x, this._y, this._z);
  }
  Equal(this: Vector3, other: Pos3D) {
    return this._x === other.x && this._y === other.y && this._z === other.z;
  }
  Opposite(this: Vector3) {
    return new Vector3(-this._x, -this._y, -this._z);
  }
  Add(this: Vector3, v: Pos3D) {
    return new Vector3(this._x + v.x, this._y + v.y, this._z + v.z);
  }
  Sub(this: Vector3, v: Pos3D) {
    return new Vector3(this._x - v.x, this._y - v.y, this._z - v.z);
  }
  Cross(this: Vector3, v: Pos3D) {
    return new Vector3(
      this._y * v.z - this._z * v.y,
      this._z * v.x - this._x * v.z,
      this._x * v.y - this._y * v.x
    );
  }
  Dot(this: Vector3, v: Pos3D) {
    return this._x * v.x + this._y * v.y + this._z * v.z;
  }
  Mul(this: Vector3, k: number) {
    return new Vector3(k * this._x, k * this._y, k * this._z);
  }

  static Norm(v: Pos3D) {
    return Math.sqrt(Vector3.Dot(v, v));
  }
  static Zero() {
    return new Vector3(0, 0, 0);
  }
  static Id(other: Pos3D | Vector3) {
    return new Vector3(other.x, other.y, other.z);
  }
  static Unit(alpha: number, beta: number, gamma?: number) {
    if (typeof gamma === 'number') {
      return new Vector3(
        Math.cos(alpha),
        Math.cos(beta),
        Math.cos(gamma)
      );
    } else {
      return new Vector3(
        Math.cos(beta) * Math.cos(alpha),
        Math.cos(beta) * Math.sin(alpha),
        Math.sin(beta)
      );
    }
  }
  static UnitX() {
    return new Vector3(1, 0, 0);
  }
  static UnitY() {
    return new Vector3(0, 1, 0);
  }
  static UnitZ() {
    return new Vector3(0, 0, 1);
  }
  static Equal(v1: Pos3D, v2: Pos3D) {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }
  static Opposite(v1: Pos3D) {
    return new Vector3(-v1.x, -v1.y, -v1.z);
  }
  static Add(v1: Pos3D, v2: Pos3D) {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }
  static Sub(v1: Pos3D, v2: Pos3D) {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }
  static Cross(v1: Pos3D, v2: Pos3D) {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }
  static Dot(v1: Pos3D, v2: Pos3D) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }
  static Mul(v: Pos3D, k: number) {
    return new Vector3(k * v.x, k * v.y, k * v.z);
  }
  static IncludedAngle(v1: Pos3D, v2: Pos3D) {
    return Math.acos(Vector3.Dot(v1, v2) / (Vector3.Norm(v1) * Vector3.Norm(v2)));
  }
}

export class Vector2 {
  protected _x: number = 0;
  protected _y: number = 0;

  constructor();
  constructor(pos?: Pos);
  constructor(pos?: Vector2);
  constructor(x: number, y: number);
  constructor(xOrPos?: number | Pos, y?: number) {
    if (IsType(xOrPos, 'undefined') && IsType(y, 'undefined')) {
    } else if (arguments.length === 1 && (IsTypePos(xOrPos) || IsType(xOrPos, Vector2)) && IsType(y, 'undefined')) {
      this._x = xOrPos.x;
      this._y = xOrPos.y;
    } else if (arguments.length === 2 && IsType(xOrPos, 'number') && IsType(y, 'number')) {
      this._x = xOrPos;
      this._y = y;
    } else {
      ErrorHelper.ErrConstructorArgs(Vector2);
    }
  }

  set x(newX: number) {
    this._x = newX;
  }
  get x() {
    return this._x;
  }
  set y(newY: number) {
    this._y = newY;
  }
  get y() {
    return this._y;
  }

  Norm(this: Vector2) {
    return Math.sqrt(this.Dot(this));
  }
  Normalize(): this {
    let norm = this.Norm();
    this._x /= norm, this._y /= norm;
    return this;
  }
  Id(this: Vector2) {
    return new Vector2(this._x, this._y);
  }
  Equal(this: Vector2, other: Pos) {
    return this._x === other.x && this._y === other.y;
  }
  Opposite(this: Vector2) {
    return new Vector2(-this._x, -this._y);
  }
  opposite(this: Vector2) {
    this._x = -this._x;
    this._y = -this._y;
    return this;
  }
  Add(this: Vector2, v: Pos) {
    return new Vector2(this._x + v.x, this._y + v.y);
  }
  add(this: Vector2, v: Pos) {
    this._x += v.x;
    this._y += v.y;
    return this;
  }
  Sub(this: Vector2, v: Pos) {
    return new Vector2(this._x - v.x, this._y - v.y);
  }
  sub(this: Vector2, v: Pos) {
    this._x -= v.x;
    this._y -= v.y;
    return this;
  }
  Dot(this: Vector2, v: Pos) {
    return this._x * v.x + this._y * v.y;
  }
  Mul(this: Vector2, k: number) {
    return new Vector2(k * this._x, k * this._y);
  }
  mul(this: Vector2, k: number) {
    this._x *= k;
    this._y *= k;
    return this;
  }
  Cross(this: Vector2, v: Pos) {
    return new Vector3(
      0, 0, this._x * v.y - this._y * v.x
    );
  }

  static Norm(v: Pos) {
    return Math.sqrt(Vector2.Dot(v, v));
  }
  static Zero() {
    return new Vector2(0, 0);
  }
  static Id(v: Pos) {
    return new Vector2(v.x, v.y);
  }
  static Unit(alpha: number) {
    return new Vector2(Math.cos(alpha), Math.sin(alpha));
  }
  static UnitX() {
    return new Vector2(1, 0);
  }
  static UnitY() {
    return new Vector2(0, 1);
  }
  static Equal(v1: Pos, v2: Pos) {
    return v1.x === v2.x && v1.y === v2.y;
  }
  static Opposite(v: Pos) {
    return new Vector2(-v.x, -v.y);
  }
  static Add(v1: Pos, v2: Pos) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }
  static Sub(v1: Pos, v2: Pos) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }
  static Dot(v1: Pos, v2: Pos) {
    return v1.x * v2.x + v1.y + v2.y;
  }
  static Mul(v: Pos, k: number) {
    return new Vector2(k * v.x, k * v.y);
  }
  static Cross(v1: Pos, v2: Pos) {
    return new Vector3(
      0, 0, v1.x * v2.y - v1.y * v2.x
    );
  }
  static IncludedAngle(v1: Pos, v2: Pos) {
    return Math.acos(Vector2.Dot(v1, v2) / (Vector2.Norm(v1) * Vector2.Norm(v2)));
  }
  static Lerp(v1: Pos, v2: Pos, t: number) {
    return Vector2.Add(Vector2.Mul(v1, 1 - t), Vector2.Mul(v2, t));
  }
  static Center(v1: Pos, v2: Pos) {
    return Vector2.Lerp(v1, v2, 0.5);
  }
}
