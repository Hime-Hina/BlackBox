import { Component } from "../Core/Component";
import { Animation } from "../Core/Components/Animation/Animation";
import { Animator } from "../Core/Components/Animator";
import { AnimatorController, Condition, IsFalse, IsTrue, Parameter, State, Transition } from "../Core/Components/AnimatorController";
import { Shape } from "../Core/Components/Shape";
import { Transform } from "../Core/Components/Transform";
import { EntityManager } from "../Core/EntityManager";
import { GeometryGroup } from "../Core/Renderer/Geometry/GeometryGroup";
import { Rectangle } from "../Core/Renderer/Geometry/Rectangle";
import { Renderer } from "../Core/Renderer/Renderer";
import { Easings } from "../Core/Tween/Easings";
import { Tween } from "../Core/Tween/Tween";
import { Pos, Size } from "../Core/utils/Utilities";
import { Vector3 } from "../Core/utils/Vector";

export class AnimationTester {
  static Test1() {
    let entityM = new EntityManager();

    entityM.CreateEntity([
      new Shape().AddGeometries(new GeometryGroup(new Pos, new Rectangle(new Pos, new Size(100, 200)))),
      new Animator(new AnimatorController()),
    ]);
  }
  static Test2() {
    let animMoving = new Animation();
    animMoving.AddKey(
      Transform, 'glbPosition', 'x',
      {
        frame: 10,
        keyframeInfo: {
          value: 8,
          ctrlVecs: [undefined, new Vector3(80, 0)],
        }
      }, {
      frame: 20,
      keyframeInfo: {
        value: 100,
        ctrlVecs: [new Vector3(30, 0)],
      }
    }, {
      frame: 30,
      keyframeInfo: {
        value: 80,
        ctrlVecs: [new Vector3(20, 0)],
      }
    }, {
      frame: 40,
      keyframeInfo: {
        value: 60,
        ctrlVecs: [new Vector3(200, 0)],
      }
    }, {
      frame: 60,
      keyframeInfo: {
        value: 200,
        ctrlVecs: [],
      }
    });
    animMoving.AddKey(
      Transform, 'glbPosition', 'y',
      {
        frame: 10,
        keyframeInfo: {
          value: 8,
          ctrlVecs: [undefined, new Vector3(80, 0)],
        }
      }, {
      frame: 20,
      keyframeInfo: {
        value: 100,
        ctrlVecs: [new Vector3(30, 0)],
      }
    }, {
      frame: 30,
      keyframeInfo: {
        value: 80,
        ctrlVecs: [new Vector3(20, 0)],
      }
    }, {
      frame: 40,
      keyframeInfo: {
        value: 60,
        ctrlVecs: [new Vector3(200, 0)],
      }
    }, {
      frame: 60,
      keyframeInfo: {
        value: 200,
        ctrlVecs: [],
      }
    });
    let animIdle = new Animation();
    animIdle.AddKey(
      Transform, 'scale', 'x',
      {
        frame: 0,
        keyframeInfo: {
          value: 1,
          ctrlVecs: []
        }
      }, {
      frame: 30,
      keyframeInfo: {
        value: 2,
        ctrlVecs: []
      }
    }, {
      frame: 60,
      keyframeInfo: {
        value: 1,
        ctrlVecs: []
      }
    }
    );
    animIdle.AddKey(
      Transform, 'scale', 'y',
      {
        frame: 0,
        keyframeInfo: {
          value: 1,
          ctrlVecs: []
        }
      }, {
      frame: 30,
      keyframeInfo: {
        value: 2,
        ctrlVecs: []
      }
    }, {
      frame: 60,
      keyframeInfo: {
        value: 1,
        ctrlVecs: []
      }
    }
    );

    let animController = new AnimatorController();
    let asm = animController.GetASM();

    animController.AddParameter(new Parameter(Boolean, 'move'));

    asm.AddState(
      new State('Idle', animIdle),
      new State('Move', animMoving),
    );
    asm.AddTransition(
      new Transition(
        asm.GetState('Entry'),
        asm.GetState('Idle'),
        {
          // exitTime: 0
          hasExitTime: false
        }
      ),
      new Transition(
        asm.GetState('Idle'),
        asm.GetState('Move'),
        {
          conditions: [
            new Condition(animController.GetParameter<BooleanConstructor>('move'), IsTrue),
          ]
        }
      ),
      new Transition(
        asm.GetState('Move'),
        asm.GetState('Idle'),
        {
          exitTime: 0.9,
          conditions: [
            new Condition(animController.GetParameter<BooleanConstructor>('move'), IsFalse),
          ]
        }
      ),
    );

    let entityM = new EntityManager();
    let entity = entityM.CreateEntity([
      new Shape().AddGeometries([new Rectangle(new Pos, new Size(100, 200))]),
      new Animator(new AnimatorController()),
    ]);

    animMoving.SetEntity(entity);
    animIdle.SetEntity(entity);

    let lastTime = 0;
    let renderer = new Renderer(document.getElementById('canvas') as HTMLCanvasElement);
    function animate(t: number) {
      (entity.GetComponent(Animator) as Animator).Update(t, t - lastTime);
      renderer.ClearCanvas();
      renderer.With(() => {
        renderer.Translate(entity.transform.glbPosition);
        renderer.Scale(entity.transform.scale);
      });

      lastTime = t;
      requestAnimationFrame(animate);
    }

    window.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        animController.SetBool('move', true);
      }
    });
    window.addEventListener('keyup', (ev) => {
      if (ev.key === 'Enter') {
        animController.SetBool('move', false);
      }
    });

    lastTime = window.performance.now();
    requestAnimationFrame(animate);
  }
}