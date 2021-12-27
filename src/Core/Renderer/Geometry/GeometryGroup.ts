import { Pos } from "../../utils/Utilities";
import { Geometry } from "./Geometry";

export class GeometryGroup extends Geometry {
  protected _geometries: Geometry[] = [];
  constructor(pos: Pos, ...geometries: Geometry[]) {
    super(pos);
    this.Add(...geometries);
  }

  get geometries() {
    return this._geometries;
  }

  protected _UpdatePath() {
    this._path = new Path2D;
    for (let geometry of this._geometries) {
      this._path.addPath(geometry.path);
    }
  }

  IsEmpty() {
    return this._geometries.length === 0;
  }

  Add(...geometries: Geometry[]) {
    this._hasChanged = this._geometries.push(...geometries) > 0;
    return this;
  }
  Remove(index: number) {
    this._hasChanged = this._geometries.splice(index, 1).length > 0;
    return this;
  }
  Clear() {
    this._geometries = [];
    this._hasChanged = true;
    return this;
  }

}