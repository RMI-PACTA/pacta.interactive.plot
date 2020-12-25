class trajectory_alignment {

  constructor(container, data, labels, opts) {
    let container_div;
    if (typeof container === "string") {
      container_div = document.querySelector(container);
    } else {
      container_div = container;
    }
    
    d3.select(container_div).attr("chart_type", "trajectory_alignment");
    d3.select(container_div).attr("chart_type_data_download", "trajectory_alignment"); //matching the names in the export/ folder

    container_div.classList.add("d3chart");
    container_div.classList.add("trajectory_alignment_chart");
    d3.select(container_div).attr("constructor_name", "trajectory_alignment");

    const container_div_width = parseInt(window.getComputedStyle(container_div, null).width);

    const chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);

    // set options
    opts = (typeof opts === 'undefined') ? {} : opts;
    const default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    const default_tech = (typeof opts.default_tech === 'undefined') ? "" : opts.default_tech;
    const default_benchmark = (typeof opts.default_benchmark === 'undefined') ? "" : opts.default_benchmark;
    let value_var = (typeof opts.value_var === "undefined") ? "value" : opts.value_var; // "value" or "prcnt_chg"
    const scenarios_to_include = (typeof opts.scenarios_to_include === "undefined") ? ["B2DS", "SDS", "NPS", "CPS","1.5c","2c","ref"] : opts.scenarios_to_include;
    const ttl_width = (typeof opts.ttl_width === "undefined") ? 700 : opts.ttl_width;
    const ttl_height = (typeof opts.ttl_height === "undefined") ? 400 : opts.ttl_height;
    const area_opacity = (typeof opts.area_opacity === "undefined") ? 1 : opts.area_opacity;
    let end_year = (typeof opts.end_year === "undefined") ? 2024 : opts.end_year;

    //set labels
    labels = (typeof labels === 'undefined') ? {} : labels;
    const title_what = (typeof labels.title_what === 'undefined') ? ": Production trajectory of " : labels.title_what,
    title_how = (typeof labels.title_how === 'undefined') ? "compared to " : labels.title_how,
    caption_alloc = (typeof labels.caption_alloc === 'undefined') ? "Allocation method: " : labels.caption_alloc,
    caption_market = (typeof labels.caption_market === 'undefined') ? "Equity market: " : labels.caption_market,
    caption_geography = (typeof labels.caption_geography === 'undefined') ? "Scenario geography: " : labels.caption_geography,
    ytitle = (typeof labels.ytitle === 'undefined') ? " production in " : labels.ytitle,
    portfolio_label = (typeof labels.portfolio_label === 'undefined') ? "Portfolio" : labels.portfolio_label,
    benchmark_label = (typeof labels.benchmark_label === 'undefined') ? "Benchmark" : labels.benchmark_label,
    caption_source = (typeof labels.caption_source === 'undefined') ? "Scenario source: " : labels.caption_source;

    // settings
    const margin = {top: 20, right: 140, bottom: 20, left: 70};
    let width = ttl_width - margin.left - margin.right;
    let height = ttl_height - margin.top - margin.bottom;

    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "techexposure_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", change_class);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';

    // benchmark selector
    let benchmark_selector = document.createElement("select");
    benchmark_selector.classList = "trajectory_alignment_benchmark_selector inline_text_dropdown";
    benchmark_selector.addEventListener("change", change_class);

    // allocation selector
    let allocation_selector = document.createElement("select");
    allocation_selector.classList = "trajectory_alignment_allocation_selector inline_text_dropdown";
    allocation_selector.addEventListener("change", change_class);

    // market selector
    let market_selector = document.createElement("select");
    market_selector.classList = "trajectory_alignment_market_selector inline_text_dropdown";
    market_selector.addEventListener("change", change_class);

    // geography selector
    let geo_selector = document.createElement("select");
    geo_selector.classList = "trajectory_alignment_geo_selector inline_text_dropdown";
    geo_selector.addEventListener("change", change_class);

    // source selector
    let source_selector = document.createElement("select");
    source_selector.classList = "trajectory_alignment_source_selector inline_text_dropdown";
    source_selector.addEventListener("change", change_class);    

    // tech selector
    let tech_selector = document.createElement("select");
    tech_selector.classList = "trajectory_alignment_tech_selector inline_text_dropdown";
    tech_selector.addEventListener("change", change_class);

    function appendOptionsToTechSelector(tech_selector,data,selected_option) {
      let data_not_benchmark = data.filter(d => !d.benchmark);
      let sector_tech_grps = d3.rollups(data_not_benchmark, v => d3.map(v, d => d.technology_translation).keys().sort(), d => d.ald_sector_translation);
      let grp, optgrp, opt, option;
      for (var i = 0; i < sector_tech_grps.length; ++i) {
        grp = sector_tech_grps[i];
        optgrp = document.createElement("optgroup");
        optgrp.label = grp[0];
        for (var j = 0; j < grp[1].length; ++j) {
          option = grp[1][j];
          opt = document.createElement("option");
          opt.textContent = option;
          opt.value = option;
          optgrp.appendChild(opt);
        }
        tech_selector.appendChild(optgrp);
      }
      tech_selector.options[Math.max(sector_tech_grps.map(d => d[1]).flat().indexOf(selected_option), 0)].selected = 'selected';

      return tech_selector;
    }

    tech_selector = appendOptionsToTechSelector(tech_selector,data,default_tech);

    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = ttl_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(tech_selector);
    titlediv.appendChild(document.createElement("br"));
    titlediv.appendChild(document.createTextNode(title_how));
    titlediv.appendChild(benchmark_selector);
    chart_div.appendChild(titlediv);

    // create bottom filters
    let filtersdiv = document.createElement("div");
    filtersdiv.style.width = ttl_width + "px";
    filtersdiv.classList = "chart_filters";
    filtersdiv.appendChild(document.createTextNode(caption_alloc));
    filtersdiv.appendChild(allocation_selector);
    filtersdiv.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));
    filtersdiv.appendChild(document.createTextNode(caption_market));
    filtersdiv.appendChild(market_selector);
    chart_div.appendChild(filtersdiv);

    // create source filters
    let scenfiltersdiv = document.createElement("div");
    scenfiltersdiv.style.width = ttl_width + "px";
    scenfiltersdiv.classList = "chart_filters";
    scenfiltersdiv.appendChild(document.createTextNode(caption_geography));
    scenfiltersdiv.appendChild(geo_selector);
    scenfiltersdiv.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));
    scenfiltersdiv.appendChild(document.createTextNode(caption_source));
    scenfiltersdiv.appendChild(source_selector);
    chart_div.appendChild(scenfiltersdiv);    

    // parse year to date
    data.forEach(d => d.date = d3.timeParse("%Y")(d.year));

    // start building
    let x = d3.scaleTime().range([0, width]).clamp(true);

    const tooltip = d3.select(chart_div)
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;

    let svg = d3.select(chart_div)
      .append("svg")
      .attr("width", ttl_width)
      .attr("height", ttl_height)
    ;
    
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;
    
    svg.append("svg:defs")
      .append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("svg:path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
    ;

    svg = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xaxis_grp = svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
    ;

    let yaxis_grp = svg.append("g").attr("class", "yaxis");

    let yaxislabel_grp = svg.append("g").attr("class", "yaxislabel");

    let area_paths_grp = svg.append("g").attr("class", "area_paths");

    let production_line_grp = svg.append("g").attr("class", "production_line_grp");

    let benchmark_line_grp = svg.append("g").attr("class", "benchmark_line_grp");

    let legend_grp = svg.append("g").attr("transform", "translate(" + (width + 10) + ",0)").attr("class", "legend_grp");

    // run it
    class_selector.dispatchEvent(new Event('change'));


    function change_class() {

      let selected_class = class_selector.value;
      let selected_tech = tech_selector.value;

      let selected_benchmark = (typeof benchmark_selector.value === "undefined") ? '' : benchmark_selector.value;
      let selected_allocation = (typeof allocation_selector.value === "undefined") ? 'Portfolio Weight' : allocation_selector.value;
      let selected_market = (typeof market_selector.value === "undefined") ? 'Global Market' : market_selector.value;
      let selected_geo = (typeof geo_selector.value === "undefined") ? 'Global' : geo_selector.value;
      let selected_source = (typeof source_selector.value === "undefined") ? '' : source_selector.value;
      
      let subdata = data.filter(d => d.asset_class_translation == selected_class);
      subdata = subdata.filter(d => scenarios_to_include.concat("production").indexOf(d.scenario) >= 0);
         
      // reset the allocation selector for the selected asset class
      allocation_selector.length = 0;

      let allocation_names = d3.map(subdata, d => d.allocation_translation).keys();
      allocation_names.forEach(allocation_name => allocation_selector.add(new Option(allocation_name, allocation_name)));
      allocation_selector.options[Math.max(0, allocation_names.indexOf(selected_allocation))].selected = 'selected';
      resize_inline_text_dropdown(null, allocation_selector);
      
      subdata = subdata.filter(d => d.allocation_translation == allocation_selector.value);
      
      // reset the tech selector for the selected asset class
      tech_selector.querySelectorAll("optgroup").forEach(d => tech_selector.removeChild(d));

      tech_selector = appendOptionsToTechSelector(tech_selector,subdata,selected_tech);

      resize_inline_text_dropdown(null, tech_selector);
      
      subdata = subdata.filter(d => d.technology_translation == tech_selector.value);

      // reset the market selector for the selected asset class
      market_selector.length = 0;

      let market_names = d3.map(subdata, d => d.equity_market_translation).keys();
      market_names.forEach(market_name => market_selector.add(new Option(market_name, market_name)));
      market_selector.options[Math.max(0, market_names.indexOf(selected_market))].selected = 'selected';
      resize_inline_text_dropdown(null, market_selector);

      // reset the benchmark selector for the selected asset class
      benchmark_selector.length = 0;

      let benchmark_names = d3.map(subdata.filter(d => d.benchmark), d => d.portfolio_name).keys();
      benchmark_names.forEach(benchmark_name => benchmark_selector.add(new Option(benchmark_name, benchmark_name)));
      benchmark_selector.options[0].selected = 'selected';
      benchmark_selector.options[Math.max(0, benchmark_names.indexOf(selected_benchmark))].selected = 'selected';
      resize_inline_text_dropdown(null, benchmark_selector);

      // reset the geography selector for the selected asset class
      geo_selector.length = 0;

      let geo_names = d3.map(subdata, d => d.scenario_geography_translation).keys();
      geo_names.forEach(geo_name => geo_selector.add(new Option(geo_name, geo_name)));
      geo_selector.options[0].selected = 'selected';
      geo_selector.options[Math.max(0, geo_names.indexOf(selected_geo))].selected = 'selected';
      resize_inline_text_dropdown(null, geo_selector);

      // reset the source selector for the selected asset class
      source_selector.length = 0;

      let source_names = d3.map(subdata, d => d.source).keys();
      source_names.forEach(source_name => source_selector.add(new Option(source_name, source_name)));
      source_selector.options[0].selected = 'selected';
      source_selector.options[Math.max(0, source_names.indexOf(selected_source))].selected = 'selected';
      resize_inline_text_dropdown(null, source_selector);
      
      
      update();

    }

    function update() {

      let selected_class = class_selector.value;
      let selected_tech = tech_selector.value;
      let selected_tech_org = data.filter(d => d.technology_translation == selected_tech)[0]["technology"];
      let selected_benchmark = benchmark_selector.value;
      let selected_allocation = allocation_selector.value;
      let selected_market = market_selector.value;
      let selected_geography = geo_selector.value;
      let selected_source = source_selector.value;

      let subdata = data.filter(d => d.technology_translation == selected_tech);
      subdata = subdata.filter(d => d.asset_class_translation == selected_class);
      subdata = subdata.filter(d => d.allocation_translation == selected_allocation);
      subdata = subdata.filter(d => d.equity_market_translation == selected_market);
      subdata = subdata.filter(d => d.scenario_geography_translation == selected_geography);
      subdata = subdata.filter(d => d.source == selected_source);
      subdata = subdata.filter(d => scenarios_to_include.concat("production").indexOf(d.scenario) >= 0);
      subdata = subdata.filter(d => d.year <= end_year);

      let color, legend_order;

      if (selected_source=="GECO2019") {
        color = d3.scaleOrdinal()
          .domain(["production", "1.5c", "2c", "ref", "worse"])
          .range(["black", "#709458", "#8db96e", "#FDF28D", "#e07b73"])
        ;
        legend_order = ["worse", "ref", "2c", "1.5c"];
      } else {
        color = d3.scaleOrdinal()
          .domain(["production", "B2DS", "SDS", "NPS", "CPS", "worse"])
          .range(["black", "#9cab7c", "#c3d69b", "#FFFFCC", "#fde291", "#e07b73"])
          legend_order = ["worse", "CPS", "NPS", "SDS", "B2DS"];
        ;
      }

      let production_data = subdata.filter(d => !d.benchmark && d.scenario == "production");
      let benchmark_data = subdata.filter(d => d.portfolio_name == selected_benchmark);
      let areadata = subdata.filter(d => !d.benchmark);
      subdata = subdata.filter(d => !d.benchmark || d.portfolio_name == selected_benchmark);

      let unit = d3.map(production_data, d => d.unit_translation).keys()[0];

      var sumstat = d3.nest()
        .key(d => d.scenario)
        .entries(areadata)
        .sort(d => d.key == "production")
      ;

      function direction(tech) {
        switch(tech) {
          case "Oil": return true; break;
          case "Coal": return true; break;
          case "Gas": return true; break;
          case "Electric": return false; break;
          case "Hybrid": return false; break;
          case "ICE": return true; break;
          case "CoalCap": return true; break;
          case "GasCap": return true; break;
          case "HydroCap": return false; break;
          case "NuclearCap": return false; break;
          case "OilCap": return true; break;
          case "RenewablesCap": return false; break;
          case "FuelCell": return false; break;
          default: console.log("undefined tech:", tech)
        }
      }
      let descending = direction(selected_tech_org);

      function format_axis(value_var) {
        if (value_var == "ratio") {
          return d3.format(".0%");
        } else if (value_var == "prcnt_chg") {
          return d3.format(".0%");
        } else {
          return d3.format(".2s");
        }
      }

      let y;
      if (value_var == "ratio") {
        y = d3.scaleLog().range([height, 0]).clamp(true);
      } else if (value_var == "prcnt_chg") {
        y = d3.scaleLinear().range([height, 0]).clamp(true);
      } else {
        y = d3.scaleLinear().range([height, 0]).clamp(true);
      }

      x.domain(d3.extent(subdata, d => d.date));
      
      let benchmark_extent;
      let scale_factor;
      if (benchmark_data.length > 0) {
        scale_factor = production_data[0].value / benchmark_data[0].value;
        benchmark_extent = d3.extent(benchmark_data, d => d[value_var] * scale_factor);
      } else {
        benchmark_extent = null;
      }
      let production_extent = d3.extent(production_data, d => d[value_var]);
      let areadata_extent = d3.extent(areadata, d => d[value_var]);      
      y.domain(d3.extent([benchmark_extent, production_extent, areadata_extent].flat())).nice();


      let valueline = d3.line()
        .x(d => x(d.date))
        .y(d => y(+d[value_var]))
        .defined(d => !d.estimate && d.year <= end_year)
      ;

      let dashedline = d3.line()
        .x(d => x(d.date))
        .y(d => y(+d[value_var]))
        .defined(d => d.year <= end_year)
      ;

      const num_of_years = 1 + Math.abs(x.domain().reduce((a,b) => a.getFullYear() - b.getFullYear()));

      // areas
      let area_paths = svg.select("g.area_paths");
      area_paths.selectAll("*").remove();

      if (descending) {
        sumstat.sort((a,b) => b.values.filter(d => d.year == end_year)[0].value > a.values.filter(d => d.year == end_year)[0].value ? 1 : -1);
      } else {
        sumstat.sort((a,b) => b.values.filter(d => d.year == end_year)[0].value > a.values.filter(d => d.year == end_year)[0].value ? -1 : 1);
      }

      var area = d3.area()
        .x(d => x(d.date))
        .y0(descending ? height : 0)
        .y1(d => y(d[value_var]))
      ;

      area_paths_grp
        .append("rect")
        .attr("class", "worse")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", color("worse"))
      ;

      area_paths = area_paths_grp.selectAll(".area")
        .data(sumstat.filter(d => d.key != "production"))
      ;

      area_paths.enter()
        .append("path")
        .attr("class", d => "area " + d.key)
        .attr("d", d => area(d.values))
        .style("fill", d => color(d.key))
      ;


      // axes
      xaxis_grp.call(d3.axisBottom(x).ticks(Math.min(num_of_years, 5)));
      yaxis_grp.call(d3.axisLeft(y).ticks(8).tickFormat(format_axis(value_var)));


      // y-axis label
      yaxislabel_grp.selectAll("text").remove();

      yaxislabel_grp.append("text")
        .attr("class", "yaxislabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "bottom")
        .text(selected_tech + ytitle + unit)
      ;


      // production line
      let production_line = d3.line()
        .x(d => x(d.date))
        .y(d => y(+d[value_var]))
      ;

      production_line_grp.selectAll("path").remove();

      production_line_grp
        .append("path")
        .attr("class", "production_line")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("d", d => production_line(production_data))
      ;


      // legend
      let box_height = 30;
      let box_width = 75;
      
      let legend_data = sumstat.filter(d => d.key != "production");
      legend_data = [{key: "worse"}].concat(legend_data);
      
      legend_data.sort((a,b) => legend_order.indexOf(a.key) - legend_order.indexOf(b.key));

      
      legend_grp.selectAll("*").remove();
      
      let scenario_select = legend_grp.selectAll(null)
        .data(legend_data)
      ;
      
      scenario_select.enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d,i) => i * box_height)
        .attr("width", box_width)
        .attr("height", box_height)
        .style("fill", d => color(d.key))
      ;
      
      scenario_select.enter()
        .append("text")
        .attr("x", box_width + 8)
        .attr("y", (d,i) => i * box_height)
        .style("display", (d,i) => i == 0 ? "none" : "inline")
        .style("text-anchor", "start")
        .style("alignment-baseline", "central")
        .style("font-size", "0.8em")
        .text(d => d.key)
      ;
      
      scenario_select.enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d,i) => i * box_height)
        .attr("x2", box_width + 3)
        .attr("y2", (d,i) => i * box_height)
        .attr("marker-end", "url(#arrow)")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("display", (d,i) => i == 0 ? "none" : "inline")
      ;
      
      scenario_select.data([portfolio_label, benchmark_label])
        .enter()
        .append("text")
        .attr("transform", "translate(0," + (legend_data.length * box_height) + ")")
        .attr("x", 25)
        .attr("y", (d,i) => (i * box_height) + (box_height / 2))
        .style("text-anchor", "start")
        .style("alignment-baseline", "central")
        .style("font-size", "0.8em")
        .text(d => d)
      ;
      
      scenario_select.data([portfolio_label, benchmark_label])
        .enter()
        .append("line")
        .attr("transform", "translate(0," + (legend_data.length * box_height) + ")")
        .attr("x1", 0)
        .attr("y1", (d,i) => (i * box_height) + (box_height / 2))
        .attr("x2", 20)
        .attr("y2", (d,i) => (i * box_height) + (box_height / 2))
        .style("stroke", "black")
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", (d,i) => i == 0 ? "none" : "2,2")
      ;
      
      
      // benchmark line
      benchmark_line_grp.selectAll("path").remove();

      if (benchmark_data.length > 0) {
        let benchmark_line = d3.line()
          .x(d => x(d.date))
          .y(d => y(+d[value_var] * scale_factor))
        ;

        benchmark_line_grp
          .append("path")
          .attr("class", "benchmark_line")
          .attr("stroke-width", 1.5)
          .attr("fill", "none")
          .attr("stroke", "black")
          .style("stroke-dasharray", "2,2")
          .attr("d", d => benchmark_line(benchmark_data))
        ;
      }

    }
  }

}
