import { Matrix } from './Matrix';
import { ErrorHelper, IsType, IsTypePos, Pos } from './Utilities';

export class Vector3 {
  public readonly zero = new Vector3(0, 0, 0);
  public readonly unitX = new Vector3(1, 0, 0);
  public readonly unitY = new Vector3(0, 1, 0);
  public readonly unitZ = new Vector3(0, 0, 1);

  protected _x: number = 0;
  protected _y: number = 0;
  protected _z: number = 0;

  constructor();
  constructor(x: number, y: number);
  constructor(x: number, y: number, z: number);
  constructor(pos: Pos);
  constructor(xOrPos?: number | Pos, y?: number, z?: number) {
    if (IsTypePos(xOrPos) && IsType(y, 'undefined') && IsType(z, 'undefined')) {
      this._x = xOrPos.x;
      this._y = xOrPos.y;
      this._z = xOrPos.z;
    } else if (IsType(xOrPos, 'number') && IsType(y, 'number') && IsType(z, 'number')) {
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
  set x(newX: number) {
    this._x = newX;
  }
  get y() {
    return this._y;
  }
  set y(newY: number) {
    this._y = newY;
  }
  get z() {
    return this._z;
  }
  set z(newZ: number) {
    this._z = newZ;
  }

  set(v: Vector3): this {
    this._x = v.x;
    this._y = v.y;
    this._z = v.z;
    return this;
  }

  Norm(this: Vector3) {
    return Math.sqrt(this.Dot(this));
  }
  Normalize() {
    return Vector3.Div(this, this.Norm());
  }
  nomalize(): this {
    let norm = this.Norm();
    this._x /= norm, this._y /= norm, this._z /= norm;
    return this;
  }
  Id(this: Vector3) {
    return Vector3.Id(this);
  }
  Equal(this: Vector3, other: Pos) {
    return Vector3.Equal(this, other);
  }
  Opposite(this: Vector3) {
    return Vector3.Opposite(this);
  }
  opposite(): this {
    this._x = -this._x;
    this._y = -this._y;
    this._z = -this._z;
    return this;
  }
  Add(this: Vector3, v: Pos) {
    return Vector3.Add(this, v);
  }
  add(v: Pos): this {
    this._x += v.x;
    this._y += v.y;
    this._z += v.z;
    return this;
  }
  Sub(this: Vector3, v: Pos) {
    return Vector3.Sub(this, v);
  }
  sub(v: Pos): this {
    this._x -= v.x;
    this._y -= v.y;
    this._z -= v.z;
    return this;
  }
  Cross(this: Vector3, v: Pos) {
    return Vector3.Cross(this, v);
  }
  Dot(this: Vector3, v: Pos) {
    return Vector3.Dot(this, v);
  }
  Mul(this: Vector3, k: number) {
    return Vector3.Mul(this, k);
  }
  mul(k: number): this {
    this._x *= k;
    this._y *= k;
    this._z *= k;
    return this;
  }
  Div(this: Vector3, k: number) {
    return Vector3.Div(this, k);
  }
  div(k: number): this {
    this._x /= k;
    this._y /= k;
    this._z /= k;
    return this;
  }
  ApplyMatrix(mat: Matrix) {
    return Vector3.ApplyMatrix(mat, this);
  }
  applyMatrix(mat: Matrix): this {
    const x = this._x, y = this._y, z = this._z;
    this._x = mat.m(0, 0) * x + mat.m(0, 1) * y + mat.m(0, 2) * z;
    this._y = mat.m(1, 0) * x + mat.m(1, 1) * y + mat.m(1, 2) * z;
    this._z = mat.m(2, 0) * x + mat.m(2, 1) * y + mat.m(2, 2) * z;
    return this;
  }

  static Norm(v: Pos) {
    return Math.sqrt(Vector3.Dot(v, v));
  }

  static Id(other: Pos | Vector3) {
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
  static Equal(v1: Pos, v2: Pos) {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }
  static Opposite(v1: Pos) {
    return new Vector3(-v1.x, -v1.y, -v1.z);
  }
  static Add(v1: Pos, v2: Pos) {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }
  static Sub(v1: Pos, v2: Pos) {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }
  static Cross(v1: Pos, v2: Pos) {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }
  static Dot(v1: Pos, v2: Pos) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }
  static Mul(v: Pos, k: number) {
    return new Vector3(k * v.x, k * v.y, k * v.z);
  }
  static Div(v: Pos, k: number) {
    return new Vector3(v.x / k, v.y / k, v.z / k);
  }
  static IncludedAngle(v1: Pos, v2: Pos) {
    return Math.acos(Vector3.Dot(v1, v2) / (Vector3.Norm(v1) * Vector3.Norm(v2)));
  }
  static ApplyMatrix(mat: Matrix, v: Pos) {
    if (mat.col !== 3) {
      ErrorHelper.ClassErrMsg(Vector3, Vector3.ApplyMatrix, 'Wrong matrix!');
    }
    return new Vector3(
      mat.m(0, 0) * v.x + mat.m(0, 1) * v.y + mat.m(0, 2) * v.z,
      mat.m(1, 0) * v.x + mat.m(1, 1) * v.y + mat.m(1, 2) * v.z,
      mat.m(2, 0) * v.x + mat.m(2, 1) * v.y + mat.m(2, 2) * v.z,
    );
  }
}
