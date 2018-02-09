function noop(target, property, descrptor) {
  console.log(target, property, descrptor)
  return descrptor
}

class X {
  p = 'x'
  constructor(a) {
    this.p = a
  }
}

const computed = 'key'

class Y extends X {
  static V = this.s; // NOTE: ";" is required!
  // p = this
  [computed] = this[computed];
  [computed] = 'const'
  p() {}

  get c() {};
  arrFunc = () => {};
  xarrFunc = 2
  xarrFunc = 's'
  norFunca = typeof X === 's' && function () {}

  @noop
  norFuncb = 's' + 2

  norFuncc = this.X
  norFuncd = Y
  _this = this

  norFunce = typeof X === 's' ? function () {} : 0
  x = {
    x: this.y
  }

  x = this.x;
  p = 's';

  g = this.x;
  constructor() {
    super();
  }

  @noop
  p = typeof this.p === 'undefined' ? 's' : this.p
}

// new Y({ p: 123 }).p
