import _ from "lodash";
import { ColorStop, ErrorHelper, IsCanvas, IsType, MapTypeAllTo, Pos, RequiredDeep, Size, } from "../utils/Utilities";
import { Geometry } from "./Geometry/Geometry";
import { Img } from "./Img";
import { Renderable } from "./Renderable";
import { Text } from "./Text";

/** 
 * 声明Renderer绘图相关配置的类型, 它用于限制外部传入参数对象.
 */
export type RendererSettings = {
  global?: {
    filter?: string;
    alpha?: number;
    compositing?: string;
  };
  style?: {
    strokeFirst?: boolean;
    stroke?: string | CanvasGradient | CanvasPattern;
    fill?: string | CanvasGradient | CanvasPattern;
    fillRule?: CanvasFillRule;
  };
  path?: {
    cap?: CanvasLineCap;
    dashOffset?: number;
    join?: CanvasLineJoin;
    width?: number;
    miterLimit?: number;
  };
  shadow?: {
    blur?: number;
    color?: string;
    offsetX?: number;
    offsetY?: number;
  };
  text?: {
    direction?: CanvasDirection;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  };
  imgSmoothing?: {
    enabled?: boolean;
    quality?: ImageSmoothingQuality;
  };
}

/** 
 * 去除TypeRendererSettings可选属性的版本.
 * 在Renderer.ApplySettings函数中, 索引settings2CanvasPropsMap时需要用到该类型的键.
 */
export type AllRendererSettings = RequiredDeep<RendererSettings>;

const settings2CanvasPropsMap = {
  global: {
    filter: 'filter' as keyof CanvasFilters,
    alpha: 'globalAlpha' as keyof CanvasCompositing,
    compositing: 'globalCompositeOperation' as keyof CanvasCompositing,
  },
  style: {
    stroke: 'strokeStyle' as keyof CanvasFillStrokeStyles,
    fill: 'fillStyle' as keyof CanvasFillStrokeStyles,
  },
  path: {
    cap: 'lineCap' as keyof CanvasPathDrawingStyles,
    dashOffset: 'lineDashOffset' as keyof CanvasPathDrawingStyles,
    join: 'lineJoin' as keyof CanvasPathDrawingStyles,
    width: 'lineWidth' as keyof CanvasPathDrawingStyles,
    miterLimit: 'miterLimit' as keyof CanvasPathDrawingStyles,
  },
  shadow: {
    blur: 'shadowBlur' as keyof CanvasShadowStyles,
    color: 'shadowColor' as keyof CanvasShadowStyles,
    offsetX: 'shadowOffsetX' as keyof CanvasShadowStyles,
    offsetY: 'shadowOffsetY' as keyof CanvasShadowStyles,
  },
  text: {
    direction: 'direction' as keyof CanvasTextDrawingStyles,
    font: 'font' as keyof CanvasTextDrawingStyles,
    align: 'textAlign' as keyof CanvasTextDrawingStyles,
    baseline: 'textBaseline' as keyof CanvasTextDrawingStyles,
  },
  imgSmoothing: {
    enabled: 'imageSmoothingEnabled' as keyof CanvasImageSmoothing,
    quality: 'imageSmoothingQuality' as keyof CanvasImageSmoothing,
  },
};

export type RendererFn<T extends Renderable<T>> =
  (this: Renderer, renderable: T, settings?: RendererSettings) => Renderer;
