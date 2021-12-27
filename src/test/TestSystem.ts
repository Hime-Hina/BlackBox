import { Easings } from "../Core/Tween/Easings";
import { Shape } from "../Core/Components/Shape";
import { Transform } from "../Core/Components/Transform";
import { Entity, EntityManager } from "../Core/EntityManager";
import { RenderingSystem } from "../Core/Systems/RenderingSystem";
import { RandInt, Size } from "../Core/utils/Utilities";
import { Vector3 } from "../Core/utils/Vector";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

export function TestRenderingSys() {
  canvas.width = 900;
  canvas.height = 600;
}
