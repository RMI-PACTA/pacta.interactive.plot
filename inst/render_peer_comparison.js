r2d3.onRender(function(data, div, width, height, options) {
  new stacked_bars(div._groups[0][0], data);
});
