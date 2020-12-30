r2d3.onRender(function(data, div, width, height, options) {
  if (options === null) options = undefined;
  new trajectory_alignment(div._groups[0][0], data, labels = undefined, opts = options);
});
