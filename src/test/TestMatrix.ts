import { Matrix } from "../Core/utils/Matrix";

export class MatrixTester {
  static TestCreate() {
    let m1 = new Matrix([1,2,3,89,7],[4,5,6,2,3],[7,1,1,8,9], [10,3,77,11,12]);
    let m2 = new Matrix(m1);
    let m3 = new Matrix(2);
    let m4 = new Matrix(5, 7, 1,2,3,4,5);
    m2.Print();
    m3.Print();
    m4.Print();
  }
  static TestCalculation() {
    let m1 = new Matrix([1,2,3], [4, 1, 7]);
    let m2 = new Matrix([0, 1], [2, 3], [4, 2]);

    m1.Print();
    m2.Print();
    // m1.Add(m2).Print();
    // m1.Sub(m2).Print();
    m1.Mul(m2).Print();
    m1.MulK(2).Print();
    m2.Transpose().Print();
    m2.Mul(Matrix.Unit(m2.col)).Print();
  }
  static TestStaticMethods() {
    let m1 = Matrix.Unit(8);
    let m2 = Matrix.Diagonal(1,2,3,4,5);
    let m3 = Matrix.Diagonal([0,2,3,4,5]);

    m1.Print();
    m2.Print();
    m3.Print();

    console.log(Matrix.unit(3) === Matrix.unit(3));
    console.log(m2 === m3);
    console.log(Matrix.Equals(m2, m3));
  }
  static TestGetSet() {
    let m = new Matrix(21, 41);
    for (let i = 0; i < 10; ++i) {
      for (let j = 0; j < 20; ++j) {
        m.set(i, j, 8);
      }
    }
    m.Print();
  }
}
