export class Match {
  constructor(value, index, css) {
    this.value = value;
    this.index = index;
    this.length = value.length;
    this.css = css;
    this.brushName = null;
  }

  toString() {
    return this.value;
  }
}
