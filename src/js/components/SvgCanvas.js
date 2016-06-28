import DrawingArea from './DrawingArea';

export default class SvgCanvas {
  constructor(parentElement, config, cb) {
    // Save config

    this.width = config.canvasWidth;
    this.canvasHeight = config.canvasHeight;
    this.config = config;

    // Store refs to elements
    this.svg = this.createSvgCanvas(parentElement);
    this.drawingArea = new DrawingArea(this.svg, config);
    this.dataGroup = this.createDataGroup(this.drawingArea.element);
    this.tooltip = this.createToolTip();

    this.data = {};
    this.init();
    // Callback onLoaded
    if (cb) cb(this);
  }

  getData(url, cb) {
    d3.json(url, (err, data) => {
      this.data = this.postprocessData(data);
      if (cb) cb(err, this.data);
    });
  }
  drawGraph() {
    this.createGraph(this.dataGroup);

    this.drawXaxis(this.drawingArea.element);
    this.drawYaxis(this.drawingArea.element);

    this.drawXaxisLabel(this.drawingArea.element);
    this.drawYaxisLabel(this.drawingArea.element);
  }
  createGraph(parentElement) {
    const items = parentElement.selectAll('.dataItem').data(this.data);
    this.itemsExit(items.exit());
    this.itemsEnter(items.enter());
    this.itemsUpdate(items);
    this.axisX = this.createXaxis();
    this.axisY = this.createYaxis();
  }

  // OVERRIDE FUNCTIONS
  init() {}
  postprocessData(data) {
    // Expecting data in form of array [x,y]
    const dataX = data.map(d => d[0]);
    const minX = d3.min(dataX);
    const maxX = d3.max(dataX);

    const dataY = data.map(d => d[1]);
    const minY = d3.min(dataY);
    const maxY = d3.max(dataY);

    this.scaleX = d3.scale.linear()
                    .domain([minX, maxX])
                    .range([0, this.drawingArea.width]);
    this.scaleY = d3.scale.linear()
                    .domain([minY, maxY])
                    .range([0, this.drawingArea.height]);
    return data;
  }
  itemsExit(items) {
    items.remove();
  }
  itemsEnter(items) {
    items.append('g')
           .attr('class', 'dataItem')
           .on('mouseover', d => this.onMouseOver(d))
           .on('mouseout', () => this.onMouseOut());
  }
  itemsUpdate(items) { }
  createXaxis() {
    // Create x axis
    return d3.svg.axis()
                    .scale(this.scaleX)
                    .ticks(20)
                    .orient('bottom');
  }
  drawXaxis(parentElement) {
    // Draw x axis
    parentElement.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0, ${this.drawingArea.height})`)
            .call(this.axisX);
  }
  createYaxis() {
     // Create y axis
    return d3.svg.axis()
                    .scale(this.scaleY)
                    .ticks(20)
                    .orient('left');
  }
  drawYaxis(parentElement) {
    // Draw y axis
    parentElement.append('g')
            .attr('class', 'y axis')
            .call(this.axisY);
  }
  drawYaxisLabel(parentElement) {
    return parentElement.append('text')
            .attr('class', 'y axis label')
            .text(this.config.labelY)
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90) translate(-5,15)');
  }
  drawXaxisLabel(parentElement) {
    return parentElement.append('text')
            .attr('class', 'x axis label')
            .text(this.config.labelX)
            .attr('text-anchor', 'middle')
            .attr('x', this.drawingArea.width / 2)
            .attr('y', this.drawingArea.height - 5);
  }

  onMouseOver(dataItem) {
    const content = this.tooltipSetContent(dataItem);
    if (content !== '') {
      this.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
      this.tooltip.style('left', `${d3.event.pageX + 10}px`)
                .style('top', `${d3.event.pageY - 30}px`);
      this.tooltip.html(this.tooltipSetContent(dataItem));
    }
  }
  onMouseOut() {
    this.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
  }
  tooltipSetContent(dataItem) {
    return `${dataItem[0]} - ${dataItem[1]}`;
  }

  // INTERNAL FUNCTIONS
  createSvgCanvas(parentElement) {
    // Creates basic svg canvas
    return d3.select(parentElement)
      .append('svg')
      .attr('class', 'svgCanvas')
      .attr('width', this.config.canvasWidth)
      .attr('height', this.config.canvasHeight);
  }
  createDataGroup(parentElement) {
    return parentElement
      .append('g')
      .attr('class', 'dataGroup');
  }
  createToolTip() {
    return d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  }

}
