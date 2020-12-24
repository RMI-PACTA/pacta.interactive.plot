class techexposure {

  constructor(container, data, labels,opts) {
    let container_div;
    if (typeof container === "string") {
      container_div = document.querySelector(container);
    } else {
      container_div = container;
    }

    d3.select(container_div).attr("chart_type", "techexposure");
    d3.select(container_div).attr("chart_type_data_download", "techexposure"); //matching the names in the export/ folder

    container_div.classList.add("d3chart");
    container_div.classList.add("techexposure_chart");

    const container_div_width = parseInt(window.getComputedStyle(container_div, null).width);

    const chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);

    // set options
    opts = (typeof opts === 'undefined') ? {} : opts;
    const default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    const default_percent = (typeof opts.default_percent === 'undefined') ? "" : opts.default_percent;
    const default_benchmark = (typeof opts.default_benchmark === 'undefined') ? "" : opts.default_benchmark;
    const legend_order = opts.legend_order;

    // set labels
    labels = (typeof labels === 'undefined') ? {} : labels;
    const title_what = (typeof labels.port_label === 'undefined') ? ": Technology mix " : labels.title_what,
    title_opts_how = (typeof labels.port_label === 'undefined') ? {opt_asset: "as % of assets under management", opt_sec:"as % of sector"} : labels.title_opts_how,
    title_how = (typeof labels.port_label === 'undefined') ? "compared to " : labels.title_how,
    caption_market = (typeof labels.port_label === 'undefined') ? "Equity market: " : labels.caption_market,
    port_label = (typeof labels.port_label === 'undefined') ? "This portfolio" : labels.port_label,
    comp_label = (typeof labels.comp_label === 'undefined') ? "Benchmark" : labels.comp_label,
    hover_over_asset = (typeof labels.port_label === 'undefined') ? " of assets under management<br>" : labels.hover_over_asset,
    hover_over_sec = (typeof labels.hover_over_sec === 'undefined') ? {before_sec: " of ", after_sec: " sector"} : labels.hover_over_sec,
    hover_over_low_carbon = (typeof labels.hover_over_low_carbon === 'undefined') ? {before_sec: "Low-carbon ", after_sec: " technologies<br>"} : labels.hover_over_low_carbon;

    // settings
    const ttl_width = 700;
    let margin = {top: 40, right: 140, bottom: 40, left: 10};

    const bar_width = 30;
    const bar_gap = 12;
    const sector_gap = 10;
    const portfolio_label_offset = 25;

    // determine left margin based on portfolio name
    //const portfolio_name = data.filter(d => d.this_portfolio)[0].portfolio_name;
    const portfolio_name = port_label;
    let label_width = 0;
    let test_svg = d3.select(chart_div).append("svg")
    test_svg.append("text")
      .text(portfolio_name)
      .attr("font-size","10")
      .each(function() { label_width = this.getBBox().width; })
    ;
    test_svg.remove();
    margin.left += label_width + portfolio_label_offset;
    let width = ttl_width - margin.left - margin.right;

    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "techexposure_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", change_class);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';

    // benchmark selector
    let benchmark_selector = document.createElement("select");
    benchmark_selector.classList = "techexposure_benchmark_selector inline_text_dropdown";
    benchmark_selector.addEventListener("change", update);

    // percent selector
    let percent_selector = document.createElement("select");
    percent_selector.classList = "techexposure_percent_selector inline_text_dropdown";
    percent_selector.addEventListener("change", update);
    percent_selector.add(new Option(title_opts_how.opt_asset, 0));
    percent_selector.add(new Option(title_opts_how.opt_sec, 1));
    percent_selector.options[0].selected = 'selected';

    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = ttl_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(percent_selector);
    titlediv.appendChild(document.createElement("br"));
    titlediv.appendChild(document.createTextNode(title_how));
    titlediv.appendChild(benchmark_selector);
    chart_div.appendChild(titlediv);

     // market selector
    let market_selector = document.createElement("select");
    market_selector.classList = "time_line_market_selector inline_text_dropdown";
    market_selector.addEventListener("change", update);

    // create bottom filters
    let filtersdiv = document.createElement("div");
    filtersdiv.style.width = this.ttl_width + "px";
    filtersdiv.classList = "chart_filters";
    filtersdiv.appendChild(document.createTextNode(caption_market));
    filtersdiv.appendChild(market_selector);
    chart_div.appendChild(filtersdiv);

    let y_sector = d3.scaleBand();
    let y_port = d3.scaleBand();
    let x = d3.scaleLinear();

    function num_format(num) {
      num = Math.round( ( num + Number.EPSILON ) * 1000 ) / 10;
      if (num < 0.1) {
        return "< 0.1%"
      }
      return num + "%"
    }

    const tooltip = d3.select(chart_div)
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;

    let svg = d3.select(chart_div)
      .append("svg")
      .attr("width", ttl_width)
    ;

    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;

    let legend_group = svg.append("g").attr("class", "legend_group");

    svg = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let bars_group = svg.append("g").attr("class", "bars_group");
    let green_group = svg.append("g").attr("class", "green_group");
    let sector_labels_grp = svg.append("g").attr("class", "sector_labels");
    let port_labels_grp = svg.append("g").attr("class", "port_labels");
    let xaxis_group = svg.append("g").attr("class", "xaxis_group");

    class_selector.dispatchEvent(new Event('change'));

    // for determining right margin length based on label length
    function findLongestName(data) {
      let longest_name_length = d3.max(data, d=>d.technology_translation.length);
      let long_test_label = new Array(longest_name_length).join("a")
      return long_test_label;
    };

    function orderLegendDataIfPossible(legend_data_unordered, legend_order) {
      if (typeof legend_order === 'undefined') {
        return legend_data_unordered
      } else {
        let chart_sectors = d3.map(legend_data_unordered, d => d.ald_sector).keys();
        let chart_technologies = d3.map(legend_data_unordered, d => d.technology).keys();

        let legend_data = []

        legend_order.forEach( function(item) {
          if ( chart_sectors.includes(item.ald_sector) && chart_technologies.includes(item.technology)) {
            let idx = legend_data_unordered.findIndex(d => (d.ald_sector == item.ald_sector && d.technology == item.technology))
            legend_data.push(legend_data_unordered[idx])
          }
        })

        if (legend_data_unordered.length > legend_data.length) {
          console.warn("Not all sector/technology pairs from the data were found in sector_order variable. The legend shown is incomplete. Please, amend the sector_order.csv file. ")
        }

        return legend_data
      }
    }


    function change_class() {
      let selected_class = class_selector.value;
      let selected_benchmark = benchmark_selector.value;
      let selected_market = (typeof market_selector.value === "undefined") ? 'Global' : market_selector.value;

      let subdata = data.filter(d => d.asset_class_translation == class_selector.value);

      // reset the market selector for the selected asset class
      market_selector.length = 0;

      let market_names = d3.map(subdata, d => d.equity_market_translation).keys();
      market_names.forEach(market_name => market_selector.add(new Option(market_name, market_name)));
      market_selector.options[Math.max(0, market_names.indexOf(selected_market))].selected = 'selected';
      resize_inline_text_dropdown(null, market_selector);

      subdata = subdata.filter(d => d.equity_market_translation == market_selector.value);

      // reset selectors based on current asset class selection
      let benchmark_names = d3.map(subdata.filter(d => !d.this_portfolio), d => d.portfolio_name).keys().sort();
      benchmark_selector.length = 0;
      benchmark_names.forEach(benchmark_name => benchmark_selector.add(new Option(benchmark_name, benchmark_name)));
      benchmark_selector.options[Math.max(benchmark_names.indexOf(selected_benchmark), 0)].selected = 'selected';

      benchmark_selector.dispatchEvent(new Event('change'));

      //d3.select(chart_div).select("svg").selectAll("g > *").remove()
    }


    function update() {

      // filter out unselected asset class
      let subdata = data.filter(d => d.asset_class_translation == class_selector.value);

      // filter out unselected equity markets
      subdata = subdata.filter(d => d.equity_market_translation == market_selector.value);

      // filter out unselected benchmarks
      subdata = subdata.filter(d => d.this_portfolio == true | d.portfolio_name == benchmark_selector.value);

      // filter out sectors from the benchmark that do not exist in the portfolio
      let port_sectors = d3.map(subdata.filter(d => d.this_portfolio == true), d => d.ald_sector_translation).keys();
      subdata = subdata.filter(d => port_sectors.includes(d.ald_sector_translation));

      // determine height based on number of sectors in portfolio
      let height = (port_sectors.length * (((bar_width + bar_gap) * 2) + sector_gap));
      d3.select(chart_div).select("svg").attr("height", height + margin.top + margin.bottom);

      //increase right margin if labels too long
      let label_width = 0;
      let long_label = findLongestName(subdata);

      let test_svg = d3.select(chart_div).append("svg")
      test_svg.append("text")
        .attr("font-size","10")
        .text(long_label)
        .each(function() { label_width = this.getBBox().width; })
      ;
      test_svg.remove();

      if (margin.right < label_width+30) {
        margin.right_new = label_width+30;
        width = ttl_width - margin.right_new - margin.left;
      };

      y_sector.range([0, height]).domain(port_sectors);
      y_port.range([0, (bar_width + bar_gap) * 2]).domain([true, false]);
      x.range([0, width])
      .domain([0, (+percent_selector.value == 1 ? 1 : d3.max(subdata.map(d => (d.cumsum + d.plan_carsten))))]).nice();

      let t = d3.transition().duration(500);

      let bars = bars_group.selectAll("rect").data(subdata);
      bars.exit().transition(t).attr("width", 0).remove();
      bars.enter()
        .append("rect")
        .attr("height", bar_width)
        .attr("class", "bar")
        .attr("class", d => d.ald_sector + " " + d.technology)
        .attr("transform", d => "translate(0," + y_sector(d.ald_sector_translation) + ")")
        .attr("y", d => y_port(d.this_portfolio))
        .attr("x", 0)
        .attr("width", 0)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .transition(t)
        .attr("x", d => +percent_selector.value == 1 ? x(d.sector_cumprcnt) : x(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? x(d.sector_prcnt) : x(d.plan_carsten))
      ;
      bars.transition(t)
        .attr("class", d => d.ald_sector + " " + d.technology)
        .attr("transform", d => "translate(0," + y_sector(d.ald_sector_translation) + ")")
        .attr("y", d => y_port(d.this_portfolio))
        .attr("x", d => +percent_selector.value == 1 ? x(d.sector_cumprcnt) : x(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? x(d.sector_prcnt) : x(d.plan_carsten))
      ;

      let green_bars = green_group.selectAll("rect").data(subdata);
      green_bars.exit().transition(t).attr("width", 0).remove();
      green_bars.enter()
        .append("rect")
        .attr("class", "green_bar")
        .attr("height", 5)
        .attr("fill", "green")
        .attr("visibility", d => d.green ? "visible" : "hidden")
        .on("mouseover", mouseover_green)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .attr("transform", d => "translate(0," + y_sector(d.ald_sector_translation) + ")")
        .attr("y", d => y_port(d.this_portfolio) + bar_width + 2)
        .attr("x", 0)
        .attr("width", 0)
        .transition(t)
        .attr("x", d => +percent_selector.value == 1 ? x(d.sector_cumprcnt) : x(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? x(d.sector_prcnt) : x(d.plan_carsten))
      ;
      green_bars.transition(t)
        .attr("visibility", d => d.green ? "visible" : "hidden")
        .attr("transform", d => "translate(0," + y_sector(d.ald_sector_translation) + ")")
        .attr("y", d => y_port(d.this_portfolio) + bar_width + 2)
        .attr("x", d => +percent_selector.value == 1 ? x(d.sector_cumprcnt) : x(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? x(d.sector_prcnt) : x(d.plan_carsten))
      ;

      let sector_labels = sector_labels_grp.selectAll(".sector_label").data(port_sectors);
      sector_labels.exit().remove();
      sector_labels.enter()
        .append("text")
        .attr("class", "sector_label")
        .style("alignment-baseline", "bottom")
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size","10")
        .attr("transform", d => "translate(0," + y_sector(d) + ") " + "translate(-5," + (bar_width + (bar_gap / 2)) + ") rotate(-90)")
        .text(d => d)
      ;
      sector_labels.transition(t)
        .attr("transform", d => "translate(0," + y_sector(d) + ") " + "translate(-5," + (bar_width + (bar_gap / 2)) + ") rotate(-90)")
        .text(d => d)
      ;

      let port_labels = port_labels_grp.selectAll(".portfolio_label")
        .data(port_sectors.map(d => { return [{ ald_sector_translation: d, this_portfolio: true}, { ald_sector_translation: d, this_portfolio: false}] }).flat())
      ;
      port_labels.exit().remove();
      port_labels
        .enter()
        .append("text")
        .attr("class", "portfolio_label")
        .style("alignment-baseline", "central")
        .style("text-anchor", "end")
        .attr("fill", "black")
        .attr("font-size", "0.7em")
        .text(d => d.this_portfolio ? port_label : comp_label)
        .attr("transform", d => "translate(-" + portfolio_label_offset + "," + y_sector(d.ald_sector_translation) + ")")
        .attr("y", d => y_port(d.this_portfolio) + (bar_width / 2))
      ;
      port_labels.transition(t)
        .text(d => d.this_portfolio ? port_label : comp_label)
        .attr("transform", d => "translate(-" + portfolio_label_offset + "," + y_sector(d.ald_sector_translation) + ")")
        .attr("y", d => y_port(d.this_portfolio) + (bar_width / 2))
      ;

      xaxis_group
        .attr("class", "axis")
        .transition(t)
        .attr("transform", "translate(" + 0 + "," + (height - 20) + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")))
      ;

      legend_group.attr("transform","translate(" + (width + margin.left + 20) + ",5)");

      let legend_data_unordered = subdata.filter(d => d.sector_prcnt > 0)
        .map(d => (({ ald_sector, technology, ald_sector_translation, technology_translation }) => ({ ald_sector, technology, ald_sector_translation, technology_translation }))(d))
        .filter((v,i,a)=>a.findIndex(t=>(t.ald_sector === v.ald_sector && t.technology===v.technology))===i)

      let legend_data = orderLegendDataIfPossible(legend_data_unordered,legend_order);

      window.subdata = subdata;
      window.legend_data = legend_data;

      let legend_rects = legend_group.selectAll("rect").data([]);
      legend_rects.exit().remove();

      let legend_text = legend_group.selectAll("text").data([]);
      legend_text.exit().remove();

      let legend_sector_labels = legend_group.selectAll(".sector_labels_legend").data([]);
      legend_sector_labels.exit().remove();

      let unique_sectors = d3.map(legend_data, d => d.ald_sector_translation).keys();
      let sector_gap_legend = 25;

      $.each(legend_data, function(index,item) {
        legend_data[index]["sector_shift"] = unique_sectors.indexOf(item.ald_sector_translation);
      })

      let tech_in_prev_sectors = [];
      tech_in_prev_sectors[0] = 0;
      for (var i=1;i<unique_sectors.length;i++) {
        tech_in_prev_sectors[i] = tech_in_prev_sectors[i-1] + legend_data.filter((obj) => obj.ald_sector_translation === unique_sectors[i-1]).length
      }

      legend_group.selectAll("rect")
          .data(legend_data)
          .enter()
          .append("rect").attr("width", 12).attr("height", 12)
          .attr("class", d => d.ald_sector + " " + d.technology)
          .attr("x", 0)
          .attr("y", (d,i) => i * 17 + d.sector_shift * sector_gap_legend + 20)
        ;

      legend_group.selectAll("text")
          .data(legend_data)
          .enter()
          .append("text")
          .text(d => d.technology_translation)
          .style("alignment-baseline", "central")
          .style("text-anchor", "start")
          .attr("font-size", "0.7em")
          .attr("x", 25)
          .attr("y", (d,i) => i * 17 + 6 + d.sector_shift * sector_gap_legend + 20)
        ;

      legend_group.append("g").attr("class", "sector_labels_legend")
        .selectAll("text")
          .data(unique_sectors)
          .enter()
          .append("text")
          .text(d => d)
          .style("alignment-baseline", "central")
          .style("text-anchor", "start")
          .attr("font-size", "0.7em")
          .attr("x", 0)
          .attr("y", (d,i) => tech_in_prev_sectors[i] * 17 + 6 + i * sector_gap_legend)
        ;

    }


    function mouseover(d) {
      tooltip
        .html(tech_id2name(d.technology) + "<br>" +
              num_format(d.plan_carsten) + hover_over_asset +
              num_format(d.sector_prcnt) + hover_over_sec.before_sec + d.ald_sector + hover_over_sec.after_sec
             )
        .style("display", "inline-block")
    }


    function mouseover_green(d) {
      tooltip
        .html(hover_over_low_carbon.before_sec + tech_id2name(d.ald_sector) + hover_over_low_carbon.after_sec +
              num_format(d.green_sum) + hover_over_asset +
              num_format(d.green_prcnt) + hover_over_sec.before_sec + d.ald_sector + hover_over_sec.after_sec
             )
        .style("display", "inline-block")
    }


    function mousemove(d) {
      tooltip
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
    }


    function mouseout(d) {
      tooltip.style("display", "none")
    }
  }
}
