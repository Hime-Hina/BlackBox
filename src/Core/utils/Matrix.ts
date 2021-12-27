import { ErrorHelper, IsNumberArray, IsNumberArray2D, IsNumberPair, IsType } from "./Utilities";

export function IsMatrixArray(v: any): v is Matrix[] {
  if (Array.isArray(v)) {
    let i = 0;
    while (i < v.length) {
      if (!IsType(v[i], Matrix)) return false;
      ++i;
    }
    return true;
  } else return false;
}

// TODO: 修改为TypedArray泛型类

export class Matrix {
  protected static readonly _units = new Map<number, Matrix>();
  protected readonly _totalRow: number = 3;
  protected readonly _totalCol: number = 3;
  protected readonly _m!: number[];

  constructor();
  constructor(rows: number);
  constructor(rows: number, cols: number);
  constructor(rows: number, cols: number, ...elems: number[]);
  constructor(...rowArrays: number[][]);
  constructor(mat: Matrix);
  constructor(...args: [number, number?] | number[] | number[][] | Matrix[]) {
    let data;
    if (args.length === 0) {
    } else if (args.length === 1 && IsType(args[0], 'number')) {
      this._totalRow = args[0];
      this._totalCol = args[0];
    } else if (IsNumberPair(args)) {
      this._totalRow = args[0];
      this._totalCol = args[1] || args[0];
    } else if (IsNumberArray(args)) {
      this._totalRow = args[0];
      this._totalCol = args[1] || args[0];
      data = args.slice(2);
    } else if (args.length === 1 && IsMatrixArray(args)) {
      this._totalRow = args[0]._totalRow;
      this._totalCol = args[0]._totalCol;
      data = args[0];
    } else if (IsNumberArray2D(args)) {
      this._totalRow = args.length;
      this._totalCol = args[0].length;
      data = args;
    } else {
     return  ErrorHelper.ErrConstructorArgs(this.constructor, 'Error arguments!');
    }
    this._m = new Array(this._totalRow * this._totalCol);

    let i = 0;
    while (i < this._m.length) { this._m[i++] = 0; }

    this.Create(data);
  }

