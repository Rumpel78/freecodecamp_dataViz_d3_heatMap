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
                    .domain(d3.range(minYear, maxYear+1))
                    .rangeBands([0, this.drawingArea.width], 0, 0);
    this.scaleY = d3.scale.ordinal()
                    .domain(d3.range(1, 13))
                    .rangeBands([0, this.drawingArea.height], 0, 0);
    this.colorScale = d3.scale.quantile()
                    .domain([this.minTemp, this.maxTemp])
                    .range(this.config.colorMap);
    this.axisScaleX = d3.scale.linear()
                    .domain([minYear, maxYear])
                    .range([0, this.drawingArea.width]);
    return data;
  }
  createYaxis() {
    const axisY = super.createYaxis();
    return axisY.tickFormat(d => this.months[d - 1]);
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
    label.attr('transform', `rotate(-90) translate(-${this.drawingArea.height / 2},-80)`)
         .attr('text-anchor', 'middle');
  }
  itemsEnter(items) {
    items.append('rect')
           .attr('class', d => `dataItem ${d.month} ${d.year}`)
           .attr('r', 5)
           .attr('x', d => this.scaleX(d.year))
           .attr('y', d => this.scaleY(d.month))
           .attr('fill', d => this.colorScale(d.temperature))
           .attr('stroke', d => this.colorScale(d.temperature))
           .attr('width', () => this.scaleX.rangeBand())
           .attr('height', () => this.scaleY.rangeBand())
           .on('mouseover', d => this.onMouseOver(d))
           .on('mouseout', () => this.onMouseOut());
  }
  onMouseOver(dataItem) {
    const content = this.tooltipSetContent(dataItem);
    if (content !== '') {
      this.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

      let ttWidth = -10;
      if(d3.event.pageX > this.width / 2) {
          ttWidth = d3.select('div.tooltip').property('offsetWidth');
      }
      const ttHeight = d3.select('div.tooltip').property('offsetHeight');
      
      this.tooltip.style('left', `${d3.event.pageX-ttWidth}px`)
                .style('top', `${d3.event.pageY - ttHeight / 2}px`);
      this.tooltip.html(this.tooltipSetContent(dataItem));
    }
  }
  tooltipSetContent(dataItem) {
    return `<h3>${this.months[dataItem.month-1]} ${dataItem.year}</h3><strong>${dataItem.temperature.toFixed(3)}°C</strong><br>${dataItem.variance}°C`;
  }
  drawGraph() {
    // Draw default graph
    super.drawGraph();

    // single color width and height
    const w = 40;
    const h = 20;

    // Create legend
    const posx = this.width - w * this.config.colorMap.length - 20;
    const posy = this.height - h - 25;
    const legend = this.svg.append('g')
                           .attr('class', 'legend')
                           .attr('transform', `translate(${posx},${posy})`);

    this.config.colorMap.forEach((c, i) => {
      legend.append('rect')
          .attr('class', 'heatmapColor')
          .attr('width', w)
          .attr('height', h)
          .attr('x', i * w)
          .attr('y', 0)
          .attr('fill', c);

      const extent = this.colorScale.invertExtent(c);
      const midTemp = ((extent[0] + extent[1]) / 2).toFixed(1);
      legend.append('text')
          .attr('text-anchor', 'middle')
          .attr('x', i * w + w / 2)
          .attr('y', h + 10)
          .text(`${midTemp}°C`);
    });
  }
}
