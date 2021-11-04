export type EasingFunction = (t: number) => number;
interface _IEasings {
  linear: EasingFunction,
  InSine: EasingFunction,
  OutSine: EasingFunction,
  InOutSine: EasingFunction,
  InQuad: EasingFunction,
  OutQuad: EasingFunction,
  InOutQuad: EasingFunction,
  InCubic: EasingFunction,
  OutCubic: EasingFunction,
  InOutCubic: EasingFunction,
  InQuart: EasingFunction,
  OutQuart: EasingFunction,
  InOutQuart: EasingFunction,
  InQuint: EasingFunction,
  OutQuint: EasingFunction,
  InOutQuint: EasingFunction,
  InExpo: EasingFunction,
  OutExpo: EasingFunction,
  InOutExpo: EasingFunction,
  InCirc: EasingFunction,
  OutCirc: EasingFunction,
  InOutCirc: EasingFunction,
  InBack: EasingFunction,
  OutBack: EasingFunction,
  InOutBack: EasingFunction,
  InElastic: EasingFunction,
  OutElastic: EasingFunction,
  InOutElastic: EasingFunction,
  InBounce: EasingFunction,
  OutBounce: EasingFunction,
  InOutBounce: EasingFunction,
}
export type IEasings = Readonly<_IEasings>;

const PI = Math.PI;

export const Easings: IEasings = {
  linear: t => t,
  InSine: t => 1 - Math.cos((PI * t) / 2),
  OutSine: t => Math.sin((PI * t) / 2),
  InOutSine: t => -(Math.cos(PI * t) - 1) / 2,
  InQuad: t => t * t,
  OutQuad: t => 1 - (1 - t) * (1 - t),
  InOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  InCubic: t => t * t * t,
  OutCubic: t => 1 - Math.pow(1 - t, 3),
  InOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  InQuart: t => t * t * t * t,
  OutQuart: t => 1 - Math.pow(1 - t, 4),
  InOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  InQuint: t => t * t * t * t * t,
  OutQuint: t => 1 - Math.pow(1 - t, 5),
  InOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  InExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  OutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  InOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  InCirc: t => 1 - Math.sqrt(1 - t * t),
  OutCirc: t => Math.sqrt(1 - (t - 1) * (t - 1)),
  InOutCirc: t => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  InBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
  OutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  InOutBack: t => t < 0.5 ? (Math.pow(2 * t, 2) * ((2.5949095 + 1) * 2 * t - 2.5949095)) / 2 : (Math.pow(2 * t - 2, 2) * ((2.5949095 + 1) * (t * 2 - 2) + 2.5949095) + 2) / 2,
  InElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * 2.0943951023931953),
  OutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.0943951023931953) + 1,
  InOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * 1.3962634015954636)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * 1.3962634015954636)) / 2 + 1,
  InBounce: t => 1 - Easings.OutBounce(1 - t),
  OutBounce: t => {
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
  InOutBounce: t => t < 0.5 ? (1 - Easings.OutBounce(1 - 2 * t)) / 2 : (1 + Easings.OutBounce(2 * t - 1)) / 2,
};