  #AssignByValues(elems: number[]) {
    let i = 0;
    while (i < this._m.length && i < elems.length) {
      this._m[i] = elems[i];
      ++i;
    }
  }
  #AssignByArray(elems: number[][]) {
    if (elems.length > this._totalRow) {
      return ErrorHelper.MethodError(this, `Too many row array! It should be less than ${this._totalRow}.`);
    }
    let i = 0, j;
    while (i < this._totalRow && i < elems.length) {
      j = 0;
      if (elems[i].length > this._totalCol) {
       return ErrorHelper.MethodError(this, `Too many column array! It should be less than ${this._totalCol}.`);
      }
      while (j < this._totalCol && j < elems[i].length) {
        this._m[i * this._totalCol + j] = elems[i][j];
        ++j;
      }
      ++i;
    }
    console.log('Created by arrays.');
  }
  Create(this: Matrix, elems?: number[] | number[][] | Matrix) {
    if (!IsType(elems, 'undefined')) {
      if (IsNumberArray(elems)) {
        if (elems.length <= this._m.length) {
          console.log('Created by values.');
          this.#AssignByValues(elems);
        } else {
          return ErrorHelper.MethodError(this, `Too many values! It should be less than ${this._m.length}.`);
        }
      } else if (IsType(elems, Matrix)) {
        if (elems._m.length <= this._m.length) {
          console.log('Created by matrix.');
          this.#AssignByValues(elems._m);
        } else {
         return ErrorHelper.MethodError(this, `The matrix did not match the scale! A ${this._totalRow}x${this._totalCol} matrix is expected.`);
        }
      } else if (IsNumberArray2D(elems)) {
        if (elems.length === 1) this.#AssignByValues(elems[0]);
        else this.#AssignByArray(elems);
      } else {
        return ErrorHelper.MethodError(this, 'Error arguments!');
      }
    }
  }
  Fill(this: Matrix, val: number) {
    let i = 0;
    while (i < this._m.length) {
      this._m[i] = val;
      ++i;
    }
    return this;
  }
  selfIncrese(this: Matrix, row: number, col: number) {
    ++this._m[row * this._totalRow + col];
    return this;
  }
  set(this: Matrix, row: number, col: number, val: number) {
    this._m[row * this._totalCol + col] = val;
    return this;
  }
  m(this: Matrix, row: number, col: number) {
    return this._m[row * this._totalCol + col];
  }

  get row() {
    return this._totalRow;
  }
  get col() {
    return this._totalCol;
  }

  Add(this: Matrix, m: Matrix) {
    console.log('Add');
    return Matrix.Add(this, m);
  }
  Sub(this: Matrix, m: Matrix) {
    console.log('Sub');
    return Matrix.Sub(this, m);
  }
  Mul(this: Matrix, m: Matrix) {
    console.log('Mul');
    return Matrix.Mul(this, m);
  }
  MulK(this: Matrix, k: number) {
    console.log('MulK');
    return Matrix.MulK(this, k);
  }
  Transpose(this: Matrix) {
    console.log('Transpose');
    return Matrix.Transpose(this);
  }
  Equals(m: Matrix) {
    return Matrix.Equals(this, m);
  }

  Print() {
    Matrix.Print(this);
  }

  static Print(m: Matrix) {
    let i = 0, j;
    let arr: number[][] = new Array(m._totalRow);
    while (i < m._totalRow) {
      j = 0;
      arr[i] = new Array(m._totalCol);
      while (j < m._totalCol) {
        arr[i][j] = m._m[i * m._totalCol + j];
        ++j;
      }
      ++i;
    }

    console.log(`Matrix ${m._totalRow}x${m._totalCol}.`);
    console.table(arr);
  }

  static unit(scale: number) {
    return Matrix.Unit(scale);
  }
  static Unit(scale: number) {
    if (scale <= 0) return ErrorHelper.MethodError(this, 'The scale of the matrix can not less than zero!');
    if (!Matrix._units.has(scale)) {
      let resMat = new Matrix(scale);
      let i = 0;
      while (i < scale) {
        resMat._m[i * scale + i] = 1;
        ++i;
      }
      Matrix._units.set(scale, resMat);
    }
    return Matrix._units.get(scale)!;
  }
  static Diagonal(...elems: number[] | [number[]]) {
    let resMat;
    if (IsNumberArray(elems)) {
      resMat = new Matrix(elems.length);
      let i = 0;
      while (i < elems.length) {
        resMat._m[i * elems.length + i] = elems[i];
        ++i;
      }
    } else {
      resMat = new Matrix(elems[0].length);
      let i = 0;
      while (i < elems[0].length) {
        resMat._m[i * elems[0].length + i] = elems[0][i];
        ++i;
      }
    }
    return resMat;
  }

  static Add(m1: Matrix, m2: Matrix) {
    if (m1._totalRow != m2._totalRow || m1._totalCol != m2._totalCol) {
     return  ErrorHelper.MethodError(this, `The matrix did not match the scale!`);
    }

    let resMat = new Matrix(m1._totalRow, m1._totalCol);
    let i = 0;
    while (i < resMat._m.length) {
      resMat._m[i] = m1._m[i] + m2._m[i];
      ++i;
    }
    return resMat;
  }
  static Sub(m1: Matrix, m2: Matrix) {
    if (m1._totalRow != m2._totalRow || m1._totalCol != m2._totalCol) {
      return ErrorHelper.MethodError(this, `The matrix did not match the scale!`);
    }

    let resMat = new Matrix(m1._totalRow, m1._totalCol);
    let i = 0;
    while (i < resMat._m.length) {
      resMat._m[i] = m1._m[i] - m2._m[i];
      ++i;
    }
    return resMat;
  }
  static Mul(m1: Matrix, m2: Matrix) {
    if (m1._totalCol != m2._totalRow) {
      return ErrorHelper.MethodError(this, `The matrix did not match the scale!`);
    }

    let resMat = new Matrix(m1._totalRow, m2._totalCol);
    let i = 0, j, k;
    let resI, m1I, m2I;

    while (i < resMat._totalRow) {
      j = 0;
      while (j < resMat._totalCol) {
        k = 0;
        while (k < m1._totalCol) {
          resI = i * resMat._totalCol + j;
          m1I = i * m1._totalCol + k;
          m2I = k * m2._totalCol + j;
          resMat._m[resI] += m1._m[m1I] * m2._m[m2I];
          ++k;
        }
        ++j;
      }
      ++i;
    }

    return resMat;
  }
  static MulK(m1: Matrix, k: number) {
    let resMat = new Matrix(m1._totalRow, m1._totalCol);
    let i = 0;
    while (i < resMat._m.length) {
      resMat._m[i] = m1._m[i] * k;
      ++i;
    }
    return resMat;
  }
  static Transpose(m: Matrix) {
    let resMat = new Matrix(m._totalCol, m._totalRow);
    let i = 0, j = 0;
    let resI, mI;
    while (i < resMat._totalRow) {
      j = 0;
      while (j < resMat._totalCol) {
        resI = i * resMat._totalCol + j;
        mI = j * m._totalCol + i;
        resMat._m[resI] = m._m[mI];
        ++j;
      }
      ++i;
    }
    return resMat;
  }
  static Equals(m1: Matrix, m2: Matrix) {
    return m1._m.length === m2._m.length && m1._m.every((elems, index) => Object.is(elems, m2._m[index]));
  }
}