import _ from "lodash";
import { ColorStop, ErrorHelper, IsCanvas, IsType, MapTypeAllTo, Pos, RequiredDeep, Size, } from "../utils/Utilities";
import { Vector3 } from "../utils/Vector";

/** 
 * 声明Renderer绘图相关配置的类型, 它用于限制外部传入参数对象.
 */
export type TypeRendererSettings = {
  global?: {
    filter?: string;
    alpha?: number;
    compositing?: string;
  };
  style?: {
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
type TypeAllRendererSettings = RequiredDeep<TypeRendererSettings>;

/**
 * 声明类型从TypeRendererSettings的键映射到canvas绘图环境(context)的属性(键).
 */
type TypeRendererSettingsToCanvasPropsMap = {
  global: {
    filter: 'filter';
    alpha: 'globalAlpha';
    compositing: 'globalCompositeOperation';
  };
  style: {
    stroke: 'strokeStyle';
    fill: 'fillStyle';
  };
  path: {
    cap: 'lineCap';
    dashOffset: 'lineDashOffset';
    join: 'lineJoin';
    width: 'lineWidth';
    miterLimit: 'miterLimit';
  };
  shadow: {
    blur: 'shadowBlur';
    color: 'shadowColor';
    offsetX: 'shadowOffsetX';
    offsetY: 'shadowOffsetY';
  };
  text: {
    direction: 'direction';
    font: 'font';
    align: 'textAlign';
    baseline: 'textBaseline';
  };
  imgSmoothing: {
    enabled: 'imageSmoothingEnabled';
    quality: 'imageSmoothingQuality';
  };
};

/** 
 * 严格版本的TypeRendererSettingsToCanvasPropsMap, 防止多余的属性混入.
 * 将无限制的字面量类型映射到CanvasRenderingContext2D的属性.
 */
type StrictTypeRendererSettingsToCanvasPropsMap = MapTypeAllTo<TypeRendererSettingsToCanvasPropsMap, keyof CanvasRenderingContext2D>;

//           "2" means "to"
//            |
//            V
const settings2CanvasPropsMap: StrictTypeRendererSettingsToCanvasPropsMap = {
  global: {
    filter: 'filter',
    alpha: 'globalAlpha',
    compositing: 'globalCompositeOperation',
  },
  style: {
    stroke: 'strokeStyle',
    fill: 'fillStyle',
  },
  path: {
    cap: 'lineCap',
    dashOffset: 'lineDashOffset',
    join: 'lineJoin',
    width: 'lineWidth',
    miterLimit: 'miterLimit',
  },
  shadow: {
    blur: 'shadowBlur',
    color: 'shadowColor',
    offsetX: 'shadowOffsetX',
    offsetY: 'shadowOffsetY',
  },
  text: {
    direction: 'direction',
    font: 'font',
    align: 'textAlign',
    baseline: 'textBaseline',
  },
  imgSmoothing: {
    enabled: 'imageSmoothingEnabled',
    quality: 'imageSmoothingQuality',
  },
};

export interface ArcDrawingSettings {
  center: Pos;
  width: number;
  height?: number;
  rotation?: number;
  startAngle?: number;
  endAngle?: number;
  drawingDirectionFromY2X?: boolean;
}
type AllArcDrawingSettings = RequiredDeep<ArcDrawingSettings>;

export interface RectDrawingSettings {
  center: Pos;
  size?: Size;
}
type AllRectDrawingSettings = RequiredDeep<RectDrawingSettings>;

export interface ImageDrawingSettings {
  src?: {
    topLeft: Pos;
    size: Size;
  };
  dest: {
    topLeft: Pos;
    size?: Size;
  }
}
type AllImageDrawingSettings = RequiredDeep<ImageDrawingSettings>;

export class Renderer {
  #canvas!: HTMLCanvasElement;
  #ctx!: CanvasRenderingContext2D;

  static #defaultArcDrawingSettings: AllArcDrawingSettings = {
    center: new Pos(),
    width: 40,
    height: 40,
    rotation: 0,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    drawingDirectionFromY2X: false,
  };
  static #defaultRectDrawingSettings: AllRectDrawingSettings = {
    center: new Pos(),
    size: new Size(),
  };
  static #defaultImgaeDrawingSettings: AllImageDrawingSettings = {
    src: {
      topLeft: new Pos(),
      size: new Size(),
    },
    dest: {
      topLeft: new Pos(),
      size: new Size(),
    }
  };

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

  get ctx() {
    return this.#ctx;
  }

  ApplySettings(this: Renderer, rendererSettings?: TypeRendererSettings) {
    if (!IsType(rendererSettings, 'undefined')) {
      _.forIn(rendererSettings, (configs, settingName, settingsObj) => {
        _.forIn(configs, (configValue, configName, configsObj) => {
          // console.log(`[${settingName}][${configName}] = ${configValue}`);
          this.#ctx[
            settings2CanvasPropsMap
            [settingName as keyof TypeAllRendererSettings]
            [configName as keyof TypeAllRendererSettings[keyof TypeAllRendererSettings]]
          ] = configValue;
        });
      });
    }
  }

  ClearCanvas(this: Renderer) {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  Translate(pos: Pos) {
    this.#ctx.translate(pos.x, pos.y);
  }
  Rotate(alpha: number) {
    this.#ctx.rotate(alpha);
  }
  Scale(scale: Pos) {
    this.#ctx.scale(scale.x, scale.y);
  }

  With(callback: Function, ...args: any[]): this {
    this.#ctx.save();
    callback.apply(undefined, args);
    this.#ctx.restore();
    return this;
  }

  DrawImage(this: Renderer,img: CanvasImageSource, imgSettings?: ImageDrawingSettings, rendererSettings?: TypeRendererSettings) {
    let fullSettings: AllImageDrawingSettings;
    fullSettings = _.defaultsDeep({}, imgSettings);
    fullSettings = _.defaultsDeep(fullSettings, Renderer.#defaultImgaeDrawingSettings);
    if (IsType(imgSettings, 'undefined')) {
      fullSettings.src.size.width = img.width as number;
      fullSettings.src.size.height = img.height as number;
      fullSettings.dest.size.width = img.width as number;
      fullSettings.dest.size.height = img.height as number;
    } else {
      if (IsType(imgSettings.src, 'undefined')) {
        fullSettings.src.size.width = img.width as number;
        fullSettings.src.size.height = img.height as number;
      }
      if (IsType(imgSettings.dest.size, 'undefined')) {
        fullSettings.dest.size.width = img.width as number;
        fullSettings.dest.size.height = img.height as number;
      }
    }

    this.ApplySettings(rendererSettings);
    this.#ctx.drawImage(
      img,
      fullSettings.src.topLeft.x, fullSettings.src.topLeft.y,
      fullSettings.src.size.width, fullSettings.src.size.height,
      fullSettings.dest.topLeft.x, fullSettings.dest.topLeft.y,
      fullSettings.dest.size.width, fullSettings.dest.size.height,
    );

    return this;
  }

  DrawSegment(this: Renderer, startPos: Pos, endPos: Pos, rendererSettings?: TypeRendererSettings) {
    this.#ctx.save();

    this.#ctx.beginPath();
    this.#ctx.moveTo(startPos.x, startPos.y);
    this.#ctx.lineTo(endPos.x, endPos.y);

    this.ApplySettings(rendererSettings);
    this.#ctx.stroke();
    this.#ctx.closePath();

    this.#ctx.restore();

    return this;
  }
  DrawRect(this: Renderer, rectSettings: RectDrawingSettings, rendererSettings?: TypeRendererSettings) {
    let fullSettings: Required<RectDrawingSettings> = _.defaultsDeep({}, rectSettings);
    fullSettings = _.defaultsDeep(fullSettings, Renderer.#defaultRectDrawingSettings);

    this.#ctx.save();

    this.#ctx.beginPath();
    this.#ctx.rect(
      fullSettings.center.x - fullSettings.size.width / 2,
      fullSettings.center.y - fullSettings.size.height / 2,
      fullSettings.size.width, fullSettings.size.height
    );

    this.ApplySettings(rendererSettings);
    this.#ctx.fill();
    this.#ctx.stroke();
    this.#ctx.closePath();

    this.#ctx.restore();

    return this;
  }
  DrawPolygon(this: Renderer, start: Vector3, edges: Vector3[], rendererSettings?: TypeRendererSettings) {
    this.#ctx.save();

    this.#ctx.beginPath();
    let i = 0, x = start.x, y = start.y;
    this.#ctx.moveTo(x, y);
    while (i < edges.length) {
      x += edges[i].x, y += edges[i].y;
      this.#ctx.lineTo(x, y);
      ++i;
    }
    this.#ctx.closePath();
    // this.#ctx.lineTo(start.x, start.y);

    this.ApplySettings(rendererSettings);
    this.#ctx.fill();
    this.#ctx.stroke();

    this.#ctx.restore();

    return this;
  }
  DrawArc(this: Renderer, arcSettings: ArcDrawingSettings, rendererSettings?: TypeRendererSettings) {
    let fullSettings: Required<ArcDrawingSettings> = _.defaultsDeep({}, arcSettings);
    fullSettings = _.defaults(fullSettings, Renderer.#defaultArcDrawingSettings);
    if (IsType(arcSettings.height, 'undefined')) fullSettings.height = fullSettings.width;

    this.#ctx.save();

    this.#ctx.beginPath();
    this.#ctx.ellipse(
      fullSettings.center.x, fullSettings.center.y,
      fullSettings.width, fullSettings.height,
      fullSettings.rotation,
      fullSettings.startAngle, fullSettings.endAngle,
      fullSettings.drawingDirectionFromY2X
    );

    this.ApplySettings(rendererSettings);
    this.#ctx.fill();
    this.#ctx.stroke();
    this.#ctx.closePath();

    this.#ctx.restore();

    return this;
  }
  DrawPath(path: Path2D, rendererSettings?: TypeRendererSettings) {
    this.#ctx.save();
    this.ApplySettings(rendererSettings);
    this.#ctx.fill(path);
    this.#ctx.stroke(path);
    this.#ctx.restore();

    return this;
  }

  CreateLinearGradient(from: Pos, to: Pos, colorStops: ColorStop[]) {
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
  CreateRadialGradient(fromCircle: Circle, toCircle: Circle, colorStops: ColorStop[]) {
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
  CreatePattern(img: CanvasImageSource, type: string = '') {
    return this.#ctx.createPattern(img, type);
  }
}