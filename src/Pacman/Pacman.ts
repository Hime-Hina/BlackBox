import { Animation } from "../Game/Components/Animation";
import { InputCom, Key2InputEventHandler } from "../Game/Components/InputCom";
import { Direction, GameMap, MapPos, ObjInMap } from "./Components/ObjInMap";
import { Renderable } from "../Game/Components/Renderable";
import { Transform } from "../Game/Components/Transform";
import { Entity, EntityManager } from "../Game/EntityManager";
import { Game } from "../Game/Game";
import { AnimationSystem } from "../Game/Systems/AnimationSystem";
import { InputSystem } from "../Game/Systems/InputSystem";
import { RenderingSystem } from "../Game/Systems/RenderingSystem";
import { Easings } from "../Game/Tween/Easings";
import { Tween } from "../Game/Tween/Tween";
import { Size } from "../Game/utils/Utilities";
import { Vector3 } from "../Game/utils/Vector";

export class Pacman extends Game {
  #canvas: HTMLCanvasElement;

  #inputHandlers: Key2InputEventHandler;

  #cellSize: Size;
  #mapSize: Size;
  #maze: GameMap;

  #walkTween: Tween = new Tween();
  #rotTween: Tween = new Tween();
  #mouthTween: Tween = new Tween();

  #entityManager: EntityManager;
  #pacman: Entity;
  #pacmanRadius: number = 10;
  #rectsInMap: Map<number, Map<number, Entity>>;

  #renderOrigin: Vector3;
  #renderingSys: RenderingSystem;
  #inputSys: InputSystem;
  #animSys: AnimationSystem;

