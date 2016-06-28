/* eslint no-unused-vars: 0 */

import Visualization from './components/ScatterPlot';
import config from './config';


const visualization = new Visualization('.plot', config, v => {
  v.getData(config.dataUrl, (err, data) => {
    v.drawGraph();
  });
});
