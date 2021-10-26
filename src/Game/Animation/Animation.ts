import { ErrorHelper } from "../utils/Utilities";
import { EasingFunction, Easings, IEasings } from "./Easings";

export type AnimationStates = 'init' | 'start' | 'play' | 'pause' | 'end';
export type AnimationEventFn = (...args: any[]) => void;
export interface AnimationConfig {
  loop?: boolean;
  duration: number;
  values?: [number, number][];
  path?: SVGGeometryElement;
  renderFn: (val1: number, val2: number) => void;
  timingFn?: keyof IEasings;
  onStart?: AnimationEventFn;
  onPlay?: AnimationEventFn;
  onPause?: AnimationEventFn;
  onEnd?: AnimationEventFn;
}

export class Animation {
  #isLoop: boolean;
  #prevTimeStamp: number = 0;
  #nowTimeStamp: number = 0;
  #totalDuration: number;
  #nowDuration: number = 0;
  #animFrameRequestID: number = 0;
  #state: AnimationStates = 'init';
  #values?: {start: number; end: number}[];
  #path?: SVGGeometryElement;
  #renderFn: (...args: number[]) => void;
  #timingFn: keyof IEasings;
  onStart?: AnimationEventFn;
  onPlay?: AnimationEventFn;
  onPause?: AnimationEventFn;
  onEnd?: AnimationEventFn;

  constructor(configs: AnimationConfig) {
    this.#isLoop = configs.loop ? configs.loop : false;
    this.#totalDuration = configs.duration;
    if (configs.values) {
      this.#values = [];
      configs.values.forEach(
        val => {
          this.#values!.push({
            start: val[0],
            end: val[1]
          });
        }
      );
    } else if (configs.path) {
      this.#path = configs.path;
    } else {
      ErrorHelper.ErrConstructorArgs(this.constructor, 'The argument must be provided: values or path!');
    }
    this.#renderFn = configs.renderFn;
    this.#timingFn = configs.timingFn || 'linear';
    this.onStart = configs.onStart;
    this.onPlay = configs.onPlay;
    this.onPause = configs.onPause;
    this.onEnd = configs.onEnd;
  }

  #Reset() {
    this.#state = 'init';
    this.#nowDuration = 0;
    this.#nowTimeStamp = 0;
    this.#prevTimeStamp = 0;
  }
  #Loop = () => {
    this.#nowTimeStamp = window.performance.now();
    this.#nowDuration += this.#nowTimeStamp - this.#prevTimeStamp;
    this.#prevTimeStamp = this.#nowTimeStamp;

    if (this.onPlay) this.onPlay();
    if (this.#nowDuration >= this.#totalDuration) {
      this.#state = 'end';
      if (this.onEnd) this.onEnd();
      this.#ApplyRenderFn(1);
      if (this.#isLoop) {
        this.#Reset();
        this.Play();
      } 
    } else {
      this.#ApplyRenderFn(this.#nowDuration / this.#totalDuration);
      this.#animFrameRequestID = window.requestAnimationFrame(this.#Loop);
    }
  }
  #ApplyRenderFn(ratio: number) {
    if (this.#values) {
      const vals = this.#values.map(
        value => Animation.Lerp(
          value.start,
          value.end,
          Easings[this.#timingFn](ratio)
        )
      );
      this.#renderFn.apply(this, vals);
    } else if (this.#path) {
      const length = this.#path.getTotalLength();
      const point = this.#path.getPointAtLength(Easings[this.#timingFn](ratio) * length);
      this.#renderFn.apply(this,
        [point.x, point.y]
      );
    }
  }

  Next() {
    this.#nowDuration += 16;

    if (this.onPlay) this.onPlay();
    if (this.#nowDuration >= this.#totalDuration) {
      this.#state = 'end';
      if (this.onEnd) this.onEnd();
      this.#ApplyRenderFn(1);
      if (this.#isLoop) {
        this.#Reset();
        this.Next();
      } 
    } else {
      this.#ApplyRenderFn(this.#nowDuration / this.#totalDuration);
    }
    return this;
  }

  Play() {
    this.#state = 'play';

    if (this.onStart) this.onStart();
    this.#prevTimeStamp = window.performance.now();
    this.#animFrameRequestID = window.requestAnimationFrame(this.#Loop);
    return this;
  }

  Pause() {
    this.#state = 'pause';

    if (this.onPause) this.onPause();
    window.cancelAnimationFrame(this.#animFrameRequestID);
    return this;
  }

  Stop() {
    this.#state = 'init';
    this.#nowDuration = 0;
    window.cancelAnimationFrame(this.#animFrameRequestID);
    return this;
  }

  static Lerp(start: number, end: number, t: number) {
    return (1 - t) * start + t * end;
  }
}