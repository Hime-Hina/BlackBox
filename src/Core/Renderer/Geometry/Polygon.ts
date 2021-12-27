import _ from "lodash";
import { Pos } from "../../utils/Utilities";
import { Vector3 } from "../../utils/Vector";
import { Geometry } from "./Geometry";

export class Polygon extends Geometry {
  protected _edges: Vector3[];

  constructor(pos: Pos, ...edges: Vector3[]) {
    super(pos);
    this._edges = edges;
    this._hasChanged = true;
  }

  get edges() {
    return this._edges;
  }

  protected _UpdatePath(): void {
    this._path = new Path2D;
    let curPos = new Vector3(this._pos);
    this._path.moveTo(curPos.x, curPos.y);
    for (let edge of this._edges) {
      curPos.add(edge);
      this._path.lineTo(curPos.x, curPos.y);
    }
    this._path.closePath();
  }

  IsEmpty(): boolean {
    return this._edges.length === 0;
  }

  SetEdges(...edges: Vector3[]) {
    this._edges = edges;
    this._hasChanged = true;
    return this;
  }
  AddEdges(...edges: Vector3[]) {
    this._hasChanged = this._edges.push(...edges) > 0;
    return this;
  }

}