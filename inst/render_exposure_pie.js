r2d3.onRender(function(data, div, width, height, options) {
  let labels = {
    title: options.title || "Financial exposure to climate relevant sectors",
    comment: options.comment || [" of the portfolio", "in PACTA sectors"],
    numbers_long: options.numbers_long || {M: " million", G: " billion", T: " trillion"}
  };

  new PieExploded(div._groups[0][0], data, labels, options);
});
