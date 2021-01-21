r2d3.onRender(function(data, div, width, height, options) {
  options = options || {};

  let labels = {
    title_what: options.title_what || "Regional exposure of ",
    title_how: options.title_how || " towards "
  };

  new choropleth(div._groups[0][0], data, labels, options);
});
