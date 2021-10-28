import _, { size } from "lodash";
import { ColorStop, ErrorHelper, IsCanvas, IsType, MapTypeAllTo, Pos, RequiredDeep, Size, } from "../utils/Utilities";

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

// type TypeShapeNameToShape = {
//   'Rectangle': Rectangle,
//   'Polygon': Polygon,
//   'LineSegment': LineSegment,
//   'Ellipse': Ellipse,
//   'Circle': Circle,
// };
// type RenderShapeFunction<T> = (ctx: CanvasRenderingContext2D, r: T) => void;
// type TypeShapeNameToRenderFunction = {
//   [K in keyof TypeShapeNameToShape]: RenderShapeFunction<TypeShapeNameToShape[K]>;
// }

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
interface DrawingSettingsCache {
  arc: {
    arg: ArcDrawingSettings | null;
    settings: AllArcDrawingSettings;
  };
  rect: {
    arg: RectDrawingSettings | null;
    settings: AllRectDrawingSettings;
  };
  img: {
    arg: ImageDrawingSettings | null
    settings: AllImageDrawingSettings;
  };
}

export class Renderer {
  #canvas: HTMLCanvasElement | null = null;
  #ctx: CanvasRenderingContext2D | null = null;
  // static #ShapeNameToRenderFn: TypeShapeNameToRenderFunction = {
  //   'Rectangle': (ctx, r) => ctx.rect(r.pos.x, r.pos.y, r.size.width, r.size.height),
  //   'Circle': (ctx, c) => ctx.arc(c.pos.x, c.pos.y, c.radius, 0, 2 * Math.PI),
  //   'Ellipse': (ctx, e) => ctx.ellipse(e.pos.x, e.pos.y, e.halfSize.width, e.halfSize.height, 0, 0, 2 * Math.PI),
  //   'LineSegment': (ctx, l) => { ctx.moveTo(l.pos.x, l.pos.y); ctx.lineTo(l.pos.x + l.direction.x, l.pos.y + l.direction.y); },
  //   'Polygon': (ctx, p) => {
  //     _.forEach(p.vertices, (vec2, indx, vertices) => {
  //       ctx.lineTo(vec2.x, vec2.y);
  //     });
  //     ctx.lineTo(p.vertices[0].x, p.vertices[0].y);
  //   },
  // };

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
  static #drawingSettingsCache: DrawingSettingsCache = {
    arc: {
      arg: null,
      settings: Renderer.#defaultArcDrawingSettings,
    },
    rect: {
      arg: null,
      settings: Renderer.#defaultRectDrawingSettings,
    },
    img: {
      arg: null,
      settings: Renderer.#defaultImgaeDrawingSettings,
    },
  };

  constructor(canvas: HTMLCanvasElement | null);
  constructor(canvas: HTMLCanvasElement | null, allowAlpha: boolean);
  constructor(canvasOrContext: HTMLCanvasElement | CanvasRenderingContext2D | null, allowAlpha = true) {
    if (IsCanvas(canvasOrContext)) {
      this.#canvas = canvasOrContext;
      if (!IsType(this.#canvas, 'null'))
        this.#ctx = this.#canvas.getContext('2d', { alpha: allowAlpha });
      else ErrorHelper.ErrConstructorArgs(this.constructor, 'Got a null canvas!');
    } else {
      this.#ctx = canvasOrContext;
      if (!IsType(this.#ctx, 'null'))
        this.#canvas = this.#ctx.canvas;
      else ErrorHelper.ErrConstructorArgs(this.constructor, 'Got a null context!');
    }
  }

  ApplySettings(this: Renderer, rendererSettings?: TypeRendererSettings) {
    if (!IsType(rendererSettings, 'undefined') && !IsType(this.#ctx, 'null')) {
      _.forIn(rendererSettings, (configs, settingName, settingsObj) => {
        _.forIn(configs, (configValue, configName, configsObj) => {
            // console.log(`[${settingName}][${configName}] = ${configValue}`);
            this.#ctx![
              settings2CanvasPropsMap
              [ settingName as keyof TypeAllRendererSettings ]
              [ configName as keyof TypeAllRendererSettings[keyof TypeAllRendererSettings] ]
            ] = configValue;
        });
      });
    }
  }

  ClearCanvas(this: Renderer) {
    if (this.#canvas && this.#ctx) this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  // Fill(this: Renderer, shape: RenderableShapeOr, rendererSettings?: TypeRendererSettings) {
  //   if (this.#ctx) {
  //     this.#ctx.save();
  //     if (!IsType(rendererSettings, 'undefined')) this.ApplySettings(rendererSettings);
  //     this.#ctx.beginPath();
  //     Renderer.#ShapeNameToRenderFn[shape.constructor.name as keyof TypeShapeNameToShape](this.#ctx, shape as RenderableShapeAnd);
  //     if (rendererSettings && rendererSettings.style && rendererSettings.style.fillRule) this.#ctx.fill(rendererSettings.style.fillRule);
  //     else this.#ctx.fill();
  //     this.#ctx.closePath();
  //     this.#ctx.restore();
  //   }
  // }

  // Stroke(this: Renderer, shape: RenderableShapeOr, rendererSettings?: TypeRendererSettings) {
  //   if (this.#ctx) {
  //     this.#ctx.save();
  //     this.#ctx.beginPath();
  //     if (!IsType(rendererSettings, 'undefined')) this.ApplySettings(rendererSettings);
  //     Renderer.#ShapeNameToRenderFn[shape.constructor.name as keyof TypeShapeNameToShape](this.#ctx, shape as RenderableShapeAnd);
  //     this.#ctx.stroke();
  //     this.#ctx.closePath();
  //     this.#ctx.restore();
  //   }
  // }

  DrawImage(this: Renderer, img: CanvasImageSource, imgSettings: ImageDrawingSettings, rendererSettings?: TypeRendererSettings) {
    if (this.#ctx) {
      let fullSettings: AllImageDrawingSettings;
      if (_.isEqual(Renderer.#drawingSettingsCache.img.arg, imgSettings)) {
        fullSettings = Renderer.#drawingSettingsCache.img.settings;
      } else {
        fullSettings = _.defaultsDeep({}, imgSettings);
        fullSettings = _.defaultsDeep(fullSettings, Renderer.#defaultImgaeDrawingSettings);
        if (!imgSettings.src) {
          fullSettings.src.size.width = img.width as number;
          fullSettings.src.size.height = img.height as number;
        }
        if (!imgSettings.dest.size) {
          fullSettings.dest.size.width = img.width as number;
          fullSettings.dest.size.height = img.height as number;
        }

        Renderer.#drawingSettingsCache.img.arg = _.cloneDeep(imgSettings);
        Renderer.#drawingSettingsCache.img.settings = fullSettings;
      }

      this.ApplySettings(rendererSettings);

      this.#ctx.drawImage(
        img,
        fullSettings.src.topLeft.x, fullSettings.src.topLeft.y,
        fullSettings.src.size.width, fullSettings.src.size.height,
        fullSettings.dest.topLeft.x, fullSettings.dest.topLeft.y,
        fullSettings.dest.size.width, fullSettings.dest.size.height,
      );
    }
  }

  DrawSegment(this: Renderer, startPos: Pos, endPos: Pos, rendererSettings?: TypeRendererSettings) {
    if (this.#ctx) {
      this.#ctx.save();

      this.#ctx.beginPath();
      this.#ctx.moveTo(startPos.x, startPos.y);
      this.#ctx.lineTo(endPos.x, endPos.y);

      this.ApplySettings(rendererSettings);
      this.#ctx.stroke();
      this.#ctx.closePath();

      this.#ctx.restore();
    }
  }
  DrawRect(this: Renderer, rectSettings: RectDrawingSettings, rendererSettings?: TypeRendererSettings) {
    if (this.#ctx) {
      let fullSettings: Required<RectDrawingSettings>;
      if (_.isEqual(Renderer.#drawingSettingsCache.rect.arg, rectSettings)) {
        fullSettings = Renderer.#drawingSettingsCache.rect.settings;
      } else {
        fullSettings = _.defaultsDeep({}, rectSettings);
        fullSettings = _.defaultsDeep(fullSettings, Renderer.#defaultRectDrawingSettings);

        Renderer.#drawingSettingsCache.rect.arg = _.cloneDeep(rectSettings);
        Renderer.#drawingSettingsCache.rect.settings = fullSettings;
      }

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
    }
  }
  DrawPolygon(this: Renderer, vertices: Pos[], rendererSettings?: TypeRendererSettings) {
    if (this.#ctx) {
      this.#ctx.save();

      this.#ctx.beginPath();
      let i = 0;
      while (i < vertices.length) {
        this.#ctx.lineTo(vertices[i].x, vertices[i].y);
        ++i;
      }
      this.#ctx.lineTo(vertices[0].x, vertices[0].y);

      this.ApplySettings(rendererSettings);
      this.#ctx.fill();
      this.#ctx.stroke();
      this.#ctx.closePath();

      this.#ctx.restore();
    }
  }
  DrawArc(this: Renderer, arcSettings: ArcDrawingSettings, rendererSettings?: TypeRendererSettings) {
    if (this.#ctx) {
      let fullSettings: Required<ArcDrawingSettings>;
      if (_.isEqual(Renderer.#drawingSettingsCache.arc.arg, arcSettings)) {
        fullSettings = Renderer.#drawingSettingsCache.arc.settings;
      } else {
        fullSettings = _.defaultsDeep({}, arcSettings);
        fullSettings = _.defaults(fullSettings, Renderer.#defaultArcDrawingSettings);
        if (IsType(arcSettings.height, 'undefined')) fullSettings.height = fullSettings.width;

        Renderer.#drawingSettingsCache.arc.arg = _.cloneDeep(arcSettings);
        Renderer.#drawingSettingsCache.arc.settings = fullSettings;
      }

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
    }
  }
  DrawPath(path: Path2D, rendererSettings?: TypeRendererSettings) {
    if (this.#ctx) {
      this.#ctx.save();
      this.ApplySettings(rendererSettings);
      this.#ctx.fill(path);
      this.#ctx.stroke(path);
      this.#ctx.restore();
    }
  }

  CreateLinearGradient(from: Pos, to: Pos, colorStops: ColorStop[]) {
    if (this.#ctx) {
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
  }
  CreateRadialGradient(fromCircle: Circle, toCircle: Circle, colorStops: ColorStop[]) {
    if (this.#ctx) {
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
  }
  CreatePattern(img: CanvasImageSource, type: string = '') {
    if (this.#ctx) return this.#ctx.createPattern(img, type);
  }
}