export class Renderer {
  #canvas!: HTMLCanvasElement;
  #ctx!: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement | null);
  constructor(canvas: HTMLCanvasElement | null, allowAlpha: boolean);
  constructor(canvasOrContext: HTMLCanvasElement | CanvasRenderingContext2D | null, allowAlpha = true) {
    if (IsCanvas(canvasOrContext)) {
      this.#canvas = canvasOrContext;
      if (!IsType(this.#canvas, 'null')) {
        let ctx = this.#canvas.getContext('2d', { alpha: allowAlpha });
        if (ctx) this.#ctx = ctx;
        else return ErrorHelper.RuntimeErr('Can not get context!');
      } else return ErrorHelper.ErrConstructorArgs(this.constructor, 'Got a null canvas!');
    } else {
      if (!IsType(canvasOrContext, 'null')) {
        this.#ctx = canvasOrContext;
        this.#canvas = this.#ctx.canvas;
      } else return ErrorHelper.ErrConstructorArgs(this.constructor, 'Got a null context!');
    }
  }

  get canvas() {
    return this.#canvas;
  }
  get ctx() {
    return this.#ctx;
  }

  ApplySetting
    <T extends keyof CanvasRenderingContext2D>(
      contextProp: T, value: CanvasRenderingContext2D[T]
    ) {
    this.#ctx[contextProp] = value;
    return this;
  }
  ApplySettings(this: Renderer, rendererSettings?: RendererSettings) {
    if (rendererSettings) {
      for (let category in rendererSettings) {
        if (!(category in settings2CanvasPropsMap)) continue;
        let settings = rendererSettings[category as keyof RendererSettings];
        for (let name in settings) {
          if (!(name in settings2CanvasPropsMap[category as keyof AllRendererSettings])) continue;
          this.ApplySetting(
            settings2CanvasPropsMap
            [category as keyof AllRendererSettings]
            [name as keyof AllRendererSettings[keyof AllRendererSettings]],
            settings[name as keyof RendererSettings[keyof RendererSettings]]
          );
        }
      }
    }
  }

  ClearCanvas(this: Renderer) {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    return this;
  }

  Save(this: Renderer) {
    this.#ctx.save();
    return this;
  }
  Translate(this: Renderer, pos: Pos) {
    this.#ctx.translate(pos.x, pos.y);
    return this;
  }
  Rotate(this: Renderer, alpha: number) {
    this.#ctx.rotate(alpha);
    return this;
  }
  Scale(this: Renderer, scale: Pos) {
    this.#ctx.scale(scale.x, scale.y);
    return this;
  }
  Restore(this: Renderer) {
    this.#ctx.restore();
    return this;
  }

  With(callback: Function, ...args: any[]): this {
    this.#ctx.save();
    callback.apply(undefined, args);
    this.#ctx.restore();
    return this;
  }

  DrawText<T extends Text>(this: Renderer, text: T, rendererSettings?: RendererSettings) {
    if (text.IsEmpty()) return this;

    this.#ctx.save();
    if (rendererSettings) {
      rendererSettings.text = text.settings;
      this.ApplySettings(rendererSettings);
    } else {
      this.ApplySettings({ text: text.settings });
    }
    if (rendererSettings && rendererSettings.style && rendererSettings.style.strokeFirst) {
      this.#ctx.strokeText(text.text, text.pos.x, text.pos.y, text.maxWidth);
      this.#ctx.fillText(text.text, text.pos.x, text.pos.y, text.maxWidth);
    } else {
      this.#ctx.fillText(text.text, text.pos.x, text.pos.y, text.maxWidth);
      this.#ctx.strokeText(text.text, text.pos.x, text.pos.y, text.maxWidth);
    }
    if (!text.measure) text.SetMeasure(this.#ctx.measureText(text.text));
    this.#ctx.restore();
    return this;
  }
  DrawImage<T extends Img>(this: Renderer, img: T, rendererSettings?: RendererSettings) {
    if (img.IsEmpty()) return this;
    this.#ctx.save();
    this.ApplySettings(rendererSettings);
    this.#ctx.drawImage(
      img.image!,
      img.src.pos.x, img.src.pos.y,
      img.src.size.width, img.src.size.height,
      img.dest.pos.x, img.dest.pos.y,
      img.dest.size.width, img.dest.size.height,
    );
    this.#ctx.restore();
    return this;
  }
  DrawGeometry<T extends Geometry>(this: Renderer, geometry: T, rendererSettings?: RendererSettings) {
    if (geometry.IsEmpty()) return this;

    let path = geometry.path;

    this.#ctx.save();
    this.ApplySettings(rendererSettings);
    if (rendererSettings && rendererSettings.style && rendererSettings.style.strokeFirst) {
      this.#ctx.stroke(path);
      this.#ctx.fill(path);
    } else {
      this.#ctx.fill(path);
      this.#ctx.stroke(path);
    }
    this.#ctx.restore();

    return this;
  }
  DrawPath(this: Renderer, path: Path2D, rendererSettings?: RendererSettings) {
    this.#ctx.save();
    this.ApplySettings(rendererSettings);
    if (rendererSettings && rendererSettings.style && rendererSettings.style.strokeFirst) {
      this.#ctx.stroke(path);
      this.#ctx.fill(path);
    } else {
      this.#ctx.fill(path);
      this.#ctx.stroke(path);
    }
    this.#ctx.restore();

    return this;
  }

  CreateLinearGradient(this: Renderer, from: IPos, to: IPos, colorStops: ColorStop[]) {
    let g = this.#ctx.createLinearGradient(
      from.x,
      from.y,
      to.x,
      to.y,
    );
    if (colorStops) {
      colorStops.forEach((colorStop) => {
        g.addColorStop(colorStop.offset, colorStop.color);
      });
    }
    return g;
  }
  CreateRadialGradient(this: Renderer, fromCircle: ICircle, toCircle: ICircle, colorStops: ColorStop[]) {
    let g = this.#ctx.createRadialGradient(
      fromCircle.pos.x,
      fromCircle.pos.y,
      fromCircle.radius,
      toCircle.pos.x,
      toCircle.pos.y,
      toCircle.radius
    );
    if (colorStops) {
      colorStops.forEach((colorStop) => {
        g.addColorStop(colorStop.offset, colorStop.color);
      });
    }
    return g;
  }
  CreatePattern(this: Renderer, img: CanvasImageSource, type: string = '') {
    return this.#ctx.createPattern(img, type);
  }
}