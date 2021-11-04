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
  edges?: Vector3[];
  image?: CanvasImageSource;
}
// interface RenderableInfo {
//   edges?: Vector3[];
//   image?: ImageBitmap;
//   rendererSettings?: TypeRendererSettings;
// }

@Component.component()
export class Renderable extends Component {
  protected readonly _size: Size = new Size();
  protected readonly _edges: Vector3[];
  protected _image?: ImageBitmap;
  protected readonly _path: Path2D;
  protected readonly _rendererSettings?: TypeRendererSettings;

  constructor(renderableConfig: RenderableConfig, rendererSettings?: TypeRendererSettings) {
    super();

    this._path = new Path2D();
    this._edges = [];

    if (rendererSettings) {
      this._rendererSettings = rendererSettings;
    }
    if (renderableConfig.edges) {
      const curVec = new Vector3();
      let maxX = 0, maxY = 0;
      let minX = 0, minY = 0;

      this._path.moveTo(curVec.x, curVec.y);
      for (const vec of renderableConfig.edges) {
        curVec.add(vec);
        minX = Math.min(minX, curVec.x);
        minY = Math.min(minY, curVec.y);
        maxX = Math.max(maxX, curVec.x);
        maxY = Math.max(maxY, curVec.y);
        this._path.lineTo(curVec.x, curVec.y);
      }
      this._path.closePath();

      this._edges.concat(renderableConfig.edges);
      this._size.width = maxX - minX;
      this._size.height = maxY - minY;
    }
    if (renderableConfig.image) {
      createImageBitmap(renderableConfig.image)
          .then(image => this._image = image);
      this._size.width = renderableConfig.image.width as number;
      this._size.height = renderableConfig.image.height as number;
    }
    if (renderableConfig.arc) {
      let x = 0, y = 0;
      let w = renderableConfig.arc.halfSize.width, h = 0;
      let startAngle = 0, endAngle = 2 * Math.PI;
      if (renderableConfig.arc.offset) {
        x = renderableConfig.arc.offset.x;
        y = renderableConfig.arc.offset.y;
      }
      if (renderableConfig.arc.startAngle) {
        startAngle = renderableConfig.arc.startAngle;
      }
      if (renderableConfig.arc.endAngle) {
        endAngle = renderableConfig.arc.endAngle;
      }
      if (renderableConfig.arc.halfSize.height) {
        h = renderableConfig.arc.halfSize.height;
      } else h = renderableConfig.arc.halfSize.width;
      this._path.ellipse(
        x, y, w, h,
        0, startAngle, endAngle, renderableConfig.arc.counterClockwise
      );
      this._size.width = 2 * w;
      this._size.height = 2 * h;
    }
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
    return this._path;
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
  static Rect(size: Size): RenderableConfig {
    return {
      // shapeType: 'rectangle',
      edges: [
        new Vector3(size.width, 0),
        new Vector3(0, size.height),
        new Vector3(-size.width, 0),
        // new Vector3(0, -size.height),
      ],
    };
  }
  static Polygon(edges: Vector3[]): RenderableConfig {
    return {
      // shapeType: 'polygon',
      edges: edges,
    }
  }
  static Circle(radius: number): RenderableConfig {
    return {
      // shapeType: 'ellipse',
      arc: {
        halfSize: {
          width: radius,
        }
      },
    };
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
}
