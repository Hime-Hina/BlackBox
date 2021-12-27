import { Pos } from "../../utils/Utilities";
import { Vector3 } from "../../utils/Vector";
import { Polygon } from "./Polygon";

export class Triangle extends Polygon {
  constructor(pos: Pos, ...edges: [Vector3, Vector3]) {
    super(pos, ...edges);
  }
}