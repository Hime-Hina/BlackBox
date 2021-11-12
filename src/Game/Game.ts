export abstract class Game {
  constructor() {}

  abstract Start(...args: any[]): void;
  abstract Update: (timeStamp: number) => void;
}