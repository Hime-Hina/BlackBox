import _ from 'lodash';
import { Component } from "../Component";
import { TypeRendererSettings } from '../Renderer/Renderer';
import { ErrorHelper, IsType, IsTypeSize, Size } from "../utils/Utilities";
import { Vector3 } from "../utils/Vector";

// type RenderableType = 'none' | 'polygon' | 'rectangle' | 'triangle' | 'segment' | 'ellipse' | 'image';
export interface RenderableConfig {
  arc?: {
    offset?: Vector3;
    halfSize: {
      width: number;
      height?: number;
    };
    startAngle?: number;
    endAngle?: number;
    counterClockwise?: boolean;
  };
  offset?: Vector3;
  edges?: Vector3[];
  path?: Path2D;
  image?: CanvasImageSource;
}

@Component.component()
export class Renderable extends Component {
  protected readonly _size: Size = new Size();
  protected _edges?: Vector3[];
  protected _image?: ImageBitmap;
  protected _path?: Path2D;
  protected _rendererSettings?: TypeRendererSettings;

  constructor(renderableConfig: RenderableConfig, rendererSettings?: TypeRendererSettings) {
    super();

    this.Set(renderableConfig, rendererSettings);
  }

  Set(renderableConfigOrPath?: RenderableConfig | Path2D, rendererSettings?: TypeRendererSettings) {
    if (!renderableConfigOrPath) return this;
    this._edges = [];
    this._path = new Path2D();

    if (rendererSettings) {
      this._rendererSettings = rendererSettings;
    }
    if (IsType(renderableConfigOrPath, Path2D)) {
      this._path = renderableConfigOrPath;
    } else {
      if (renderableConfigOrPath.edges) {
        const curVec = new Vector3();
        let maxX = 0, maxY = 0;
        let minX = 0, minY = 0;

        if (renderableConfigOrPath.offset) curVec.add(renderableConfigOrPath.offset);
        this._path.moveTo(curVec.x, curVec.y);
        for (const vec of renderableConfigOrPath.edges) {
          curVec.add(vec);
          minX = Math.min(minX, curVec.x);
          minY = Math.min(minY, curVec.y);
          maxX = Math.max(maxX, curVec.x);
          maxY = Math.max(maxY, curVec.y);
          this._path.lineTo(curVec.x, curVec.y);
        }
        this._path.closePath();

        this._edges.concat(renderableConfigOrPath.edges);
        this._size.width = maxX - minX;
        this._size.height = maxY - minY;
      }
      if (renderableConfigOrPath.image) {
        createImageBitmap(renderableConfigOrPath.image)
            .then(image => this._image = image);
        this._size.width = renderableConfigOrPath.image.width as number;
        this._size.height = renderableConfigOrPath.image.height as number;
      }
      if (renderableConfigOrPath.arc) {
        let x = 0, y = 0;
        let w = renderableConfigOrPath.arc.halfSize.width, h = 0;
        let startAngle = 0, endAngle = 2 * Math.PI;
        if (renderableConfigOrPath.arc.offset) {
          x = renderableConfigOrPath.arc.offset.x;
          y = renderableConfigOrPath.arc.offset.y;
        }
        if (renderableConfigOrPath.arc.startAngle) {
          startAngle = renderableConfigOrPath.arc.startAngle;
        }
        if (renderableConfigOrPath.arc.endAngle) {
          endAngle = renderableConfigOrPath.arc.endAngle;
        }
        if (renderableConfigOrPath.arc.halfSize.height) {
          h = renderableConfigOrPath.arc.halfSize.height;
        } else h = renderableConfigOrPath.arc.halfSize.width;

        this._path.ellipse(
          x, y, w, h,
          0, startAngle, endAngle, renderableConfigOrPath.arc.counterClockwise
        );
        this._size.width = 2 * w;
        this._size.height = 2 * h;
      }
      if (renderableConfigOrPath.path) {
        this._path.addPath(renderableConfigOrPath.path);
      }
    }

    return this;
  }
  AddPath(path: Path2D) {
    if (this._path) this._path.addPath(path);
    else this._path = new Path2D(path);
    return this;
  }

  get size() {
    return this._size;
  }
  get edges() {
    return this._edges;
  }
  get img() {
    return this._image;
  }
  get path() {
    if (this._path)
      return this._path;
    else return new Path2D();
  }
  set path(newPath: Path2D) {
    this._path = newPath;
  }
  get rendererSettings() {
    return this._rendererSettings;
  }

  static Segment(dir: Vector3): RenderableConfig {
    return {
      // shapeType: 'segment',
      edges: [
        new Vector3(dir)
      ],
    };
  }
  static Triangle(e1: Vector3, e2: Vector3, e3: Vector3): RenderableConfig {
    return {
      // shapeType: 'triangle',
      edges: [
        new Vector3(e1),
        new Vector3(e2),
        new Vector3(e3),
      ],
    }
  }
  static Rect(size: Size, offset?: Vector3): RenderableConfig {
    return {
      // shapeType: 'rectangle',
      offset: offset,
      edges: [
        new Vector3(size.width, 0),
        new Vector3(0, size.height),
        new Vector3(-size.width, 0),
      ],
    };
  }
  static Polygon(edges: Vector3[], offset?: Vector3): RenderableConfig {
    return {
      // shapeType: 'polygon',
      offset: offset,
      edges: edges,
    }
  }
  static Circle(radius: number, startAngle?: number, endAngle?: number): RenderableConfig {
    let res = {
      arc: {
        halfSize: {
          width: radius,
        },
        startAngle: startAngle ? startAngle : 0,
        endAngle: endAngle ? endAngle : 2 * Math.PI,
      },
    };
    return res;
  }
  static Ellipse(size: Size, offset?: Vector3): RenderableConfig {
    return {
      // shapeType: 'ellipse',
      arc: {
        offset: new Vector3(offset),
        halfSize: new Size(size.width, size.height),
      }
    }
  }
  static Path(path: Path2D): RenderableConfig {
    return {
      path: path
    };
  }
}
