import _ from "lodash";
import { Component, ComponentConstructor, ComponentID } from "../../Component";
import { Entity } from "../../EntityManager";
import { Bezier } from "../../utils/Bezier";
import { ErrorHelper, IsType, Size } from "../../utils/Utilities";
import { Vector3 } from "../../utils/Vector";

export class Sprite {
  #spriteAtlas: HTMLImageElement;
  #cellSize: Size = new Size();

  constructor(
    spriteAtlasPath: string, cellSize: Size
  ) {
    this.#spriteAtlas = new Image();
    this.#spriteAtlas.addEventListener('load', (ev) => {
    });
    this.#spriteAtlas.src = spriteAtlasPath;
    this.#cellSize.width = cellSize.width;
    this.#cellSize.height = cellSize.height;
  }
}

type AnimableObjectPath = string | number | symbol;
type Keyframe = {
  value: number;
  ctrlVecs: [Vector3, Vector3];
};
type Keyframes = Map<number, Keyframe>;
type PropertyValue = {
  keyframes: Keyframes;
  curve: Float64Array; // TODO: 使用TypedArray
};
type Property = {
  [componentID: number]: {
    [objPath: AnimableObjectPath]: {
      [propertyKey: string]: PropertyValue;
    }
  };
  maxFrame: number;
};
type NomalizedTime = {
  integer: number;
  decimal: number;
};
export class Animation {
  #sampleRate: number;
  #duration: number = 0;
  #previousUpdateFrame: number = Infinity;
  #currentFrame: number = 0;
  #nomalizedTime: NomalizedTime = {
    integer: 0,
    decimal: 0,
  };
  #lastNomalizedTime: NomalizedTime = {
    integer: -Infinity,
    decimal: -Infinity,
  };
  #tmp: number = 0;
  // #entity: Entity | null = null;
  #properties: Property = { maxFrame: 0 };
  #objects: Map<ComponentID, Map<string, any>> = new Map();

  constructor(sampleRateOrAnim?: number | Animation) {
    if (IsType(sampleRateOrAnim, 'undefined')) {
      this.#sampleRate = 60;
    } else {
      if (IsType(sampleRateOrAnim, 'number')) {
        this.#sampleRate = sampleRateOrAnim;
      } else {
        this.#sampleRate = sampleRateOrAnim.#sampleRate;
        this.#properties = _.cloneDeep(sampleRateOrAnim.#properties);
        this.#objects = _.cloneDeep(sampleRateOrAnim.#objects);
      }
    }
    this.Reset();
  }

  get sampleRate() {
    return this.#sampleRate;
  }
  get duration() {
    return this.#duration;
  }
  get lastNomalizedTime() {
    return this.#lastNomalizedTime;
  }
  get nomalizedTime() {
    return this.#nomalizedTime;
  }
  get properties() {
    return this.#properties;
  }

  Reset() {
    this.#duration = 0;
    this.#previousUpdateFrame = Infinity;
    this.#currentFrame = 0;
    this.#nomalizedTime.integer = 0;
    this.#nomalizedTime.decimal = 0;
    this.#lastNomalizedTime.integer = -Infinity;
    this.#lastNomalizedTime.decimal = -Infinity;
  }

  #ClampTangentVectors(
    preKeyframe: [number, Keyframe] | null,
    curKeyframe: [number, Keyframe],
    nxtKeyframe: [number, Keyframe] | null
  ) {
    if (IsType(preKeyframe, 'null')) {
      curKeyframe[1].ctrlVecs[0].set(0, 0);
    } else {
      curKeyframe[1].ctrlVecs[0].clamp(
        new Vector3(preKeyframe[0] - curKeyframe[0], -Infinity),
        new Vector3(0, Infinity)
      );
    }
    if (IsType(nxtKeyframe, 'null')) {
      curKeyframe[1].ctrlVecs[1].set(0, 0);
    } else {
      curKeyframe[1].ctrlVecs[1].clamp(
        new Vector3(0, -Infinity),
        new Vector3(nxtKeyframe[0] - curKeyframe[0], Infinity)
      );
    }
  }
  #Interplate(keyframes: Keyframes) {
    let t: number;
    let start: Vector3, end: Vector3;
    let curKeyframe: [number, Keyframe],
      nxtKeyframe: [number, Keyframe],
      preKeyframe: [number, Keyframe];
    let keyframeEntries = Array.from(keyframes.entries()).sort((a, b) => a[0] - b[0]);
    let curve: Float64Array = new Float64Array(this.#properties.maxFrame + 1);

    // this.#ClampTangentVectors(null, keyframeEntries[0], keyframeEntries[1]);
    // this.#ClampTangentVectors(
    //   keyframeEntries[keyframeEntries.length - 2],
    //   keyframeEntries[keyframeEntries.length - 1],
    //   null
    // );

    let keyframeIndx = 0, frameNumber = 0;
    if (keyframeEntries[0][0] > 0) {
      // if the first keyframe is not at the zero frame,
      // all of the values before the first keyframe should be a constant
      // which equals with the value of the first keyframe
      while (frameNumber < keyframeEntries[0][0]) {
        curve[frameNumber] = keyframeEntries[0][1].value;
        ++frameNumber;
      }
    }
    while (keyframeIndx < keyframeEntries.length - 1) {
      curKeyframe = keyframeEntries[keyframeIndx];
      nxtKeyframe = keyframeEntries[keyframeIndx + 1];

      if (keyframeIndx > 0) { // clamp the control vectors
        preKeyframe = keyframeEntries[keyframeIndx - 1];
        // this.#ClampTangentVectors(preKeyframe, curKeyframe, nxtKeyframe);
      }

      start = new Vector3(curKeyframe[0], curKeyframe[1].value);
      end = new Vector3(nxtKeyframe[0], nxtKeyframe[1].value);
      let bezier = new Bezier(
        [
          start,
          start.Add(curKeyframe[1].ctrlVecs[1]),
          end.Add(nxtKeyframe[1].ctrlVecs[0]),
          end
        ]
      );
      while (frameNumber < nxtKeyframe[0]) {
        t = (frameNumber - curKeyframe[0]) / (nxtKeyframe[0] - curKeyframe[0]);
        curve[frameNumber] = bezier.GetPointAt(bezier.GetParamAtLength(t * bezier.totalLength)).y;
        ++frameNumber;
      }

      ++keyframeIndx;
    }

    while (frameNumber < curve.length) {
      curve[frameNumber] = keyframeEntries[keyframeIndx][1].value;
      ++frameNumber;
    }
    console.log("entries: ", keyframeEntries);
    console.log("curve: ", curve);
    return curve;
  }
  #Guard(
    entity: Entity, componentID: ComponentID, objPath: string
  ) {
    let component = entity.GetComponent(componentID);
    if (IsType(component, 'undefined')) {
      console.warn(`The entity ${entity} does not have component ${Component.GetComponentCtor(componentID).name}!`);
      return null;
    }
    let obj: any;
    if (objPath === '') {
      obj = component;
    } else {
      obj = _.get(component, objPath);
    }
    if (IsType(obj, 'undefined')) {
      return ErrorHelper.MethodError(this, `The component ${component} does not have path ${objPath}!`);
    }
    return obj;
  }
  SetEntity(entity: Entity) {
    // this.#entity = null;
    this.#objects.clear();

    let obj: any;
    let componentID: ComponentID;
    for (let componentIDKey in this.#properties) {
      let entries: [string, any][] = [];
      componentID = parseInt(componentIDKey) as ComponentID;
      for (let objPath in this.#properties[componentIDKey]) {
        obj = this.#Guard(entity, componentID, objPath);
        if (!IsType(obj, 'null')) entries.push([objPath, obj]);
      }
      if (entries.length > 0) this.#objects.set(componentID, new Map(entries));
    }

    // if (this.#objects.size > 0) this.#entity = entity;
  }
  AddKey<T extends Component>(
    this: Animation,
    componentCtor: ComponentConstructor<T>,
    objPath: string, propName: string,
    ...keyframes: {
      frame: number;
      keyframeInfo: Omit<Keyframe, "ctrlVecs"> & { ctrlVecs: [Vector3?, Vector3?] };
    }[]
  ) {
    let componentID = Component.GetComponentID(componentCtor);

    for (let keyframe of keyframes) {
      // Fill the control vectors
      let validKeyframe: Keyframe = {
        value: keyframe.keyframeInfo.value,
        ctrlVecs: [new Vector3, new Vector3]
      };
      if (IsType(keyframe.keyframeInfo.ctrlVecs[0], Vector3)) {
        validKeyframe.ctrlVecs[0].set(keyframe.keyframeInfo.ctrlVecs[0]);
      }
      if (IsType(keyframe.keyframeInfo.ctrlVecs[1], Vector3)) {
        validKeyframe.ctrlVecs[1].set(keyframe.keyframeInfo.ctrlVecs[1]);
      } else if (IsType(keyframe.keyframeInfo.ctrlVecs[0], Vector3)) {
        validKeyframe.ctrlVecs[1].set(keyframe.keyframeInfo.ctrlVecs[0].Opposite());
      }

      // set
      this.#properties.maxFrame = Math.max(keyframe.frame);
      if (this.#properties.hasOwnProperty(componentID)
        && this.#properties[componentID].hasOwnProperty(objPath)
        && this.#properties[componentID][objPath].hasOwnProperty(propName)) {
        // this.#objects.get(componentID)!.set(objPath, obj);
        this.#properties[componentID][objPath][propName].keyframes.set(keyframe.frame, validKeyframe);
      } else {
        // this.#objects.set(componentID, new Map([[objPath, obj]]));
        _.set(this.#properties, [componentID, objPath, propName], {
          keyframes: new Map([[keyframe.frame, validKeyframe]]),
          curve: [],
        });
      }
    }

    let property = this.#properties[componentID][objPath][propName];
    if (property.keyframes.size >= 2) {
      property.curve = this.#Interplate(property.keyframes);
    }
    return this;
  }
  RemoveKey<T extends Component>(
    this: Animation,
    componentCtor: ComponentConstructor<T>, objPath: string, propName: string,
    ...frameNumbers: number[]
  ) {
    let componentID = Component.GetComponentID(componentCtor);
    if (!this.#properties.hasOwnProperty(componentID)) {
      return ErrorHelper.MethodError(this, `The property about component ${componentCtor.name} does not exist!`);
    }
    let obj = this.#objects.get(componentID)!.get(objPath);
    if (IsType(obj, 'undefined')) {
      return ErrorHelper.MethodError(this, `The property about ${componentCtor.name}.${objPath} does not exist!`);
    }
    if (!(propName in obj)) {
      return ErrorHelper.MethodError(this, `The property about ${componentCtor.name}.${objPath}.${propName} does not exist!!`);
    }
    let property = this.#properties[componentID][objPath][propName];
    for (let frameNumber of frameNumbers) {
      if (property.keyframes.has(frameNumber)) {
        property.keyframes.delete(frameNumber);
      } else return ErrorHelper.MethodError(this, `Wrong frame number!`);
    }
    for (let frameNum of property.keyframes.keys()) {
      this.#properties.maxFrame = Math.max(frameNum);
    }
    if (property.keyframes.size >= 2) {
      property.curve = this.#Interplate(property.keyframes);
    } else if (property.keyframes.size >= 1) {
      property.curve = new Float64Array(0);
    } else {
      delete this.#properties[componentID][objPath][propName];
    }
    return this;
  }

  #UpdateObjs() {
    let properties: Property[number][AnimableObjectPath];
    for (let [componentID, componentProp] of this.#objects) {
      for (let [objPath, obj] of componentProp) {
        properties = this.#properties[componentID][objPath];
        for (let propertyKey in properties) {
          obj[propertyKey] = properties[propertyKey].curve[this.#currentFrame];
        }
      }
    }
  }
  Update(timeStamp: number, delta: number) {
    if (this.#objects.size === 0) return;
    if (this.#previousUpdateFrame !== this.#currentFrame) {
      this.#UpdateObjs();
      this.#previousUpdateFrame = this.#currentFrame;
    }
    this.#duration += delta / 1000;
    this.#tmp = this.duration * this.#sampleRate + 0.5;
    this.#currentFrame = Math.floor(this.#tmp % (this.#properties.maxFrame + 0.5));
    this.#lastNomalizedTime.decimal = this.#nomalizedTime.decimal;
    this.#lastNomalizedTime.integer = this.#nomalizedTime.integer;
    this.#nomalizedTime.decimal = Math.floor(this.#tmp) / this.#properties.maxFrame;
    this.#nomalizedTime.integer = Math.floor(this.#nomalizedTime.decimal);
    this.#nomalizedTime.decimal -= this.#nomalizedTime.integer;
  }

}