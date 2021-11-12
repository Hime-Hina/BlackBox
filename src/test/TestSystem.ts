import { Easings } from "../Game/Tween/Easings";
import { Renderable } from "../Game/Components/Renderable";
import { Transform } from "../Game/Components/Transform";
import { Entity, EntityManager } from "../Game/EntityManager";
import { RenderingSystem } from "../Game/Systems/RenderingSystem";
import { RandInt, Size } from "../Game/utils/Utilities";
import { Vector3 } from "../Game/utils/Vector";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

export function TestRenderingSys() {
  canvas.width = 900;
  canvas.height = 600;
}
