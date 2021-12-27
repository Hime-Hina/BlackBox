import _ from "lodash";
import { ErrorHelper } from "../utils/Utilities";
import { EasingFunction, Easings, IEasings } from "./Easings";

export type TweenStates = 'none' | 'init' | 'play' | 'pause' | 'end';
export type TweenEventFn = (thisTween: Tween, ...args: any[]) => void;
export type EasingObject = { [prop: string | number | symbol]: number };
export interface TweenConfig {
  loop?: boolean;
  duration: number;
  values?: [number, number][];
  path?: SVGGeometryElement;
  renderFn: () => void;
  timingFn?: keyof IEasings;
  onStart?: TweenEventFn;
  onPlay?: TweenEventFn;
  onPause?: TweenEventFn;
  onEnd?: TweenEventFn;
}

export class Tween {
  #isFromObjSet: boolean = false;
  #isToObjSet: boolean = false;
  #fromObj?: EasingObject;
  #lastEasingObj?: EasingObject;
  #easingObj?: EasingObject;
  #toObj?: EasingObject;
  #toObjEntries?: [string, number][];
  #isLoop: boolean = false;
  #prevTimeStamp: number = 0;
  #nowTimeStamp: number = 0;
  #totalDuration: number = 1000;
  #nowDuration: number = 0;
  #animFrameRequestID: number = 0;
  #stateID: number = 0;
  static state2ID: {[state in  TweenStates]: number} = {
    'none': 0,
    'init': 1,
    'play': 2,
    'pause': 4,
    'end': 8,
  };
  static readonly stateChangeGraph: Map<number, Set<number>> = new Map();
  #path?: SVGGeometryElement;
  #easingFn: EasingFunction = Easings.linear;
  #onUpdate: TweenEventFn = () => {};
  #onStart: TweenEventFn = () => {};
  #onPause: TweenEventFn = () => {};
  #onEnd: TweenEventFn = () => {};

  static {
    Tween.stateChangeGraph.set(
      Tween.state2ID['none'],
      new Set()
    );
    Tween.stateChangeGraph.set(
      Tween.state2ID['init'],
      new Set([
        Tween.state2ID['play']
      ])
    );
    Tween.stateChangeGraph.set(
      Tween.state2ID['play'],
      new Set([
        Tween.state2ID['play'],
        Tween.state2ID['pause'],
        Tween.state2ID['end'],
        Tween.state2ID['init'],
      ])
    );
    Tween.stateChangeGraph.set(
      Tween.state2ID['pause'],
      new Set([
        Tween.state2ID['play'],
        Tween.state2ID['init'],
      ])
    );
    Tween.stateChangeGraph.set(
      Tween.state2ID['end'],
      new Set([
        Tween.state2ID['init'],
      ])
    );
  }

  constructor(obj?: EasingObject) {
    this.#stateID = Tween.state2ID['none'];
    if (obj) {
      this.From(obj);
    }
  }

  SetLoop(isLoop: boolean) {
    this.#isLoop = isLoop;
    return this;
  }

  From(easingObj: EasingObject) {
    this.#isFromObjSet = true;
    this.#easingObj = easingObj;
    this.#lastEasingObj = _.cloneDeep(this.#easingObj);
    this.#fromObj = _.cloneDeep(this.#easingObj);
    return this;
  }
  To(toObj: EasingObject, lasts?: number) {
    this.#isToObjSet = true;
    this.#toObj = toObj;
    this.#toObjEntries = Object.entries(toObj);

    if (lasts) this.#totalDuration = lasts;
    return this;
  }

  Easing(easingFn: EasingFunction) {
    this.#easingFn = easingFn;
    return this;
  }

  OnStart(fn: TweenEventFn) {
    this.#onStart = fn;
    return this;
  }
  OnUpdate(fn: TweenEventFn) {
    this.#onUpdate = fn;
    return this;
  }
  OnPause(fn: TweenEventFn) {
    this.#onPause = fn;
    return this;
  }
  OnEnd(fn: TweenEventFn) {
    this.#onEnd = fn;
    return this;
  }

