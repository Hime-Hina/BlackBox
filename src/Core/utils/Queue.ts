export class Queue<T> {
  #fnt: number = 0;
  #til: number = 0;
  #q: Map<number, T> = new Map();

  constructor(elems?: T[]) {
    if (elems) {
      elems.forEach(elem => this.Push(elem));
    }
  }

  IsEmpty() {
    return this.#fnt === this.#til;
  }
  Push(elem: T): this {
    this.#q.set(this.#til, elem);
    ++this.#til;
    return this;
  }
  Pop() {
    if (this.IsEmpty()) return ;
    let tmp = this.#q.get(this.#fnt);
    this.#q.delete(this.#fnt);
    ++this.#fnt;
    return tmp;
  }
}