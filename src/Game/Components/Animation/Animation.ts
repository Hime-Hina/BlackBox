import _ from "lodash";
import { Component, ComponentConstructor, ComponentID } from "../../Component";
import { Entity } from "../../EntityManager";
import { EasingFunction, Easings } from "../../Tween/Easings";
import { Tween } from "../../Tween/Tween";
import { Bezier } from "../../utils/Bezier";
import { ErrorHelper, IsType, Size } from "../../utils/Utilities";
import { Vector3 } from "../../utils/Vector";
import { Transform } from "../Transform";

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

/**
 * 贝塞尔曲线插值
 * @param p 贝塞尔曲线的控制点，第一个和最后一个点为端点。
 * @param t 贝塞尔曲线的参数，值域为[0, 1]。
 * @returns 在p数组所确定的贝塞尔曲线上参数为t时的点。
 */
function BezierCurve(p: Vector3[], t: number) {
  let beta = _.cloneDeep(p);

  let i = 1, j;
  while (i < beta.length) {
    j = 0;
    while (j < beta.length - i) {
      beta[j].mul(1 - t).add(beta[j + 1].Mul(t));
      ++j;
    }
    ++i;
  }
  return beta[0];
}

type Keyframe = {
  value: number;
  ctrlVecs: [Vector3, Vector3];
};
type Keyframes = Map<number, Keyframe>;
type PropertyValue = {
  keyframes: Keyframes;
  curve: number[]; // TODO: 使用TypedArray
};
type Property = {
  [componentID: number]: {
    [objPath: string | number | symbol]: {
      [propertyKey: string]: PropertyValue;
    }
  };
  maxFrameNumber: number;
};
export class Animation {
  sampleRate: number = 60;
  #entity: Entity;
  #currentFrame: number = -1;
  #properties: Property = { maxFrameNumber: 0 };
  #objects: Map<ComponentID, Map<string, any>> = new Map();


  constructor(entity: Entity) {
    this.#entity = entity;
  }

  get properties() {
    return this.#properties;
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
    let curve: number[] = new Array<number>(this.#properties.maxFrameNumber + 1);

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
  AddKey(
    this: Animation,
    componentCtor: ComponentConstructor,
    objPath: string, propName: string,
    keyframes: { frameNumber: number, keyframeInfo: Omit<Keyframe, "ctrlVecs"> & { ctrlVecs: [Vector3?, Vector3?] } }[]
  ) {
    // guard
    let componentID = Component.GetComponentID(componentCtor);
    let component = this.#entity.GetComponent(componentID);
    if (IsType(component, 'undefined')) {
      return ErrorHelper.MethodError(this, `The entity ${this.#entity} does not have component ${componentCtor.name}!`);
    }
    let obj = _.get(component, objPath);
    if (IsType(obj, 'undefined')) {
      return ErrorHelper.MethodError(this, `The component ${component} does not have path ${objPath}!`);
    }
    if (!(propName in obj)) {
      return ErrorHelper.MethodError(this, `The property ${propName} does not exist in ${obj}!`);
    }

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
      this.#properties.maxFrameNumber = Math.max(keyframe.frameNumber);
      if (this.#properties.hasOwnProperty(componentID)
        && this.#properties[componentID].hasOwnProperty(objPath)
        && this.#properties[componentID][objPath].hasOwnProperty(propName)) {
        this.#objects.get(componentID)!.set(objPath, obj);
        this.#properties[componentID][objPath][propName].keyframes.set(keyframe.frameNumber, validKeyframe);
      } else {
        this.#objects.set(componentID, new Map([[objPath, obj]]));
        _.set(this.#properties, [componentID, objPath, propName], {
          keyframes: new Map([[keyframe.frameNumber, validKeyframe]]),
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
  RemoveKey(
    this: Animation, componentCtor: ComponentConstructor, objPath: string, propName: string, frameNumber: number
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
    if (property.keyframes.has(frameNumber)) {
      property.keyframes.delete(frameNumber);
      for (let frameNum of property.keyframes.keys()) {
        this.#properties.maxFrameNumber = Math.max(frameNum);
      }
    } else return ErrorHelper.MethodError(this, `Wrong frame number!`);
    if (property.keyframes.size >= 2) {
      property.curve = this.#Interplate(property.keyframes);
    } else if (property.keyframes.size >= 1) {
      property.curve = [];
    } else {
      delete this.#properties[componentID][objPath][propName];
    }
    return this;
  }

  Update(timeStamp: number, delta: number) {
    if (this.#currentFrame > this.#properties.maxFrameNumber) {
      this.#currentFrame = 0;
    }
    if (delta * this.sampleRate >= 1) {
      let tmp1: Property[number], tmp2: Property[number][string | number | symbol];
      for (let componentID in this.#properties) {
        tmp1 = this.#properties[componentID];
        for (let objPath in tmp1) {
          tmp2 = this.#properties[componentID][objPath];
          for (let propertyKey in tmp2) {
            this.#objects
              .get(Number(componentID) as ComponentID)!
              .get(objPath)!
            [propertyKey as keyof Property[number][string | number | symbol]]
              = tmp2[propertyKey].curve[this.#currentFrame];
          }
        }
      }
      ++this.#currentFrame;
    }
  }

}