import SvgCanvas from './SvgCanvas';

export default class ScatterPlot extends SvgCanvas {
  // OVERRIDE FUNCTIONS

  itemsEnter(items) {
  // datastructure like point[x,y,radius,class]

    items.append('circle')
           .attr('class', d => `dataItem ${d[3]}`)
           .attr('cx', d => this.scaleX(d[0]))
           .attr('cy', d => this.scaleY(d[1]))
           .attr('r', d => d[2])
           .on('mouseover', d => this.onMouseOver(d))
           .on('mouseout', () => this.onMouseOut());
  }
}
