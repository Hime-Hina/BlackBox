export type Opaque<K, T> = T & { __TYPE__: K };

export class Pos implements Pos {
  constructor(public x = 0, public y = 0) { }
}

export class Pos3D implements Pos3D {
  constructor(public x = 0, public y = 0, public z = 0) { }
}

export class Size implements Size {
  constructor(public width = 300, public height = 150) { }
}
export class Circle implements Circle {
  constructor(public pos: Pos, public radius: number) {}
}
export class ColorStop {
  constructor(public offset: number, public color: string) {}
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
  return v.hasOwnProperty('x') && v.hasOwnProperty('y');
}
export function IsTypePos3D(v: any): v is Pos3D {
  return v.hasOwnProperty('x') && v.hasOwnProperty('y') && v.hasOwnProperty('z');
}
export function IsTypeSize(v: any): v is Size {
  return v.hasOwnProperty('width') && v.hasOwnProperty('height');
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
  ClassErrMsg: function (ctor: Function, msg: string) {
    throw new Error(`class ${ctor.name}:  ${msg}`);
  },
  ErrConstructorArgs: function (ctor: Function, msg?: string) {
    if (IsType(msg, 'string')) {
      throw new Error(`class ${ctor.name}: Error arguments! ${msg}`);
    } else {
      throw new Error(`class ${ctor.name}: Error arguments!`);
    }
  }
};

export function Clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}
export function ModClamp(v: number, lowerBound: number, upperBound: number) {
  return ((v - upperBound) % (upperBound - lowerBound)) + lowerBound;
}
