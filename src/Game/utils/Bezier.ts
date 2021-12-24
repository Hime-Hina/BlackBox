import _ from "lodash";
import { AdaptiveSimpson38 } from "./Utilities";
import { Vector3 } from "./Vector";

export class Bezier {
  #ctrlPoints: Vector3[] = [];
  #totalLength: number;
  #diffCurve: (t: number) => number;

  constructor(ctrlPoints: Vector3[]) {
    this.#ctrlPoints = _.cloneDeep(ctrlPoints);
    this.#diffCurve = (t => this.GetPointAt(t, 1).Norm());
    this.#totalLength = this.GetLengthAt(1);
  }

  get totalLength() {
    return this.#totalLength;
  }

  GetPointAt(t: number, order: number = 0) {
    let n = this.#ctrlPoints.length - 1;
    let p = _.cloneDeep(this.#ctrlPoints);

    let prefix = 1;
    for (let i = 0; i < order; ++i) prefix *= n - i;

    let iRange = n - order;
    for (let k = 0; k < order; ++k) {
      for (let i = 0; i <= iRange; ++i) {
        p[i].opposite().add(p[i + 1]);
      }
    }

    for (let i = 0, jRange = 0; i < iRange; ++i) {
      jRange = iRange - i;
      for (let j = 0; j < jRange; ++j) {
        p[j].mul(1 - t).add(p[j + 1].Mul(t));
      }
    }
    return p[0].mul(prefix);
  }

  GetLengthAt(t: number) {
    return AdaptiveSimpson38(this.#diffCurve, 0, t);
  }

  GetParamAtLength(s: number, eps: number = 1e-6) {
    let t = s / this.#totalLength;
    let t_ = t;
    let approxLength: number, diff: number;

    do {
      approxLength = this.GetLengthAt(t);
      diff = approxLength - s;
      if (Math.abs(diff) < eps) break;

      t_ = t;
      t = t - diff / this.#diffCurve(t);
    } while (Math.abs(t - t_) >= eps);

    return t;
  }

  Trace(totalPoints: number) {
    let res = new Array<Vector3>(totalPoints);

    res[0] = this.GetPointAt(0);
    res[res.length - 1] = this.GetPointAt(1);

    for (let i = 1; i < res.length - 1; ++i) {
      res[i] = this.GetPointAt(this.GetParamAtLength(i * this.#totalLength / (res.length - 1)));
    }

    return res;
  }
}