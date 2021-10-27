interface Pos {
  x: number;
  y: number;
  z: number;
}

interface Size {
  width: number;
  height: number;
}
interface Rect {
  pos: Pos;
  size: Size;
}
interface Circle {
  pos: Pos;
  radius: number;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}
declare module '*.jpg' {
  const content: any;
  export default content;
}