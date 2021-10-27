import _ from 'lodash';
import { Component } from "../Component";
import { ErrorHelper, IsType, IsTypeSize, Size } from "../utils/Utilities";
import { Vector3 } from "../utils/Vector";

// TODO: 增加旋转参数Rotation
// TODO: 只需要一个组件Shape

type ShapeType = 'none' | 'polygon' | 'rectangle' | 'triangle' | 'segment' | 'ellipse';
export interface ShapeConfig {
  shapeType: ShapeType;
  size?: Size;
  vertices?: Vector3[];
}
interface ShapeInfo {
  vertices: Vector3[];
}

@Component.component()
export class Shape extends Component {
  protected readonly _size: Size = new Size();
  protected readonly _shapeType: ShapeType = 'none';
  protected readonly _shapeInfo: ShapeInfo;

  constructor(shapeConfig: ShapeConfig) {
    super();
    this._shapeType = shapeConfig.shapeType;
    this._shapeInfo = {
      vertices: new Array(),
    };
    if (shapeConfig.vertices) {
      const allX = shapeConfig.vertices.map(vec => vec.x);
      const allY = shapeConfig.vertices.map(vec => vec.y);
      const minX = Math.min(...allX), maxX = Math.max(...allX);
      const minY = Math.min(...allY), maxY = Math.max(...allY);

      this._shapeInfo.vertices.push(...shapeConfig.vertices);
      this._size.width = maxX - minX;
      this._size.height = maxY - minY;
    } else if (shapeConfig.size) {
      this._size.width = shapeConfig.size.width;
      this._size.height = shapeConfig.size.height;
    } else {
      ErrorHelper.ErrConstructorArgs(
        this.constructor,
        'The argument shapeConfig.size or shapeConfig.vertices expected!'
      );
    }
  }

  get size() {
    return this._size;
  }
  get shapeType() {
    return this._shapeType;
  }
  get shapeInfo() {
    return this._shapeInfo;
  }

  static Segment(endp1: Pos, endp2: Pos): ShapeConfig {
    return {
      shapeType: 'segment',
      vertices: [
        new Vector3(endp1),
        new Vector3(endp2),
      ],
    };
  }
  static Triangle(p1: Pos, p2: Pos, p3: Pos): ShapeConfig {
    return {
      shapeType: 'triangle',
      vertices: [
        new Vector3(p1),
        new Vector3(p2),
        new Vector3(p3),
      ],
    }
  }
  static Rect(topLeft: Pos, size: Size): ShapeConfig {
    return {
      shapeType: 'rectangle',
      vertices: [
        new Vector3(topLeft),
        new Vector3(topLeft.x + size.width, topLeft.y),
        new Vector3(topLeft.x + size.width, topLeft.y + size.height),
        new Vector3(topLeft.x, topLeft.y + size.height),
      ],
    };
  }
  static Polygon(vertices: Pos[]): ShapeConfig {
    return {
      shapeType: 'polygon',
      vertices: vertices.map(vertex => new Vector3(vertex)),
    }
  }
  static Circle(radius: number): ShapeConfig {
    return {
      shapeType: 'ellipse',
      size: new Size(radius),
    };
  }
  static Ellipse(size: Size): ShapeConfig {
    return {
      shapeType: 'ellipse',
      size: new Size(size.width, size.height),
    }
  }
}

// @Component.component()
// export class LineSegment extends Shape {
//   protected _endPoints: [Vector3, Vector3]
//   protected _direction: Vector3;

//   constructor(points: [Vector3, Vector3]) {
//     const allX = points.map(vec => vec.x);
//     const allY = points.map(vec => vec.y);
//     const minX = Math.min(...allX), maxX = Math.max(...allX); // 最大和最小的横坐标
//     const minY = Math.min(...allY), maxY = Math.max(...allY); // 纵坐标
//     super(new Size(maxX - minX, maxY - minY)); // 其size为AABB包围盒的size
//     this._pos = points[0];
//     this._endPoints = points;
//     this._direction = points[1].Sub(points[0]);
//   }

//   get direction() {
//     return this._direction;
//   }
// }

// @Component.component()
// export class Polygon extends Shape {
//   protected _vertices: Vector3[];
//   protected _minXY: Vector3;
//   protected _maxXY: Vector3;

