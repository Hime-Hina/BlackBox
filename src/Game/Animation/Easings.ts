export type EasingFunction = (t: number) => number;
interface _IEasings {
  linear: EasingFunction,
  easeInSine: EasingFunction,
  easeOutSine: EasingFunction,
  easeInOutSine: EasingFunction,
  easeInQuad: EasingFunction,
  easeOutQuad: EasingFunction,
  easeInOutQuad: EasingFunction,
  easeInCubic: EasingFunction,
  easeOutCubic: EasingFunction,
  easeInOutCubic: EasingFunction,
  easeInQuart: EasingFunction,
  easeOutQuart: EasingFunction,
  easeInOutQuart: EasingFunction,
  easeInQuint: EasingFunction,
  easeOutQuint: EasingFunction,
  easeInOutQuint: EasingFunction,
  easeInExpo: EasingFunction,
  easeOutExpo: EasingFunction,
  easeInOutExpo: EasingFunction,
  easeInCirc: EasingFunction,
  easeOutCirc: EasingFunction,
  easeInOutCirc: EasingFunction,
  easeInBack: EasingFunction,
  easeOutBack: EasingFunction,
  easeInOutBack: EasingFunction,
  easeInElastic: EasingFunction,
  easeOutElastic: EasingFunction,
  easeInOutElastic: EasingFunction,
  easeInBounce: EasingFunction,
  easeOutBounce: EasingFunction,
  easeInOutBounce: EasingFunction,
}
export type IEasings = Readonly<_IEasings>;

const PI = Math.PI;

export const Easings: IEasings = {
  linear: t => t,
  easeInSine: t => 1 - Math.cos((PI * t) / 2),
  easeOutSine: t => Math.sin((PI * t) / 2),
  easeInOutSine: t => -(Math.cos(PI * t) - 1) / 2,
  easeInQuad: t => t * t,
  easeOutQuad: t => 1 - (1 - t) * (1 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  easeInQuint: t => t * t * t * t * t,
  easeOutQuint: t => 1 - Math.pow(1 - t, 5),
  easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  easeInCirc: t => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: t => Math.sqrt(1 - (t - 1) * (t - 1)),
  easeInOutCirc: t => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
  easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  easeInOutBack: t => t < 0.5 ? (Math.pow(2 * t, 2) * ((2.5949095 + 1) * 2 * t - 2.5949095)) / 2 : (Math.pow(2 * t - 2, 2) * ((2.5949095 + 1) * (t * 2 - 2) + 2.5949095) + 2) / 2,
  easeInElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * 2.0943951023931953),
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.0943951023931953) + 1,
  easeInOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * 1.3962634015954636)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * 1.3962634015954636)) / 2 + 1,
  easeInBounce: t => 1 - Easings.easeOutBounce(1 - t),
  easeOutBounce: t => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  easeInOutBounce: t => t < 0.5 ? (1 - Easings.easeOutBounce(1 - 2 * t)) / 2 : (1 + Easings.easeOutBounce(2 * t - 1)) / 2,
};
