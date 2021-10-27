import _ from 'lodash';
import { Animation } from './Game/Animation/Animation';
import { ArcDrawingSettings, ImageDrawingSettings, Renderer, TypeRendererSettings } from './Game/Renderer/Renderer';
import { Pos, Size } from './Game/utils/Utilities';
import bg from '../assets/background.jpg';
import './style.css';

let canvasElem = document.getElementById('canvas') as HTMLCanvasElement;
let renderer = new Renderer(canvasElem);
let bgImg = new Image();
let imgDrawingSettings: ImageDrawingSettings = {
  dest: {
    topLeft: new Pos(),
  }
};
let arcDrawingSettings: ArcDrawingSettings = {
  center: new Pos(),
  width: 10,
};
let rendererSettings: TypeRendererSettings = {
  style: {
    fill: 'yellow',
    stroke: 'transparent'
  },
  shadow: {
    blur: 0,
    color: 'red',
  }
};

function onImgLoad() {
  canvasElem.width = bgImg.width;
  canvasElem.height = bgImg.height;
  imgDrawingSettings.dest.size = new Size(bgImg.width / 4, bgImg.height / 4);

  const path = 'M3.63,588.73c70,34,129.52-82,184.26,0S229.4,624.58,309,595.16s-25.38-138.43,52.62-165.43,47,34,107,53,84-145,156-90,8,148,121,124,121-136,192-180,89,107,216,24,217-206,74-204-112-227-216-134-40,62-81,135-72,130-140,103-191-49-214,5-76.89,4-139.45,52-133.64,32.85-215.55,82c-45,27,34.81,218.42-125-15-76-111,303.72-173.15,148-258C-45.37-31.27,3.63,588.73,3.63,588.73Z';
  const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElem.setAttributeNS(null, 'd', path);

  // renderer.DrawArc(arcDrawingSettings);
  let anim = new Animation({
    duration: 10000,
    path: pathElem,
    renderFn: function(x, y) {
      arcDrawingSettings.center.x = x;
      arcDrawingSettings.center.y = y;
      rendererSettings.shadow!.blur = 32 * Math.sin(window.performance.now() / 1000) + 32;

      renderer.ClearCanvas();
      renderer.DrawArc(arcDrawingSettings, rendererSettings);
    },
    timingFn: 'linear',
    loop: true,
    // onStart: () => console.log('start'),
    // onPlay: () => console.log('playing'),
    // onEnd: () => console.log('end'),
  });

  setTimeout(() => {
    anim.Play();
  }, 1000);
}

function Init() {
  bgImg.src = bg;
  bgImg.addEventListener('load', onImgLoad);
}

window.addEventListener('load', Init);