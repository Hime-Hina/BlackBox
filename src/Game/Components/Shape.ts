import { Component } from "../Component";
import { ErrorHelper, IsType, IsTypeSize, Pos, Size } from "../utils/Utilities";
import { Vector2 } from "../utils/Vector";
import { Renderable as AbsRenderable } from "./IRenderable";

// TODO: 增加旋转参数Rotation
// TODO: 只需要一个组件Shape

@Component.component()
export class Shape extends Component implements AbsRenderable {
  protected _pos: Pos   = new Pos();
  protected _size: Size = new Size();

  constructor(widthOrSize?: number | Size, height?: number) {
    super();
    if (IsType(widthOrSize, 'undefined') && IsType(height, 'undefined')) { // 无参数
    } else if (IsType(height, 'undefined') && IsTypeSize(widthOrSize)) { // 仅一个Size类型的参数
      this._size = widthOrSize;
    } else if (IsType(height, 'number') && IsType(widthOrSize, 'number')) { // 仅两个Number类型的参数
      this._size.width = widthOrSize;
      this._size.height = height;
    } else { // 错误参数
      ErrorHelper.ErrConstructorArgs(this.constructor);
    }
  }

  set pos(newPos: Pos) {
    this._pos = newPos;
  }
  get pos() {
    return this._pos;
  }

  set size(newSize: Size) {
    this._size = newSize;
  }
  get size() {
    return this._size;
  }
}

@Component.component()
export class LineSegment extends Shape {
  protected _endPoints: [Vector2, Vector2]
  protected _direction: Vector2;

  constructor(points: [Vector2, Vector2]) {
    const allX = points.map(vec => vec.x);
    const allY = points.map(vec => vec.y);
    const minX = Math.min(...allX), maxX = Math.max(...allX); // 最大和最小的横坐标
    const minY = Math.min(...allY), maxY = Math.max(...allY); // 纵坐标
    super(new Size(maxX - minX, maxY - minY)); // 其size为AABB包围盒的size
    this._pos = points[0];
    this._endPoints = points;
    this._direction = points[1].Sub(points[0]);
  }

  get direction() {
    return this._direction;
  }
}

@Component.component()
export class Polygon extends Shape {
  protected _vertices: Vector2[];
  protected _minXY: Vector2;
  protected _maxXY: Vector2;

  constructor(vertices: Vector2[]) {
    if (vertices.length >= 3) {
      const allX = vertices.map(pos => pos.x);
      const allY = vertices.map(pos => pos.y);
      const minX = Math.min(...allX), maxX = Math.max(...allX);
      const minY = Math.min(...allY), maxY = Math.max(...allY);
      super(new Size(maxX - minX, maxY - minY));
      this._minXY = new Vector2(minX, minY);
      this._maxXY = new Vector2(maxX, maxY);
    } else {
      super(0, 0);
      this._minXY = new Vector2(1 << 31 - 1, 1 << 31 - 1);
      this._maxXY = new Vector2(-1, -1);
    }
    this._pos = vertices[0];
    this._vertices = vertices;
  }

  AddVertex(v: Vector2) {
    this._vertices.push(v);
    this._maxXY.x = Math.max(this._maxXY.x, v.x);
    this._maxXY.y = Math.max(this._maxXY.y, v.y);
    this._minXY.x = Math.min(this._minXY.x, v.x);
    this._minXY.y = Math.min(this._minXY.y, v.y);
    this._size.width = this._maxXY.x - this._minXY.x;
    this._size.height = this._maxXY.y - this._minXY.y;
    console.log(`(${this._minXY.x}, ${this._minXY.y}) (${this._maxXY.x}, ${this._maxXY.y})`);
  }
  AddVertices(vs: Vector2[]) {
    this._vertices.push(...vs);
    const allX = vs.map(pos => pos.x);
    const allY = vs.map(pos => pos.y);
    this._maxXY.x = Math.max(this._maxXY.x, Math.max(...allX));
    this._maxXY.y = Math.max(this._maxXY.y, Math.max(...allY));
    this._minXY.x = Math.min(this._minXY.x, Math.min(...allX));
    this._minXY.y = Math.min(this._minXY.y, Math.min(...allY));
    this._size.width = this._maxXY.x - this._minXY.x;
    this._size.height = this._maxXY.y - this._minXY.y;
    console.log(`(${this._minXY.x}, ${this._minXY.y}) (${this._maxXY.x}, ${this._maxXY.y})`);
  }

  get amountVertices() {
    return this._vertices.length;
  }
  get vertices() {
    return this._vertices;
  }
  get AABB() {
    return {
      pos: new Vector2(this._minXY),
      size: new Size(this._maxXY.x - this._minXY.x, this._maxXY.y - this._minXY.y),
    };
  }
}

@Component.component()
export class Rectangle extends Polygon {
  constructor(topLeft: Vector2 | Pos, size: Size) {
    const tl = new Vector2(topLeft);
    super([
      tl,
      tl.Add({x: size.width, y: 0}),
      tl.Add({x: size.width, y: size.height}),
      tl.Add({x: 0, y: size.height}),
    ]);
    this._pos = tl;
  }
}

@Component.component()
export class Ellipse extends Shape {
  protected _halfSize: Size;

  constructor(size: Size);
  constructor(width: number, height: number);
  constructor(widthOrSize?: number | Size, height?: number) {
    super(widthOrSize, height);
    this._halfSize = new Size(this._size.width / 2, this._size.height / 2);
  }

  get halfSize() {
    return this._halfSize;
  }
}

@Component.component()
export class Circle extends Ellipse {
  constructor(sizeOrRadius?: number | Size) {
    if (IsType(sizeOrRadius, 'undefined')) {
      super(32, 32);
    } else if (IsType(sizeOrRadius, 'number')) {
      super(sizeOrRadius, sizeOrRadius);
    } else if (IsTypeSize(sizeOrRadius)) {
      super(sizeOrRadius);
    } else {
      ErrorHelper.ErrConstructorArgs(Circle);
    }
  }

  set radius(newRadius: number) {
    this._size.width = newRadius;
    this._size.height = newRadius;
  }
  get radius() {
    return this._size.width;
  }
}