import { Pos } from "../../utils/Utilities";
import { Vector3 } from "../../utils/Vector";
import { Polygon } from "./Polygon";

export class Rectangle extends Polygon {
  constructor(pos: Pos, size: ISize) {
    super(pos);
    this.SetEdges(
      new Vector3(size.width, 0),
      new Vector3(0, size.height),
      new Vector3(-size.width, 0),
    );
  }
}