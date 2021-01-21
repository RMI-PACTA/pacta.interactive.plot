class choropleth {

  constructor(container, data, labels, opts) {
    if (typeof container === "string") {
      this.container_div = document.querySelector(container);
    } else {
      this.container_div = container;
    }

    d3.select(this.container_div).attr("chart_type", "choropleth");
    d3.select(this.container_div).attr("chart_type_data_download", "map"); //matching the names in the export/ folder

    this.data = data;

    this.container_div.classList.add("choropleth");
    this.container_div.classList.add("d3chart");
    this.container_div.classList.add("regionalexposure_chart");
    this.container_div.classList.add("chart_container");

    let container_div_width = parseInt(window.getComputedStyle(this.container_div, null).width);

    let chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    this.container_div.insertBefore(chart_div, this.container_div.firstChild);

    opts = (typeof opts === 'undefined') ? {} : opts;

    this.width = (typeof opts.width === "undefined") ? 700 : opts.width;
    this.height = (typeof opts.height === "undefined") ? 300 : opts.height;
    this.asset_class = (typeof opts.asset_class === "undefined") ? "" : opts.asset_class;
    this.color_range = (typeof opts.color_range === "undefined") ? ['#e8ebf1', '#1b324f'] : opts.color_range;
    let default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    let default_tech = (typeof opts.default_tech === 'undefined') ? "" : opts.default_tech;

    labels = (typeof labels === 'undefined') ? {} : labels;

    const title_what = (typeof labels.title_what === 'undefined') ? "Regional exposure of " : labels.title_what,
    title_how = (typeof labels.title_how === 'undefined') ? ' towards ' : labels.title_how;

    this.container = d3.select(chart_div);

    this.trgt_tick_count = 8;

    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "regionalexposure_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", change_class);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';

    // tech selector
    let tech_selector = document.createElement("select");
    tech_selector.classList = "regionalexposure_tech_selector inline_text_dropdown";
    tech_selector.addEventListener("change", map_update_option);

    function appendOptionsToTechSelector(tech_selector,data,selected_option) {
      let grouped_opts = d3.rollups(data,
        v => v.map(w => w.option_translation).filter((v,i,a) => a.indexOf(v)===i),
        d => d.group_translation)
        .sort();
      let groups = grouped_opts.map(d => d[0]).sort();

      let i, j, grp, optgrp, opt;
      for (i = 0; i < grouped_opts.length; ++i) {
        grp = grouped_opts[i];
        optgrp = document.createElement("optgroup");
        optgrp.label = grp[0];
        for (j = 0; j < grp[1].length; ++j) {
          let option = grp[1][j];
          opt = document.createElement("option");
          opt.textContent = option;
          opt.value = data.filter(d=>d.option_translation==option)[0]["option"];
          optgrp.appendChild(opt);
        }
        tech_selector.appendChild(optgrp);
      }
      tech_selector.options[Math.max([...tech_selector.options].map(d => d.text).indexOf(selected_option), 0)].selected = 'selected';

      return tech_selector;
    }

    tech_selector = appendOptionsToTechSelector(tech_selector,data,default_tech);

    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = container_div_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_how));
    titlediv.appendChild(tech_selector);
    chart_div.appendChild(titlediv);

    this.svg = this.container
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
    ;

    this.svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;

    var path = d3.geoPath();
    var projection = d3.geoMercator()
      .scale(90)
      .center([0,20])
      .translate([this.width / 2, (this.height / 2) + 15])
      //.clipExtent([[0,20], [this.width, this.height]])
    ;

    var eckert3 = d3.geoEckert3()
      .scale(130)
      .translate([this.width / 2, (this.height / 2) + 25])
      .precision(.1)
      .clipExtent([[0,0], [this.width, this.height]])
    ;

    this.colorScale = d3.scaleThreshold();
    this.data_map = d3.map();
    this.units = d3.map();

    this.tooltip = this.container
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;

    this.svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      .attr("stroke", "white")
      .attr("stroke-width", "0.5")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath().projection(eckert3))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout)
    ;

    let chart = this;
    class_selector.dispatchEvent(new Event('change'));


    function tip_format(d) {
      let group = tech_selector.options[tech_selector.selectedIndex].parentNode.label;
      if (group == "Automotive") {
        if (d < 1) { return "< 1"; }
      }
      if (d < 1) { return "< 1"; }
      return d3.format(",.0f")(d);
    }

    function mouseover(d) {
      let value = chart.data_map.get(d.id);
      let unit = chart.units.get(d.id);
      chart.tooltip
        .html(d.properties["name"] + "<br>" +
              tip_format(value) + " " + unit)
        .style("display", value == undefined ? "none" : "inline-block")
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
    }

    function mousemove() {
      chart.tooltip
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
    }

    function mouseout() {
      chart.tooltip
        .style("display", "none")
    }

    function legend(g) {
      const width  = 300;
      const length = chart.colorScale.range().length;
      const slctd_option = chart.data.filter(d => d.option == tech_selector.value).map(d => d.option_translation)[0];

      const unit_text = chart.data.filter(d => d.option == tech_selector.value).map(d => d.unit_translation)[0];

      const x = d3.scaleLinear()
        .domain([1, length])
        .rangeRound([width / length, width * (length ) / length])
      ;

      g.selectAll("rect")
        .data(chart.colorScale.range())
        .enter()
        .append("rect")
        .attr("height", 8)
        .attr("x", (d, i) => x(i))
        .attr("width", (d, i) => x(i + 1) - x(i))
        .attr("fill", d => d)
      ;

      g.append("text")
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(slctd_option + " (" + unit_text + ")")
      ;

      function formatTicks(i) {
        if (chart.colorScale.domain()[i - 1] < 0.1) {
          return d3.format(",.2f")(chart.colorScale.domain()[i - 1]);
        } else if (chart.colorScale.domain()[i - 1] < 1) {
          return d3.format(",.1f")(chart.colorScale.domain()[i - 1]);
        } else if (chart.colorScale.domain()[i - 1] >= 10**6) {
          return d3.format(",.0f")(chart.colorScale.domain()[i - 1]/10**6) + "M";
        } else {
          return d3.format(",.0f")(chart.colorScale.domain()[i - 1]);
        }
      }

      g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(i=>formatTicks(i))
        .tickValues(d3.range(1, length)))
        .select(".domain")
        .remove()
      ;
    }


    function change_class() {

      let subdata = chart.data.filter(d => d.asset_class_translation == class_selector.value);

      // reset tech selector based on current asset class selection
      let selected_tech = tech_selector.value;
      tech_selector.querySelectorAll("optgroup").forEach(d => tech_selector.removeChild(d));

      tech_selector = appendOptionsToTechSelector(tech_selector,subdata,selected_tech);

      tech_selector.dispatchEvent(new Event('change'));
    }


    function map_update_option() {
      let subset = chart.data.filter(d => d.option == tech_selector.value & d.asset_class_translation == class_selector.value);

      chart.data_map.clear();
      chart.units.clear();

      subset.map(d => chart.data_map.set(d.code, +d.value));
      subset.map(d => chart.units.set(d.code, d.unit_translation));

      let values = subset.map(d=>d.value);
      let extent = d3.extent(values);

      let computed_tick_count = d3.min([subset.length, chart.trgt_tick_count]);
      let ticks = d3.scaleLinear().domain(extent).ticks(computed_tick_count);

      while (ticks.length > 8) {
        computed_tick_count = computed_tick_count - 1;
        ticks = d3.scaleLinear().domain(extent).ticks(computed_tick_count);
      }

      var color_range_scale = d3.scaleLinear().range(chart.color_range);
      let tickColors = ticks.map(d => color_range_scale.domain(d3.extent(ticks))(d));
      chart.colorScale.domain(ticks).range(tickColors);

      chart.svg.selectAll("path")
        .transition()
        .attr("value", d => d.value = chart.data_map.get(d.id))
        .attr("unit", d => chart.units.get(d.id))
        .attr("fill", d => chart.colorScale(d.value) || "ghostwhite")
      ;

      chart.svg.selectAll(".legend").remove();
      chart.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(280,275)")
        .call(legend)
      ;
    }
  }
}
