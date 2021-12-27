import _ from 'lodash';
import { Component } from "../Component";
import { Geometry } from '../Renderer/Geometry/Geometry';
import { GeometryGroup } from '../Renderer/Geometry/GeometryGroup';
import { Img } from '../Renderer/Img';
import { Renderable } from '../Renderer/Renderable';
import { RendererSettings } from '../Renderer/Renderer';
import { Text } from '../Renderer/Text';
import { IsType, Pos } from "../utils/Utilities";

@Component.component()
export class Shape extends Component {
  #renderingGroup: Renderable<any>[] = [];
  #rendererSettings: RendererSettings = {};

  constructor(rendererSettings?: RendererSettings) {
    super();
    if (rendererSettings) this.#rendererSettings = rendererSettings;
  }

  get rendererSettings() {
    return this.#rendererSettings;
  }
  get renderingGroup() {
    return this.#renderingGroup;
  }

  SetRendererSettings(rendererSettings: RendererSettings) {
    this.#rendererSettings = rendererSettings;
    return this;
  }
  AddImage(image: Img, renderingOrder?: number) {
    if (renderingOrder) {
      this.#renderingGroup[renderingOrder] = image;
    } else {
      this.#renderingGroup.push(image);
    }
    return this;
  }
  AddGeometries(groupOrGeometries: GeometryGroup | Geometry[], pos: Pos = new Pos, renderingOrder?: number) {
    let group: GeometryGroup;
    if (IsType(groupOrGeometries, GeometryGroup)) {
      group = groupOrGeometries;
    } else {
      group = new GeometryGroup(pos);
      group.Clear();
      group.Add(...groupOrGeometries);
    }
    if (renderingOrder) {
      this.#renderingGroup[renderingOrder] = group;
    } else {
      this.#renderingGroup.push(group);
    }
    return this;
  }
  AddText(text: Text, renderingOrder?: number) {
    this.#rendererSettings.text = text.settings;
    if (renderingOrder) {
      this.#renderingGroup[renderingOrder] = text;
    } else {
      this.#renderingGroup.push(text);
    }
    return this;
  }

}
