import { Component } from "../../Game/Component";
import { Matrix } from "../../Game/utils/Matrix";
import { IsType, Pos, RandInt, Size } from "../../Game/utils/Utilities";
import { Vector3 } from "../../Game/utils/Vector";

export interface Direction {
  'right': 0;
  'up': 1;
  'left': 2;
  'down': 3;
}
type Type2Number<T> = { [key in keyof T]: number; };
type passableStateEncode = Type2Number<Direction>;
interface Index2Dir {
  [indx: number]: keyof Direction;
  0: 'right',
  1: 'up',
  2: 'left',
  3: 'down',
};

export class MapPos {
  public row = 0;
  public col = 0;
  constructor(rowOrMapPos?: number | MapPos, col?: number) {
    if (IsType(rowOrMapPos, 'number') && IsType(col, 'number')) {
      this.row = rowOrMapPos;
      this.col = col;
    } else if (IsType(rowOrMapPos, MapPos)) {
      this.row = rowOrMapPos.row;
      this.col = rowOrMapPos.col;
    }
  }
}

export class GameMap {
  #cellSize: Size;
  #size: Size;
  #pathSize: Size;
  #map: Matrix;
  #path: Path2D;
  static readonly dirR = [0, -1, 0, 1];
  static readonly dirC = [1, 0, -1, 0];
  static readonly dir2Index: Direction = {
    'right': 0, 'up': 1, 'left': 2, 'down': 3,
  };
  static readonly index2Dir: Index2Dir = {
    0: 'right', 1: 'up', 2: 'left', 3: 'down',
  };

  constructor(cellSize: Size, mapSize: Size) {
    this.#size = new Size(mapSize.width, mapSize.height);
    this.#cellSize = new Size(cellSize.width, cellSize.height);
    this.#pathSize = new Size(0, 0);
    this.#map = new Matrix(2 * mapSize.height + 1, 2 * mapSize.width + 1);
    this.#path = new Path2D();
  }

  get map() {
    return this.#map;
  }
  get path() {
    return this.#path;
  }
  get size() {
    return this.#size;
  }
  get pathSize() {
    return this.#pathSize;
  }

