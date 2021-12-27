import { Matrix } from './Matrix';
import { Clamp, ErrorHelper, IsType, IsTypePos, Pos } from './Utilities';

export class Vector3 {
  public static readonly zero = new Vector3(0, 0, 0);
  public static readonly unitX = new Vector3(1, 0, 0);
  public static readonly unitY = new Vector3(0, 1, 0);
  public static readonly unitZ = new Vector3(0, 0, 1);
  public static readonly unitNX = new Vector3(-1, 0, 0);
  public static readonly unitNY = new Vector3(0, -1, 0);
  public static readonly unitNZ = new Vector3(0, 0, -1);

  public x: number = 0;
  public y: number = 0;
  public z: number = 0;

  constructor();
  constructor(x: number, y: number);
  constructor(x: number, y: number, z: number);
  constructor(pos?: Pos);
  constructor(xOrPos?: number | Pos, y?: number, z?: number) {
    if (IsType(xOrPos, 'undefined') && IsType(y, 'undefined') && IsType(z, 'undefined')) {
    } else if (IsTypePos(xOrPos) && IsType(y, 'undefined') && IsType(z, 'undefined')) {
      this.x = xOrPos.x;
      this.y = xOrPos.y;
      this.z = xOrPos.z;
    } else if (IsType(xOrPos, 'number') && IsType(y, 'number')) {
      this.x = xOrPos;
      this.y = y;
      if (IsType(z, 'undefined')) {
      } else if (IsType(z, 'number')) {
        this.z = z;
      } else {
        return ErrorHelper.ErrConstructorArgs(Vector3);
      }
    } else {
     return ErrorHelper.ErrConstructorArgs(Vector3);
    }
  }

  set(vecOrNum: Vector3 | number, y?: number, z?: number): this {
    if (IsType(vecOrNum, Vector3)) {
      this.x = vecOrNum.x;
      this.y = vecOrNum.y;
      this.z = vecOrNum.z;
    } else if (IsType(vecOrNum, 'number') && IsType(y, 'number')) {
      this.x = vecOrNum;
      this.y = y;
      if (IsType(z, 'number')) {
        this.z = z;
      } else this.z = 0;
    }
    return this;
  }

  Clamp(this: Vector3, lb: Pos, ub: Pos) {
    return Vector3.Clamp(this, lb, ub);
  }
  clamp(this: Vector3, lb: Pos, ub: Pos) {
    this.x = Clamp(this.x, lb.x, ub.x);
    this.y = Clamp(this.y, lb.y, ub.y);
    this.z = Clamp(this.z, lb.z, ub.z);
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
    this.x /= norm, this.y /= norm, this.z /= norm;
    return this;
  }
  Id(this: Vector3) {
    return Vector3.Id(this);
  }
  Equals(this: Vector3, other: Pos) {
    return Vector3.Equals(this, other);
  }
  Opposite(this: Vector3) {
    return Vector3.Opposite(this);
  }
  opposite(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }
  Add(this: Vector3, v: Pos) {
    return Vector3.Add(this, v);
  }
  add(v: Pos): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  Sub(this: Vector3, v: Pos) {
    return Vector3.Sub(this, v);
  }
  sub(v: Pos): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
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
    this.x *= k;
    this.y *= k;
    this.z *= k;
    return this;
  }
  Div(this: Vector3, k: number) {
    return Vector3.Div(this, k);
  }
  div(k: number): this {
    this.x /= k;
    this.y /= k;
    this.z /= k;
    return this;
  }
  ApplyMatrix(mat: Matrix) {
    return Vector3.ApplyMatrix(mat, this);
  }
  applyMatrix(mat: Matrix): this {
    const x = this.x, y = this.y, z = this.z;
    this.x = mat.m(0, 0) * x + mat.m(0, 1) * y + mat.m(0, 2) * z;
    this.y = mat.m(1, 0) * x + mat.m(1, 1) * y + mat.m(1, 2) * z;
    this.z = mat.m(2, 0) * x + mat.m(2, 1) * y + mat.m(2, 2) * z;
    return this;
  }
  Print(this: Vector3) {
    console.log(`(${this.x}, ${this.y}, ${this.z})`);
  }

  static RandUnit2D() {
    return new Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ).nomalize();
  }

  static Norm(v: Pos) {
    return Math.sqrt(Vector3.Dot(v, v));
  }
  static Id(other: Pos | Vector3) {
    return new Vector3(other.x, other.y, other.z);
  }
  static Unit(alpha: number, beta?: number, gamma?: number) {
    if (IsType(gamma, 'number') && IsType(beta, 'number')) {
      return new Vector3(
        Math.cos(alpha),
        Math.cos(beta),
        Math.cos(gamma)
      );
    } else if (IsType(beta, 'number')) {
      return new Vector3(
        Math.cos(beta) * Math.cos(alpha),
        Math.cos(beta) * Math.sin(alpha),
        Math.sin(beta)
      );
    } else if (IsType(beta, 'undefined')) {
      return new Vector3(
        Math.cos(alpha),
        Math.sin(alpha),
      );
    } else {
      return ErrorHelper.MethodError(this, 'Wrong arguments!');
    }
  }

  static Clamp(v1: Pos, lb: Pos, ub: Pos) {
    return new Vector3(
      Clamp(v1.x, lb.x, ub.x),
      Clamp(v1.y, lb.y, ub.y),
      Clamp(v1.z, lb.z, ub.z),
    );
  }
  static Equals(v1: Pos, v2: Pos) {
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
      return ErrorHelper.MethodError(this, 'Wrong matrix!');
    }
    return new Vector3(
      mat.m(0, 0) * v.x + mat.m(0, 1) * v.y + mat.m(0, 2) * v.z,
      mat.m(1, 0) * v.x + mat.m(1, 1) * v.y + mat.m(1, 2) * v.z,
      mat.m(2, 0) * v.x + mat.m(2, 1) * v.y + mat.m(2, 2) * v.z,
    );
  }
}
