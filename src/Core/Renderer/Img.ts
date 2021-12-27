import _ from "lodash";
import { ErrorHelper, IsType, Pos, Size } from "../utils/Utilities";
import { Renderable } from "./Renderable";
import { Renderer, RendererFn } from "./Renderer";

export type ImageDrawingSettings = {
  pos: Pos;
  size: Size;
};
type OnLoadHandler = (e?: Event) => void;
type ImageSource = Exclude<CanvasImageSource, SVGImageElement>;
export class Img extends Renderable<Img> {
  readonly Renderer: RendererFn<Img> = Renderer.prototype.DrawImage;

  protected _isLoaded: boolean = false;
  protected _image?: ImageSource;
  protected _size: Size = new Size;
  // #bitmap: ImageBitmap | null = null;
  protected _src: ImageDrawingSettings = {
    pos: new Pos,
    size: new Size
  };
  protected _dest: ImageDrawingSettings = {
    pos: new Pos,
    size: new Size
  };
  protected _onLoad: OnLoadHandler;

  constructor();
  constructor(path: string, handler?: OnLoadHandler);
  constructor(image: ImageSource, handler?: OnLoadHandler);
  constructor(imageOrPath?: string | ImageSource, handler?: OnLoadHandler) {
    super();
    this._onLoad = (ev) => {
      this._isLoaded = true;
      this._SetSize(this._image!.width, this._image!.width);
    };
    if (handler) this.AddOnLoadHandler(handler);
    if (imageOrPath) this.SetImage(imageOrPath);
  }

  get image() {
    return this._image;
  }
  get size() {
    return this._size;
  }
  get dest() {
    return this._dest;
  }
  get src() {
    return this._src;
  }
  // get bitmap() {
  //   return this.#bitmap;
  // }

  IsEmpty(): boolean {
    return IsType(this._image, 'undefined')
      || this._src.size.width === 0
      || this._src.size.height === 0
      || this._dest.size.width === 0
      || this._dest.size.height === 0
      || !this._isLoaded;
  }

  protected _SetSize(width: number, height: number) {
    this._size.width = width;
    this._size.height = height;
    this._src.pos.x = 0;
    this._src.pos.y = 0;
    this._src.size.width = width;
    this._src.size.height = height;
    this._dest.pos.x = 0;
    this._dest.pos.y = 0;
    this._dest.size.width = width;
    this._dest.size.height = height;
  }
  SetImage(imageOrPath: string | ImageSource) {
    if (IsType(imageOrPath, 'string')) {
      this._image = new Image();
      this._image.addEventListener('load', this._onLoad);
      this._image.src = imageOrPath;
    } else {
      this._image = imageOrPath;
      if (IsType(this._image, HTMLImageElement)) {
        if (this._image.complete) {
          this._onLoad();
        } else {
          this._image.addEventListener('load', this._onLoad);
        }
      } else if (IsType(this._image, HTMLVideoElement)) {
        // TODO: When canplay event omits, onLoad is called.
        if (this._image.readyState >= 1) {
          this._onLoad();
        } else {
          this._image.addEventListener('loadedmetadata', this._onLoad);
        }
      } else if (IsType(this._image, HTMLCanvasElement)) {
        this._onLoad();
      } else if (IsType(this._image, ImageBitmap)) {
        this._onLoad();
      }
    }
    return this;
  }
  SetDest(dest: Partial<ImageDrawingSettings>, fixedRatio: boolean = false, scaleBy: 'width' | 'height' = 'width') {
    if (dest.pos) {
      this._dest.pos.x = dest.pos.x;
      this._dest.pos.y = dest.pos.x;
      this._dest.pos.z = dest.pos.z;
    }
    if (dest.size) {
      this._dest.size.width = dest.size.width;
      this._dest.size.height = dest.size.height;
      if (fixedRatio) {
        if (scaleBy === 'width') {
          this._dest.size.height = dest.size.width * (this._size.height / this._size.width);
        } else {
          this._dest.size.width = dest.size.height * (this._size.width / this._size.height);
        }
      }
    }
    return this;
  }
  SetSrc(src: Partial<ImageDrawingSettings>) {
    if (src.pos) {
      this._src.pos.x = _.clamp(src.pos.x, 0, this._isLoaded ? this._size.width : Infinity);
      this._src.pos.y = _.clamp(src.pos.x, 0, this._isLoaded ? this._size.height : Infinity);
      this._src.pos.z = src.pos.z;
    }
    if (src.size) {
      this._src.size.width = _.clamp(
        src.size.width,
        0,
        this._isLoaded ? this._size.width - this._src.pos.x : Infinity
      );
      this._src.size.height = _.clamp(
        src.size.height,
        0,
        this._isLoaded ? this._size.height - this._src.pos.y : Infinity
      );
    }
    return this;
  }

  AddOnLoadHandler(handler: OnLoadHandler) {
    let originHandler = this._onLoad;
    this._onLoad = (ev) => {
      originHandler(ev);
      handler(ev);
    }
    return this;
  }

}