  IsInMap(row: number, col: number) {
    return (0 <= row && row < this.#map.row) && (0 <= col && col < this.#map.col);
  }
  IsInBoundary(row: number, col: number) {
    return (0 < row && row < this.#map.row - 1) && (0 < col && col < this.#map.col - 1);
  }
  #PushEdge(edges: [Vector3, Vector3][], row: number, col: number) {
    if (row < this.#size.height - 1 && this.#map.m(2 * row + 2, 2 * col + 1) === 0) { // down
      edges.push([new Vector3(row, col), new Vector3(row + 1, col)]);
    }
    if (0 < row && this.#map.m(2 * row, 2 * col + 1) === 0) { // up
      edges.push([new Vector3(row, col), new Vector3(row - 1, col)]);
    }
    if (0 < col && this.#map.m(2 * row + 1, 2 * col) === 0) { // left
      edges.push([new Vector3(row, col), new Vector3(row, col - 1)]);
    }
    if (col < this.#size.width - 1 && this.#map.m(2 * row + 1, 2 * col + 2) === 0) { // right
      edges.push([new Vector3(row, col), new Vector3(row, col + 1)]);
    }
  }
  #BreakWallsRandomly(prob: number) {
    let i;
    let curPos: MapPos, adjPos = new MapPos();
    let q: MapPos[] = [];
    let deadDir: number[];
    let visted = new Matrix(this.#map.row, this.#map.col);

    q.push(new MapPos(1, 1));
    while (q.length > 0) {
      curPos = q.shift()!;

      visted.set(curPos.row, curPos.col, 1);
      i = 0, deadDir = [];
      while (i < 4) {
        adjPos.row = curPos.row + GameMap.dirR[i];
        adjPos.col = curPos.col + GameMap.dirC[i];
        if (this.IsInBoundary(adjPos.row, adjPos.col)) {
          if (visted.m(adjPos.row, adjPos.col) === 0
              && this.#map.m(adjPos.row, adjPos.col) === 1) {
            q.push(new MapPos(adjPos));
          } else if (this.#map.m(adjPos.row, adjPos.col) === 0) {
            deadDir.push(i);
          }
        }
        ++i;
      }
      if (Math.random() < prob && deadDir.length >= 3) {
        let randIndx = RandInt(0, deadDir.length);
        adjPos.row = curPos.row + GameMap.dirR[deadDir[randIndx]];
        adjPos.col = curPos.col + GameMap.dirC[deadDir[randIndx]];
        this.#map.set(
          adjPos.row, adjPos.col, 1
        );
      }
    }
  }
  #GeneratePath(pos: MapPos, visted: Matrix) {
    let i, degree;
    let halfSize = new Size(this.#cellSize.width / 2, this.#cellSize.height / 2); 
    let adjPos = new MapPos();
    let curPos: MapPos;
    let q: MapPos[] = [];

    q.push(pos);
    while (q.length > 0) {
      curPos = q.shift()!;

      visted.set(curPos.row, curPos.col, 1);
      i = 0, degree = 0;
      while (i < 4) {
        adjPos.row = curPos.row + GameMap.dirR[i];
        adjPos.col = curPos.col + GameMap.dirC[i];
        this.#path.rect(
          curPos.col * this.#cellSize.width,
          curPos.row * this.#cellSize.height,
          this.#cellSize.width, this.#cellSize.height
        );
        if (this.IsInMap(adjPos.row, adjPos.col)) {
          if (visted.m(adjPos.row, adjPos.col) === 0
              && this.#map.m(adjPos.row, adjPos.col) === 0) {
            ++degree;
            q.push(new MapPos(adjPos));
          }
          if (this.#map.m(adjPos.row, adjPos.col) === 0) ++degree;
        };
        ++i;
      }
      // if (degree === 0) {
      //   this.#path.arc(
      //     curPos.col * this.#cellSize.width, curPos.row * this.#cellSize.height,
      //     4, 0, 2 * Math.PI
      //   );
      // }
    }
  }
  CreateMapRandomly() {
    let edges: [Vector3, Vector3][] = [];
    let vertices = new Matrix(this.#size.height, this.#size.width);

    let i = 0, j;
    while (i < this.#size.height) {
      j = 0;
      while (j < this.#size.width) {
        this.#map.set(2 * i + 1, 2 * j + 1, 1);
        ++j;
      }
      ++i;
    }

    let cnt = 1, tot = this.#size.width * this.#size.height;
    let row = RandInt(0, this.#size.height),
        col = RandInt(0, this.#size.width),
        randIndx = 0;
    let randEdge: [Vector3, Vector3] = [new Vector3(), new Vector3()];
    vertices.set(row, col, 1);
    while (cnt < tot) {
      this.#PushEdge(edges, row, col);

      do {
        randIndx = RandInt(0, edges.length);
        randEdge[0].x = edges[randIndx][0].x;
        randEdge[0].y = edges[randIndx][0].y;
        randEdge[1].x = edges[randIndx][1].x;
        randEdge[1].y = edges[randIndx][1].y;
        edges.splice(randIndx, 1);
      } while (vertices.m(randEdge[0].x, randEdge[0].y) === vertices.m(randEdge[1].x, randEdge[1].y));

      this.#map.set(randEdge[0].x + randEdge[1].x + 1, randEdge[0].y + randEdge[1].y + 1, 1);
      if (vertices.m(randEdge[0].x, randEdge[0].y) === 0) {
        row = randEdge[0].x, col = randEdge[0].y;
      } else {
        row = randEdge[1].x, col = randEdge[1].y;
      }
      vertices.set(row, col, 1);
      ++cnt;
    }

    this.#size.width = 2 * this.#size.width + 1;
    this.#size.height = 2 * this.#size.height + 1;

    this.#BreakWallsRandomly(0.6);

    let visted = new Matrix(this.#map.row, this.#map.col);
    i = 0;
    while (i < this.#size.height) {
      j = 0;
      while (j < this.#size.width) {
        if (visted.m(i, j) === 0 && this.#map.m(i, j) === 0) {
          this.#GeneratePath(new MapPos(i, j), visted);
        }
        ++j;
      }
      ++i;
    }

    this.#pathSize.width = this.#cellSize.width * this.#map.col;
    this.#pathSize.height = this.#cellSize.height * this.#map.row;

    return this;
  }

  GetPassableMapPosRandomly() {
    let res = new MapPos();
    do {
      res.row = RandInt(1, this.#map.row);
      res.col = RandInt(1, this.#map.col);
    } while(this.#map.m(res.row, res.col) === 0);
    return res;
  }
}

@Component.component()
export class ObjInMap extends Component {
  #isFixed = false;
  #curRow = 1;
  #curCol = 1;
  #dir: keyof Direction = 'right';
  #gameMap: GameMap;
  private static mapPosPool: Map<number, Set<number>> = new Map();

  constructor(gampMap: GameMap, isFixed?: boolean, initialPos?: {row: number, col: number}) {
    super();
    this.#gameMap = gampMap;
    if (IsType(isFixed, 'boolean')) this.#isFixed = isFixed;
    if (initialPos) this.row = initialPos.row, this.col = initialPos.col;
  }

  get row() {
    return this.#curRow;
  }
  set row(newRow: number) {
    if (0 < newRow && newRow < this.#gameMap.map.row - 1)
      this.#curRow = newRow;
  }
  get col() {
    return this.#curCol;
  }
  set col(newCol: number) {
    if (0 < newCol && newCol < this.#gameMap.map.col - 1)
      this.#curCol = newCol;
  }
  get dir() {
    return this.#dir;
  }

  CanMove(dir: keyof Direction) {
    if (this.#isFixed) return false;
    let newR = this.#curRow + GameMap.dirR[GameMap.dir2Index[dir]];
    let newC = this.#curCol + GameMap.dirC[GameMap.dir2Index[dir]];

    if (this.#gameMap.IsInBoundary(newR, newC)) {
      return this.#gameMap.map.m(newR, newC) === 1;
    } else return false;
  }
  Move(dir: keyof Direction) {
    this.#curRow += GameMap.dirR[GameMap.dir2Index[dir]];
    this.#curCol += GameMap.dirC[GameMap.dir2Index[dir]];
    this.#dir = dir;
  }

  AssignPosRandomly() {
    let randPos;

    do {
      randPos = this.#gameMap.GetPassableMapPosRandomly();
    } while(
      ObjInMap.mapPosPool.has(randPos.row)
      && ObjInMap.mapPosPool.get(randPos.row)!.has(randPos.col)
    );

    ObjInMap.RegisterMapPos(randPos);
    this.#curRow = randPos.row;
    this.#curCol = randPos.col;

    return this;
  }

  static RegisterMapPos(mapPos: MapPos) {
    if (ObjInMap.mapPosPool.has(mapPos.row)) {
      if (!ObjInMap.mapPosPool.get(mapPos.row)!.has(mapPos.col)) {
        ObjInMap.mapPosPool.get(mapPos.row)!.add(mapPos.col);
        return true;
      } else return false;
    } else {
      ObjInMap.mapPosPool.set(mapPos.row, new Set([mapPos.col]));
      return true;
    }
  }
  static UnregisterMapPos(mapPos: MapPos) {
    if (ObjInMap.mapPosPool.has(mapPos.row)) {
      return ObjInMap.mapPosPool.get(mapPos.row)!.delete(mapPos.col);
    }
  }
  static ClearMapPosPool() {
    ObjInMap.mapPosPool.clear();
  }
}