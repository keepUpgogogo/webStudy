//创建一个链表节点
class creatNode {
  next: object;
  val: unknown;
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}
//创建一个链表对象
class ChainList {
  head: object;
  size: number;
  constructor() {
    this.head = null;
    this.size = 0;
  }
  //增加一个节点
  append(val: unknown) {
    let node = new creatNode(val);
    let current: any;

    if (this.size == 0) {
      this.head = node;
    } else {
      current = this.getLastNode(this.head);
      current.next = node;
    }

    this.size++;
  }
  //拿到最后一个节点
  getLastNode(current: any): object {
    if (current.next == null) {
      return current;
    }
    current = current.next;
    return this.getLastNode(current);
  }
}

const list1 = new ChainList();
list1.append(1);
list1.append(2);
list1.append(3);

//反转链表
function reverse<T>(list: T): void {
  let pre: T = list["head"];
  let after: T | null = pre["next"];
  let broker: T | null;
  pre["next"] = null;
  while (after) {
    broker = after["next"];
    after["next"] = pre;
    pre = after;
    after = broker;
  }
  list["head"] = pre;
}

//从头到尾打印链表
function printList<T>(listObj: T): Array<unknown> {
  let arr: Array<unknown> = [];
  let first: T = listObj["head"];
  while (first) {
    arr.unshift(first["val"]);
    first = first["next"];
  }
  return arr;
}
// console.dir(printList(list1));
