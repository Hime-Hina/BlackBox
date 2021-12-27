import { Queue } from "../Core/utils/Queue";

export function TestQueue() {
  let q = new Queue([1,2,3,7,6]);

  q.Push(8);
  q.Push(3);
  q.Pop();
  while (!q.IsEmpty()) {
    console.log(q.Pop());
  }
  console.log(q.Pop());
  q.Push(7);
  console.log(q.Pop());
}