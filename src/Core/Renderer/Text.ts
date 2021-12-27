import { Pos } from "../utils/Utilities";
import { Renderable } from "./Renderable";
import { AllRendererSettings, Renderer, RendererFn, RendererSettings } from "./Renderer";

type TextSettings = Exclude<RendererSettings['text'], undefined>;
export class Text extends Renderable<Text> {
  readonly Renderer: RendererFn<Text> = Renderer.prototype.DrawText;

  static defaultSettings: AllRendererSettings['text'] = {
    direction: 'inherit',
    font: '10px sans-serif',
    align: 'start',
    baseline: 'alphabetic'
  };

  protected _maxWidth?: number;
  protected _text: string = '';
  protected _settings: TextSettings = {};
  protected _textMeasure?: TextMetrics;

  constructor(pos: Pos, text?: string, settings?: RendererSettings['text']) {
    super(pos);
    if (text) this.SetText(text);
    if (settings) {
      this.SetSettings(settings);
    }
  }

  get maxWidth() {
    return this._maxWidth;
  }
  get text() {
    return this._text;
  }
  get settings() {
    return this._settings;
  }
  get measure() {
    return this._textMeasure;
  }

  IsEmpty(): boolean {
    return this._text.trim().length === 0;
  }

  SetMaxWidth(maxWidth: number) {
    this._maxWidth = maxWidth;
    return this;
  }
  SetText(text: string) {
    this._hasChanged = this._text !== text;
    if (this._hasChanged) {
      this._text = text;
      this._textMeasure = undefined;
    }
    return this;
  }
  SetSettings(settings: TextSettings) {
    for (let name in settings) {
      this._settings[name as keyof TextSettings] =
        settings[name as keyof RendererSettings['text']];
    }
    this._textMeasure = undefined;
    return this;
  }
  SetMeasure(measure: TextMetrics) {
    this._textMeasure = measure;
    return this;
  }
}