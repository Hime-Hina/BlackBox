export abstract class Game {
  protected _frameID: number = 0;
  protected _isPaused = false;
  protected _lastTimeStamp: number = 0;
  protected _delta: number = 0;
  constructor() {
    console.log("Game was constructed.");
  }

  Start(...args: any[]) {
    console.log("Game was started.");
    this._isPaused = false;
    this._lastTimeStamp = window.performance.now();
    this._frameID = window.requestAnimationFrame(this.Update);
  }
  Update(timeStamp: number): void { // Child overrides it by arrow function.
    this._delta = Math.max(0, timeStamp - this._lastTimeStamp);
    this._lastTimeStamp = timeStamp;
    this._frameID = window.requestAnimationFrame(this.Update);
  }
  Pause() {
    console.log("Game was paused.");
    if (!this._isPaused) {
      this._isPaused = true;
      window.cancelAnimationFrame(this._frameID);
    }
  }
  Resume(): void {
    console.log("Game was resumed.");
    if (this._isPaused) {
      this._isPaused = false;
      this._lastTimeStamp = window.performance.now();
      this._frameID = window.requestAnimationFrame(this.Update);
    }
  }
}