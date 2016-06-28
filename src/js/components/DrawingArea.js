export default class DrawingArea {
  constructor(parentSvg, config, cb) {

    this.width = config.canvasWidth - config.padding[0] - config.padding[2];
    this.height = config.canvasHeight - config.padding[1] - config.padding[3];
    this.translateX = config.padding[0];
    this.translateY = config.padding[1];

    this.element = parentSvg.append('g')
        .attr('class', 'drawingArea')
        .attr('transform', `translate(${this.translateX}, ${this.translateY})`)
        .attr('width', this.width)
        .attr('height', this.height);

    if (cb) cb(this);
  }
}