  get stateID() {
    return this.#stateID;
  }
  get isLoop() {
    return this.#isLoop;
  }
  IsInit() {
    return this.#stateID === Tween.state2ID['init']; 
  }
  IsPlaying() {
    return this.#stateID === Tween.state2ID['play']; 
  }
  IsPaused() {
    return this.#stateID === Tween.state2ID['pause']; 
  }
  IsEnded() {
    return this.#stateID === Tween.state2ID['end']; 
  }
  CanChangeStateTo(toState: TweenStates) {
    return Tween.stateChangeGraph.has(this.#stateID)
        && Tween.stateChangeGraph.get(this.#stateID)!.has(Tween.state2ID[toState]);
  }

  Reset() {
    this.#stateID = Tween.state2ID['init'];
    this.#nowDuration = 0;
  }
  Play() {
    if (!this.CanChangeStateTo('play')) return;

    this.#stateID = Tween.state2ID['play'];
    this.#prevTimeStamp = window.performance.now();
    this.#animFrameRequestID = window.requestAnimationFrame(this.#Loop);
    this.#onStart(this);
    return this;
  }
  Pause() {
    if (!this.CanChangeStateTo('pause')) return;

    this.#stateID = Tween.state2ID['pause'];
    this.#onPause(this);
    window.cancelAnimationFrame(this.#animFrameRequestID);
    return this;
  }
  Stop() {
    if (!this.CanChangeStateTo('init')) return;

    this.#stateID = Tween.state2ID['init'];
    this.#nowDuration = 0;
    window.cancelAnimationFrame(this.#animFrameRequestID);
    return this;
  }
  Animate() {
    if (this.#fromObj && this.#toObj) {
      this.Reset();
    }
    return this;
  }
  StopAnimating() {
    this.#stateID = Tween.state2ID['none'];
    this.#nowDuration = 0;
    return this;
  }

  #Ease(ratio: number) {
    if (!this.#easingObj || !this.#lastEasingObj || !this.#fromObj) return;
    if (this.#toObj && this.#toObjEntries) {
      let i = 0;
      while (i < this.#toObjEntries.length) {
        this.#lastEasingObj[
          this.#toObjEntries[i][0] as keyof EasingObject
        ] = this.#easingObj[
          this.#toObjEntries[i][0] as keyof EasingObject
        ];
        this.#easingObj[
          this.#toObjEntries[i][0] as keyof EasingObject
        ] = Tween.Lerp(
          this.#fromObj[this.#toObjEntries[i][0] as keyof EasingObject],
          this.#toObjEntries[i][1], this.#easingFn(ratio)
        );
        ++i;
      }
    } else if (this.#path) {
      const length = this.#path.getTotalLength();
      const point = this.#path.getPointAtLength(this.#easingFn(ratio) * length);
    }
  }
  #Loop = () => {
    if (!this.CanChangeStateTo('play')) return;

    this.#nowTimeStamp = window.performance.now();
    this.#nowDuration += this.#nowTimeStamp - this.#prevTimeStamp;
    this.#prevTimeStamp = this.#nowTimeStamp;

    if (this.#nowDuration >= this.#totalDuration) {
      this.#stateID = Tween.state2ID['end'];
      this.#Ease(1);
      this.#onEnd(this);
      if (this.#isLoop) {
        this.Reset();
        this.Play();
      } 
    } else {
      this.#Ease(this.#nowDuration / this.#totalDuration);
      this.#animFrameRequestID = window.requestAnimationFrame(this.#Loop);
    }
    this.#onUpdate(this, this.#easingObj, this.#lastEasingObj);
  }
  Update(timeStamp: number) {
    if (this.#stateID !== Tween.state2ID['play']) {
      this.#prevTimeStamp = timeStamp;
      if (this.CanChangeStateTo('play')) {
        this.#stateID = Tween.state2ID['play'];
        this.#nowDuration = 0;
        this.#onStart(this);
      } else return;
    }

    this.#nowTimeStamp = timeStamp;
    this.#nowDuration += this.#nowTimeStamp - this.#prevTimeStamp;
    this.#prevTimeStamp = this.#nowTimeStamp;

    if (this.#nowDuration >= this.#totalDuration) {
      this.#stateID = Tween.state2ID['end'];
      this.#Ease(1);
      this.#onEnd(this);
      if (this.#isLoop) {
        this.Reset();
        this.Play();
      } 
    } else {
      this.#Ease(this.#nowDuration / this.#totalDuration);
    }
    this.#onUpdate(this, this.#easingObj, this.#lastEasingObj);

    return this;
  }

  static Lerp(start: number, end: number, t: number) {
    return (1 - t) * start + t * end;
  }
}