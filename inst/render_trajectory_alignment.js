r2d3.onRender(function(data, div, width, height, options) {
  new trajectory_alignment(div._groups[0][0], data);
});