  static #mouthOpenAngle = Math.PI / 4;
  static #directionVec = [
    Vector3.unitX,
    Vector3.unitNY,
    Vector3.unitNX,
    Vector3.unitY
  ];
  static #curDirNxtKey2Rotation = {
    0: {
      'right': 0,
      'up': -Math.PI / 2,
      'left': -Math.PI,
      'down': Math.PI / 2,
    },
    1: {
      'right': Math.PI / 2,
      'up': 0,
      'left': -Math.PI / 2,
      'down': -Math.PI,
    },
    2: {
      'right': -Math.PI,
      'up': Math.PI / 2,
      'left': 0,
      'down': -Math.PI / 2,
    },
    3: {
      'right': -Math.PI / 2,
      'up': -Math.PI,
      'left': Math.PI / 2,
      'down': 0,
    },
  };

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.#canvas = canvas;
    this.#cellSize = new Size(4 * this.#pacmanRadius, 4 * this.#pacmanRadius);
    this.#mapSize = new Size(
      Math.floor(this.#canvas.width / this.#cellSize.width / 2),
      Math.floor(this.#canvas.height / this.#cellSize.height / 2)
    );

    this.#inputHandlers = {
      'w': this.InputHandler('up'),
      'a': this.InputHandler('left'),
      's': this.InputHandler('down'),
      'd': this.InputHandler('right'),
    };
    this.#maze = new GameMap(this.#cellSize, this.#mapSize).CreateMapRandomly();
    this.#renderOrigin = new Vector3(
      (this.#canvas.width - this.#maze.pathSize.width) / 2,
      (this.#canvas.height - this.#maze.pathSize.height) / 2,
    );

    this.#mouthTween =
      new Tween().From({
        startAngle: 0,
        endAngle: 2 * Math.PI,
      }).To({
        startAngle: Pacman.#mouthOpenAngle,
        endAngle: 2 * Math.PI - Pacman.#mouthOpenAngle,
      }, 300)
      .Easing(
        Easings.toBackSine
      ).OnUpdate((obj: { startAngle: number, endAngle: number }) => {
        (this.#pacman.GetComponent(Renderable) as Renderable)
          ?.Set(Pacman.GetPacmanShape(this.#pacmanRadius, obj.startAngle, obj.endAngle));
      });

    this.#entityManager = new EntityManager();
    ObjInMap.RegisterMapPos(new MapPos(1, 1));
    this.#maze.availMapPos.forEach(
      pos => {
        let transfrom = new Transform();
        this.#entityManager.CreateEntity(
          [
            transfrom,
            new Renderable(Renderable.Rect(new Size(10, 10), new Vector3(-5, -5))),
            new ObjInMap(this.#maze, true, pos),
            new Animation(
              [
                new Tween().From({
                  rot: 0,
                }).To({
                  rot: 2 * Math.PI
                }, 5000).Easing(Easings.linear).Loop(true)
                .OnUpdate((obj: {rot:number}) => transfrom.rotation = obj.rot)
              ]
            ),
          ]
        );
      }
    );
    this.#pacman = this.#entityManager.CreateEntity(
      [
        new Transform(),
        new Renderable({
          path: Pacman.GetPacmanShape(
            this.#pacmanRadius, 0, 2 * Math.PI
          )
        }, {
          style: { fill: 'yellow', stroke: 'black' }, path: { width: 2 }
        }),
        new InputCom(this.#inputHandlers),
        new ObjInMap(this.#maze),
        new Animation([
          this.#walkTween, this.#rotTween, this.#mouthTween
        ]),
      ]
    );
    this.#entityManager.CreateEntity( // 迷宫实体
      [
        new Transform(),
        new Renderable(Renderable.Path(this.#maze.path)),
      ]
    );
    this.#rectsInMap = new Map();

    this.#renderingSys = new RenderingSystem(this.#entityManager, this.#canvas, this.#renderOrigin);
    this.#inputSys = new InputSystem(this.#entityManager);
    this.#animSys = new AnimationSystem(this.#entityManager);
  }

  static GetDirection(rotation: number): 0 | 1 | 2 | 3 {
    let maxDot = -0x3f3f3f3f, dot;
    let res: 0 | 1 | 2 | 3 = 0;
    let curDir = Vector3.Unit(rotation);
    Pacman.#directionVec.forEach(
      (stdDir, i) => {
        dot = curDir.Dot(stdDir);
        if (dot > maxDot) {
          maxDot = dot;
          res = i as 0 | 1 | 2 | 3;
        }
      }
    );
    return res;
  }
  static GetPacmanShape(radius: number, startAngle: number, endAngle: number) {
    let path = new Path2D();
    path.moveTo(0, 0);
    path.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
    path.arc(0, 0, radius, startAngle, endAngle);
    path.moveTo(0, 0);
    path.lineTo(radius * Math.cos(endAngle), radius * Math.sin(endAngle));
    path.closePath();
    return path;
  }
  InputHandler(this: Pacman, key: keyof Direction) {
    return () => {
      if (this.#walkTween.IsPlaying() || this.#rotTween.IsPlaying()) return;

      let objInMapComp = this.#pacman.GetComponent(ObjInMap) as ObjInMap;
      let isOnRect = false;

      if (objInMapComp && objInMapComp.CanMove(key)) {
        this.#rotTween.From({
          rot: 0,
        }).To({
          rot: Pacman.#curDirNxtKey2Rotation[
            Pacman.GetDirection(this.#pacman.transform.rotation)
          ][key]
        }, 200)
        .Easing(Easings.InOutExpo)
        .OnUpdate((obj: { rot: number }, lastObj: { rot: number }) => {
          this.#pacman.transform.Rotate(obj.rot - lastObj.rot);
        }).Animate();

        objInMapComp.Move(key);
        isOnRect = this.#rectsInMap.has(objInMapComp.row)
            && this.#rectsInMap.get(objInMapComp.row)!.has(objInMapComp.col);
        this.#walkTween.From({
          x: this.#pacman.transform.glbPosition.x,
          y: this.#pacman.transform.glbPosition.y,
        }).To({
          x: (objInMapComp.col + 0.5) * this.#cellSize.width,
          y: (objInMapComp.row + 0.5) * this.#cellSize.height,
        }, 200)
        .Easing(Easings.InOutSine)
        .OnStart(() => {
          if (isOnRect) {
            this.#mouthTween.Animate();
          }
        })
        .OnUpdate((obj: { x: number, y: number }) => {
          this.#pacman.transform.glbPosition.x = obj.x;
          this.#pacman.transform.glbPosition.y = obj.y;
        })
        .OnEnd(() => {
          if (isOnRect) {
            this.#rectsInMap.get(objInMapComp.row)!.get(objInMapComp.col)!.isDestroyed = true;
            ObjInMap.UnregisterMapPos(new MapPos(objInMapComp.row, objInMapComp.col));
            this.#rectsInMap.get(objInMapComp.row)!.delete(objInMapComp.col);
          }
        }).Animate();
      }
    }
  }

  Start() {
    this.#entityManager.GetEntitiesByFilters(e => e.HasComponent(ObjInMap)).forEach(
      e => {
        let objInMap = e.GetComponent(ObjInMap) as ObjInMap;
        e.transform.glbPosition.x = (objInMap.col + 0.5) * this.#cellSize.width;
        e.transform.glbPosition.y = (objInMap.row + 0.5) * this.#cellSize.height;
        if (e !== this.#pacman) {
          if (this.#rectsInMap.has(objInMap.row)) {
            this.#rectsInMap.get(objInMap.row)!.set(objInMap.col, e);
          } else {
            this.#rectsInMap.set(objInMap.row, new Map());
            this.#rectsInMap.get(objInMap.row)!.set(objInMap.col, e);
          }
        }
      }
    );

    this.#inputSys.Start(this.#canvas);
    this.#animSys.Start();
    this.#renderingSys.Start();

    window.requestAnimationFrame(this.Update);
  }

  Update = (t: number) => {
    this.#inputSys.Update(t);
    this.#animSys.Update(t);
    this.#renderingSys.Update(t);

    this.#entityManager.RemoveDestroyed();

    window.requestAnimationFrame(this.Update);
  }
}