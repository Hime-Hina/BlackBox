export abstract class Game {
  protected _frameID: number = 0;
  protected _hasStarted = false;
  constructor() {}

  Start(...args: any[]) {
    this._hasStarted = true;
    console.log("Game start.");
  }
  abstract Update: (timeStamp: number) => void;
  Pause() {
    if (this._hasStarted) {
      this._hasStarted = false;
      window.cancelAnimationFrame(this._frameID);
    }
  }
}