//   constructor(vertices: Vector3[]) {
//     if (vertices.length >= 3) {
//       const allX = vertices.map(pos => pos.x);
//       const allY = vertices.map(pos => pos.y);
//       const minX = Math.min(...allX), maxX = Math.max(...allX);
//       const minY = Math.min(...allY), maxY = Math.max(...allY);
//       super(new Size(maxX - minX, maxY - minY));
//       this._minXY = new Vector3(minX, minY);
//       this._maxXY = new Vector3(maxX, maxY);
//     } else {
//       super(0, 0);
//       this._minXY = new Vector3(1 << 31 - 1, 1 << 31 - 1);
//       this._maxXY = new Vector3(-1, -1);
//     }
//     this._pos = vertices[0];
//     this._vertices = vertices;
//   }

//   AddVertex(v: Vector3) {
//     this._vertices.push(v);
//     this._maxXY.x = Math.max(this._maxXY.x, v.x);
//     this._maxXY.y = Math.max(this._maxXY.y, v.y);
//     this._minXY.x = Math.min(this._minXY.x, v.x);
//     this._minXY.y = Math.min(this._minXY.y, v.y);
//     this._size.width = this._maxXY.x - this._minXY.x;
//     this._size.height = this._maxXY.y - this._minXY.y;
//     console.log(`(${this._minXY.x}, ${this._minXY.y}) (${this._maxXY.x}, ${this._maxXY.y})`);
//   }
//   AddVertices(vs: Vector3[]) {
//     this._vertices.push(...vs);
//     const allX = vs.map(pos => pos.x);
//     const allY = vs.map(pos => pos.y);
//     this._maxXY.x = Math.max(this._maxXY.x, Math.max(...allX));
//     this._maxXY.y = Math.max(this._maxXY.y, Math.max(...allY));
//     this._minXY.x = Math.min(this._minXY.x, Math.min(...allX));
//     this._minXY.y = Math.min(this._minXY.y, Math.min(...allY));
//     this._size.width = this._maxXY.x - this._minXY.x;
//     this._size.height = this._maxXY.y - this._minXY.y;
//     console.log(`(${this._minXY.x}, ${this._minXY.y}) (${this._maxXY.x}, ${this._maxXY.y})`);
//   }

//   get amountVertices() {
//     return this._vertices.length;
//   }
//   get vertices() {
//     return this._vertices;
//   }
//   get AABB() {
//     return {
//       pos: new Vector3(this._minXY),
//       size: new Size(this._maxXY.x - this._minXY.x, this._maxXY.y - this._minXY.y),
//     };
//   }
// }

// @Component.component()
// export class Rectangle extends Polygon {
//   constructor(topLeft: Vector3 | Pos, size: Size) {
//     const tl = new Vector3(topLeft);
//     super([
//       tl,
//       tl.Add({x: size.width, y: 0}),
//       tl.Add({x: size.width, y: size.height}),
//       tl.Add({x: 0, y: size.height}),
//     ]);
//     this._pos = tl;
//   }
// }

// @Component.component()
// export class Ellipse extends Shape {
//   protected _halfSize: Size;

//   constructor(size: Size);
//   constructor(width: number, height: number);
//   constructor(widthOrSize?: number | Size, height?: number) {
//     super(widthOrSize, height);
//     this._halfSize = new Size(this._size.width / 2, this._size.height / 2);
//   }

//   get halfSize() {
//     return this._halfSize;
//   }
// }

// @Component.component()
// export class Circle extends Ellipse {
//   constructor(sizeOrRadius?: number | Size) {
//     if (IsType(sizeOrRadius, 'undefined')) {
//       super(32, 32);
//     } else if (IsType(sizeOrRadius, 'number')) {
//       super(sizeOrRadius, sizeOrRadius);
//     } else if (IsTypeSize(sizeOrRadius)) {
//       super(sizeOrRadius);
//     } else {
//       ErrorHelper.ErrConstructorArgs(Circle);
//     }
//   }

//   set radius(newRadius: number) {
//     this._size.width = newRadius;
//     this._size.height = newRadius;
//   }
//   get radius() {
//     return this._size.width;
//   }
// }