import { Tween } from "../Tween/Tween";
import { ErrorHelper, IsType } from "../utils/Utilities";
import { Animation } from "./Animation/Animation";

export type ParameterConstructor = NumberConstructor | BooleanConstructor;
export type ParameterConstructor2Type<T extends ParameterConstructor> = ReturnType<T['prototype']['valueOf']>;
export type ParameterType = ParameterConstructor2Type<ParameterConstructor>;
export interface Parameter<T extends ParameterConstructor> {
  name: string;
  type: T;
  val: ParameterConstructor2Type<T>;
}
export type AnimationControllerParameters = Map<string, Parameter<BooleanConstructor | NumberConstructor>>;

export type ParamPred<T extends ParameterType> = (a: T, b: T) => boolean;
export const Equal: ParamPred<number> = (a, b) => a === b;
export const Greater: ParamPred<number> = (a, b) => a > b;
export const GreaterEq: ParamPred<number> = (a, b) => a >= b;
export const Less: ParamPred<number> = (a, b) => a < b;
export const LessEq: ParamPred<number> = (a, b) => a <= b;
export const IsTrue: ParamPred<boolean> = (a) => a;
export const IsFalse: ParamPred<boolean> = (a) => !a;

export interface Condition<T extends ParameterConstructor> {
  param: Parameter<T>;
  pred: ParamPred<ParameterConstructor2Type<T>>;
  cond: ParameterConstructor2Type<T>;
}

export class Parameter<T extends ParameterConstructor> implements Parameter<T> {
  name;
  type;
  val;

  constructor(type: T, name: string, value?: ParameterConstructor2Type<T>) {
    if (IsType(value, 'undefined')) {
      value = type(0) as ParameterConstructor2Type<T>;
    }
    this.name = name;
    this.type = type;
    this.val = value;
  }
}
export class Condition<T extends ParameterConstructor> implements Condition<T> {
  param;
  pred;
  cond;

  constructor(
    param: Parameter<T>,
    pred: ParamPred<ParameterConstructor2Type<T>>,
    cond?: ParameterConstructor2Type<T>
  ) {
    if (IsType(cond, 'undefined')) {
      cond = param.type(0) as ParameterConstructor2Type<T>;
    }
    this.param = param;
    this.pred = pred;
    this.cond = cond;
  }
}

type StateEventHandler = () => void;
export class State {
  onEnter: StateEventHandler = () => { };
  onUpdate: StateEventHandler = () => { };
  onExit: StateEventHandler = () => { };
  name: string;
  animation: Animation;
  protected _id: number = 0;

  constructor(name: string, anim: Animation) {
    this.name = name;
    this.animation = anim;
  }

  get id() {
    return this._id;
  }
  set id(newID: number) {
    this._id = newID;
  }

  SetID(newID: number) {
    this._id = newID;
    return this;
  }

  OnEnter(eventHandler: StateEventHandler) {
    this.onEnter = eventHandler;
    return this;
  }
  OnUpdate(eventHandler: StateEventHandler) {
    this.onUpdate = eventHandler;
    return this;
  }
  OnExit(eventHandler: StateEventHandler) {
    this.onExit = eventHandler;
    return this;
  }

  Update(timeStamp: number, delta: number) {
    this.animation.Update(timeStamp, delta);
    this.onUpdate();
  }
}

type TransitionSettings = {
  isSolo: boolean;
  isMute: boolean;
  hasExitTime: boolean;
  exitTime: number;
  hasFixedDuration: boolean;
  conditions: Condition<BooleanConstructor | NumberConstructor>[];
};
export class Transition {
  fromState: State;
  toState: State;
  isSolo: boolean;
  isMute: boolean;
  hasExitTime: boolean;
  exitTime: number;
  hasFixedDuration: boolean; // unused
  conditions: Condition<BooleanConstructor | NumberConstructor>[];
  protected _exit: boolean = false;
  static readonly defaultSettings: TransitionSettings = {
    isSolo: false,
    isMute: false,
    hasExitTime: true,
    hasFixedDuration: false,
    exitTime: 1.0,
    conditions: [],
  };

  constructor(
    fromState: State, toState: State, {
      isSolo = Transition.defaultSettings.isSolo,
      isMute = Transition.defaultSettings.isMute,
      hasExitTime = Transition.defaultSettings.hasExitTime,
      hasFixedDuration = Transition.defaultSettings.hasFixedDuration,
      exitTime = Transition.defaultSettings.exitTime,
      conditions = Transition.defaultSettings.conditions,
    }: Partial<TransitionSettings> = Transition.defaultSettings
  ) {
    this.fromState = fromState;
    this.toState = toState;
    this.isSolo = isSolo
    this.isMute = isMute
    this.hasExitTime = hasExitTime
    this.exitTime = exitTime
    this.hasFixedDuration = hasFixedDuration
    this.conditions = conditions;
  }

