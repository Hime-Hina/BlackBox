export type Opaque<K, T> = T & { __TYPE__: K };

export class Pos implements IPos {
  constructor(public x = 0, public y = 0, public z = 0) { }
}

export class Size implements ISize {
  public width: number;
  public height: number;
  constructor(width: number = 150, height?: number) {
    this.width = width;
    if (height) this.height = height;
    else this.height = width;
  }
}
export class Circle implements ICircle {
  constructor(public pos: Pos, public radius: number) { }
}
export class ColorStop {
  constructor(public offset: number, public color: string) { }
}

export function GetUUID() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

export function IsTypePos(v: any): v is Pos {
  return !IsType(v, 'undefined') && v.hasOwnProperty('x') && v.hasOwnProperty('y') && v.hasOwnProperty('z');
}
export function IsTypeSize(v: any): v is Size {
  return v.hasOwnProperty('width') && v.hasOwnProperty('height');
}
export function IsNumberArray(v: any): v is number[] {
  if (Array.isArray(v)) {
    let i = 0;
    while (i < v.length) {
      if (!IsType(v[i], 'number')) return false;
      ++i;
    }
    return true;
  } else return false;
}
export function IsNumberPair(v: any): v is [number, number] {
  if (Array.isArray(v)) {
    if (v.length !== 2) return false;
    let i = 0;
    while (i < v.length) {
      if (!IsType(v[i], 'number')) return false;
      ++i;
    }
    return true;
  } else return false;
}
export function IsNumberArray2D(v: any): v is number[][] {
  if (Array.isArray(v)) {
    let i = 0, j;
    while (i < v.length) {
      if (!IsType(v[i], 'undefined') && Array.isArray(v[i])) {
        j = 0;
        while (j < v[i].length) {
          if (!IsType(v[i][j], 'number')) return false;
          ++j;
        }
      } else return false;
      ++i;
    }
    return true;
  } else return false;
}
export function IsCanvas(v: any): v is HTMLCanvasElement {
  return typeof (v as HTMLCanvasElement).getContext !== 'undefined';
}


type Constructor = { new(...args: any[]): any };
type PrimitiveTypeMap = {
  bigint: bigint;
  boolean: boolean;
  function: (...args: any[]) => any;
  null: null;
  number: number;
  object: object;
  string: string;
  undefined: undefined;
}
type PrimitiveOrConstructor =
  | Constructor
  | keyof PrimitiveTypeMap;
type GuardedType<T extends PrimitiveOrConstructor> = T extends { new(...args: any[]): infer U }
  ? U
  : T extends keyof PrimitiveTypeMap
  ? PrimitiveTypeMap[T]
  : never;

export function IsType<T extends PrimitiveOrConstructor>(obj: any, type: T): obj is GuardedType<T> {
  if (typeof type === 'string') {
    if (type === 'null') {
      return typeof obj === 'object' && !obj;
    }
    return typeof obj === type;
  }
  return obj instanceof (type as Constructor);
}

export type RequiredDeep<T> = {
  [K in keyof T]-?:
  Required<T>[K] extends { [propName: string]: any }
  ? RequiredDeep<T[K]>
  : T[K]
};

export type MapTypeAllTo<T, U> = {
  [K in keyof Required<T>]:
  Required<T>[K] extends { [propName: string]: any }
  ? MapTypeAllTo<Required<T>[K], U>
  : U
};

export const ErrorHelper = {
  MethodError: function (obj: Object, msg: string) {
    throw new Error(`${obj.constructor.name}.${arguments.callee.name}:  ${msg}`);
  },
  ErrConstructorArgs: function (ctor: Function, msg?: string) {
    if (IsType(msg, 'string')) {
      throw new Error(`<class ${ctor.name}>: Error arguments! ${msg}`);
    } else {
      throw new Error(`<class ${ctor.name}>: Error arguments!`);
    }
  },
  RuntimeErr: function (msg: string) {
    throw new Error(msg);
  },
};

export function RandInt(lowerBound: number, upperBound: number) {
  return Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);
}
export function Clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}
export function ModClamp(v: number, lowerBound: number, upperBound: number) {
  let len = upperBound - lowerBound;
  return ((v - upperBound) % len + len) % len + lowerBound;
}

export function Simpson38(func: (x: number) => number, l: number, r: number) {
  let lMid = l + (r - l) / 3, rMid = l + 2 * (r - l) / 3;
  return (func(l) + 3 * func(lMid) + 3 * func(rMid) + func(r)) * (r - l) / 8;
}

export function AdaptiveSimpson38(func: (x: number) => number, l: number, r: number, eps: number = 1e-6): number {
  let mid = l + (r - l) / 2;
  let total = Simpson38(func, l, r),
    left = Simpson38(func, l, mid),
    right = Simpson38(func, mid, r);
  let ans = left + right - total;
  if (Math.abs(ans) <= 15 * eps) return left + right + ans / 15;
  return AdaptiveSimpson38(func, l, mid, eps / 2)
    + AdaptiveSimpson38(func, mid, r, eps / 2);
}
