import SvgCanvas from './components/SvgCanvas';

export default class GlobalWarmingHeatMap extends SvgCanvas {
  // OVERRIDE FUNCTIONS
  init() {
    this.colorsInterpolator = d3.interpolateHsl(d3.hsl(0, 1, 0.5), d3.hsl(240, 1, 0.5));
    this.months = ['January', 'February', 'March', 
                   'April', 'May', 'June',
                   'July', 'August', 'September', 
                   'October', 'November', 'December'];
  }

  getcolor(temperature) {
    const factor = (temperature - this.minTemp) / (this.maxTemp - this.minTemp);
    const h = (1.0 - factor) * 240;
    return d3.hsl(h, 1, 0.5).rgb();
  }

  postprocessData(data) {
    // Expecting data in form of array [x,y]
    const baseTemperature = data.baseTemperature;
    data = data.monthlyVariance;

    const dataYears = data.map(d => d.year);
    const minYear = d3.min(dataYears);
    const maxYear = d3.max(dataYears);

    const dataTemperature = data.map(d => {
      d.temperature = baseTemperature + d.variance;
      return d.temperature;
    });
    this.minTemp = d3.min(dataTemperature);
    this.maxTemp = d3.max(dataTemperature);

    this.scaleX = d3.scale.ordinal()
                    .domain(d3.range(minYear, maxYear))
                    .rangeBands([0, this.drawingArea.width], 0, 0);
    this.scaleY = d3.scale.ordinal()
                    .domain(d3.range(1, 13))
                    .rangeBands([0, this.drawingArea.height], 0, 0);
    this.colorScale = d3.scale.quantile()
                    .domain([this.minTemp, this.maxTemp])
                    .range(this.config.colorMap.reverse());
    this.axisScaleX = d3.scale.linear()
                    .domain([minYear, maxYear])
                    .range([0, this.drawingArea.width]);
    return data;
  }
  createYaxis() {
    const axisY = super.createYaxis();
    return axisY.tickFormat(d => this.months[d-1]);
  }
  createXaxis() {
    const axisX = d3.svg.axis()
                    .scale(this.axisScaleX)
                    .ticks(20)
                    .tickFormat(d => d.toString())
                    .orient('bottom');
    return axisX;
  }
  drawXaxisLabel(element) {
    const label = super.drawXaxisLabel(element);
    label.attr('x', this.drawingArea.width / 2)
         .attr('y', this.drawingArea.height + 45);
  }
  drawYaxisLabel(element) {
    const label = super.drawYaxisLabel(element);
    label.attr('transform', `rotate(-90) translate(-${this.drawingArea.height/2},-80)`)
         .attr('text-anchor','middle');
  }
  itemsEnter(items) {
    items.append('rect')
           .attr('class', d => `dataItem ${d.month} ${d.year}`)
           .attr('r', 5)
           .attr('x', d => this.scaleX(d.year))
           .attr('y', d => this.scaleY(d.month))
           .attr('fill', d => this.colorScale(d.temperature))
           .attr('width', () => this.scaleX.rangeBand())
           .attr('height', () => this.scaleY.rangeBand());
  }
}
