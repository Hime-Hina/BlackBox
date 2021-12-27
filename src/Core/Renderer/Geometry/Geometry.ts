import { Pos } from "../../utils/Utilities";
import { Vector3 } from "../../utils/Vector";
import { Renderable } from "../Renderable";
import { Renderer, RendererFn } from "../Renderer";

export abstract class Geometry extends Renderable<Geometry> {
  readonly Renderer: RendererFn<Geometry> = Renderer.prototype.DrawGeometry;

  protected _path: Path2D = new Path2D;

  constructor(pos?: Pos) {
    super(pos);
  }

  get path() {
    if (this._hasChanged) {
      this._UpdatePath();
      this._hasChanged = false;
    }
    return this._path;
  }

  protected abstract _UpdatePath(): void;

}