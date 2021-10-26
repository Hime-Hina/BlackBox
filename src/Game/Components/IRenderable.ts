export abstract class Renderable {
  abstract get pos(): Pos;
  abstract set pos(v: Pos);
  abstract get size(): Size;
  abstract set size(v: Size);
}