  Reset() {
    this._exit = !this.hasExitTime;
    this.fromState.animation.Reset();
    this.toState.animation.Reset();
  }
  #EvaluateExitTime() {
    this._exit = !this.hasExitTime;
    if (this.hasExitTime) {
      let lastNomalizedTime = this.fromState.animation.lastNomalizedTime;
      let nomalizedTime = this.fromState.animation.nomalizedTime;
      if (this.exitTime < 1) {
        this._exit = 
          (lastNomalizedTime.decimal <= this.exitTime)
          && (this.exitTime <= nomalizedTime.decimal);
      } else if (this.exitTime === 1) {
        this._exit = nomalizedTime.decimal <= lastNomalizedTime.decimal;
      } else if (this.exitTime > 1) {
        this._exit =
          (lastNomalizedTime.integer + lastNomalizedTime.decimal <= this.exitTime)
          && (this.exitTime <= nomalizedTime.integer + nomalizedTime.decimal);
      }
    }
  }
  CanTransit(): boolean {
    this.#EvaluateExitTime();
    if (!this._exit) return false;

    let i = 0;
    while (i < this.conditions.length) {
      if (!this.isMute && !this.conditions[i].pred(
        this.conditions[i].param.val,
        this.conditions[i].cond
      )) {
        return false;
      }
      ++i;
    }

    return true;
  }
}

class AnimationStateMachine {
  #maxID: number = 17;
  #idPool: number[] = Array.from({ length: 16 }, (v, i) => i + 2);
  #states: Map<number, State> = new Map();
  #stateName2ID: Map<string, number> = new Map();
  currentState: State; // entry
  #currentStateID: number; // entry
  #graph: Map<number, Map<number, Transition>> = new Map();

  constructor() {
    this.#states.set(-1, new State('Exit', new Animation).SetID(-1));
    this.#states.set(0, new State('AnyState', new Animation).SetID(0));
    this.#states.set(1, new State('Entry', new Animation).SetID(1));
    this.#stateName2ID.set('Exit', -1);
    this.#stateName2ID.set('AnyState', 0);
    this.#stateName2ID.set('Entry', 1);
    this.#currentStateID = 1;
    this.currentState = this.#states.get(this.#currentStateID)!;
  }

  GetState(stateName: string) {
    if (!this.#stateName2ID.has(stateName)) {
      return ErrorHelper.MethodError(this, `The state named ${stateName} does not exist!`);
    }
    return this.#states.get(this.#stateName2ID.get(stateName)!)!;
  }

  #AddState(state: State) {
    if (state.name === 'AnyState' || state.name === 'Entry' || state.name === 'Exit') {
      return ErrorHelper.MethodError(this, `${state.name} can not be used as a name for an new state!`);
    }
    if (this.#stateName2ID.has(state.name)) {
      console.warn(`The name ${state.name} has been used!`);
    }

    let id = this.#idPool.pop();
    if (this.#idPool.length === 0) {
      this.#idPool.push(...Array.from({ length: this.#maxID - 1 }, (v, i) => i + this.#maxID + 1));
      this.#maxID = 2 * this.#maxID - 1;
    }
    if (id) {
      state.id = id;
      this.#states.set(id, state);
      this.#stateName2ID.set(state.name, id);
    }
    return this;
  }
  AddState(...states: State[]) {
    for (let state of states) {
      this.#AddState(state);
    }
    return this;
  }
  #RemoveState(stateName: string) {
    if (stateName === 'AnyState' || stateName === 'Entry' || stateName === 'Exit') {
      return ErrorHelper.MethodError(this, `You can not delete internal state!`);
    }
    if (this.#stateName2ID.has(stateName)) {
      let id = this.#stateName2ID.get(stateName)!;
      this.#idPool.push(id);
      this.#stateName2ID.delete(stateName);
      this.#graph.delete(id);
      this.#graph.forEach(
        to => {
          to.delete(id);
        }
      );
    } else {
      return ErrorHelper.MethodError(this, `Does not exist state whose id is ${stateName}!`);
    }
    return this;
  }
  RemoveState(...stateNames: string[]) {
    for (let stateName of stateNames) {
      this.#RemoveState(stateName);
    }
    return this;
  }

  AddTransition(...transitions: Transition[]) {
    for (let transition of transitions) {
      let fromState = transition.fromState;
      let toState = transition.toState;
      if (!this.#stateName2ID.has(fromState.name)) {
        return ErrorHelper.MethodError(this, `The state named ${fromState.name} does not exist!`);
      }
      if (toState.name === 'AnyState') {
        return ErrorHelper.MethodError(this, `The state AnyState can not be the end of the transition!`);
      }
      if (!this.#stateName2ID.has(toState.name)) {
        return ErrorHelper.MethodError(this, `The state named ${toState.name} does not exist!`);
      }

      let fromID = this.#stateName2ID.get(fromState.name)!;
      let toID = this.#stateName2ID.get(toState.name)!;
      if (this.#graph.has(fromID)) {
        this.#graph.get(fromID)!.set(toID, transition);
      } else {
        this.#graph.set(fromID, new Map([[toID, transition]]));
      }
    }

    return this;
  }
  RemoveTransition(...transitionInfos: { from: string; to: string }[]) {
    for (let info of transitionInfos) {
      if (!this.#stateName2ID.has(info.from)) {
        return ErrorHelper.MethodError(this, `The state named ${info.from} does not exist!`);
      }
      if (!this.#stateName2ID.has(info.to)) {
        return ErrorHelper.MethodError(this, `The state named ${info.to} does not exist!`);
      }
      let fromID = this.#stateName2ID.get(info.from)!;
      let toID = this.#stateName2ID.get(info.to)!;
      if (this.#graph.has(fromID) && this.#graph.get(fromID)!.has(toID)) {
        this.#graph.get(fromID)!.delete(toID);
      } else {
        return ErrorHelper.MethodError(this, `The transition from ${info.from} to ${info.to} does not exist!`);
      }
    }
    return this;
  }

  Transit(): boolean {
    let transitions = this.#graph.get(this.#currentStateID)!;
    let toID: number;
    let transition: Transition;
    for ([toID, transition] of transitions) {
      if (transition.CanTransit()) {
        transition.fromState.onExit();
        transition.toState.onEnter();
        transition.Reset();
        this.#currentStateID = toID;
        if (this.#currentStateID === this.#stateName2ID.get('Exit')!) {
          this.#currentStateID = this.#stateName2ID.get('Entry')!;
        }
        this.currentState = this.#states.get(this.#currentStateID)!;
        console.log(`Transition: ${transition.fromState.name} -> ${transition.toState.name}`);
        return true;
      }
    }
    return false;
  }
}

export class AnimatorController {
  #parameters: AnimationControllerParameters = new Map();
  //         layer            ASM
  #asms: Map<number, AnimationStateMachine> = new Map();

  constructor() {
    this.AddASM(0);
  }

  get stateMachines() {
    return this.#asms;
  }

  GetASM(layer: number = 0) {
    if (!this.#asms.has(layer)) {
      return ErrorHelper.MethodError(this, `You don't have the ASM of level ${layer}!`);
    }
    return this.#asms.get(layer)!;
  }
  AddASM(layer: number) {
    let entries = Array.from(this.#asms.entries());
    entries.push([layer, new AnimationStateMachine()]);
    entries.sort((a, b) => b[0] - a[0]);
    this.#asms = new Map(entries);
  }
  ChangeASMLayer(oldLayer: number, newLayer: number) {
    if (oldLayer === newLayer) {
      return;
    }
    if (!this.#asms.has(oldLayer)) {
      return ErrorHelper.MethodError(this, `You don't have the ASM of level ${oldLayer}!`);
    }
    let asm = this.#asms.get(oldLayer)!;
    this.#asms.delete(oldLayer);
    this.#asms.set(newLayer, asm);
    this.#asms = new Map(Array.from(this.#asms.entries()).sort((a, b) => b[0] - a[0]));
  }

  GetParameter<T extends ParameterConstructor>(this: AnimatorController, parameterName: string): Parameter<T> {
    if (this.#parameters.has(parameterName)) {
      return this.#parameters.get(parameterName)! as Parameter<T>;
    } else {
      return ErrorHelper.MethodError(this, `Parameter named ${parameterName} does not exist.`);
    }
  }
  AddParameter(this: AnimatorController, ...parameters: Parameter<ParameterConstructor>[]) {
    for (let param of parameters) {
      this.#parameters.set(param.name, param);
    }
    return this;
  }
  RemoveParameter(this: AnimatorController, ...parameterNames: string[]) {
    for (let paramName of parameterNames) {
      if (this.#parameters.delete(paramName)) {
        return this;
      } else {
        return ErrorHelper.MethodError(this, `Parameter named ${paramName} does not exist.`);
      }
    }
  }

  SetNumber(this: AnimatorController, parameterName: string, newVal: number) {
    if (!this.#parameters.has(parameterName)) {
      return ErrorHelper.MethodError(this, `Parameter named ${parameterName} does not exist.`);
    }
    if (this.#parameters.get(parameterName)!.type !== Number) {
      return ErrorHelper.MethodError(this, `Parameter ${parameterName} is not a number.`);
    }
    this.#parameters.get(parameterName)!.val = newVal;
    // this.UpdateASM();
  }
  SetBool(this: AnimatorController, parameterName: string, newVal: boolean) {
    if (!this.#parameters.has(parameterName)) {
      return ErrorHelper.MethodError(this, `Parameter named ${parameterName} does not exist.`);
    }
    if (this.#parameters.get(parameterName)!.type !== Boolean) {
      return ErrorHelper.MethodError(this, `Parameter ${parameterName} is not a bool.`);
    }
    this.#parameters.get(parameterName)!.val = newVal;
  }
}