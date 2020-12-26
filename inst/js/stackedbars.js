class stacked_bars {

  constructor(container, data, labels, opts) {
    let container_div;
    if (typeof container === "string") {
      container_div = document.querySelector(container);
    } else {
      container_div = container;
    }
    
    d3.select(container_div).attr("chart_type", "stacked_bars");
    d3.select(container_div).attr("chart_type_data_download", "peercomparison"); //matching the names in the export/ folder
    
    container_div.classList.add("stacked_bars");
    container_div.classList.add("d3chart");
    container_div.classList.add("peercomparison_chart");
    container_div.classList.add("chart_container");
    
    let container_div_width = parseInt(window.getComputedStyle(container_div, null).width);
    
    let chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);
    
    this.container = d3.select(chart_div);
    
    // set options
    opts = (typeof opts === 'undefined') ? {} : opts;
    let default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    let default_group = (typeof opts.default_group === 'undefined') ? "Total" : opts.default_group;

    //set labels
    labels = (typeof labels === 'undefined') ? {} : labels;
    const title = (typeof labels.title === 'undefined') ? ": Exposure to high-carbon economic activities sorted by " : labels.title,
    ytitle = (typeof labels.ytitle === 'undefined') ? "" : labels.ytitle,
    port_label = (typeof labels.port_label === 'undefined') ? "This portfolio" : labels.port_label,
    categories = (typeof labels.categories === 'undefined') ? {"High-carbon Transportion": "High-carbon Transportion", 
      "High-carbon Power Production":"High-carbon Power Production", 
      "High-carbon Industry": "High-carbon Industry",
      "Fossil Fuels": "Fossil Fuels"} : labels.categories,
    total = (typeof labels.total === 'undefined') ? "Total" : labels.total;

    // settings
    let ttl_width = container_div_width || 750;
    this.ttl_height = 400;
    this.margin = {top: 20, right: 20, bottom: 110, left: 60};
    this.width = ttl_width - this.margin.left - this.margin.right;
    this.height = this.ttl_height - this.margin.top - this.margin.bottom;
    
    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "peercomparison_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", peer_sort);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';
    
    // group selector
    //let group_names = d3.keys(data[0]).filter(d => ["portfolio_name", "this_portfolio", "asset_class", "asset_class_translation"].indexOf(d) < 0);
    // group_names.sort(d => d === "Total" ? -1 : 1);
    let group_names = d3.values(categories);
    group_names.unshift(total);
    let group_selector = document.createElement("select");
    group_selector.classList = "peercomparison_group_selector inline_text_dropdown";
    group_selector.addEventListener("change", peer_sort);
    group_names.forEach(group_name => group_selector.add(new Option(group_name, group_name)));
    group_selector.options[Math.max(group_names.indexOf(default_group), 0)].selected = 'selected';
    
    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = ttl_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title));
    titlediv.appendChild(group_selector);
    chart_div.appendChild(titlediv);
    
    // D3 setup
    this.x = d3.scaleBand()
      .range([0, this.width])
      .paddingInner(0.05)
      .align(0.1)
    ;
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.z = d3.scaleOrdinal().range(d3.schemeCategory10);
    
    function num_format(d) {
      if (d < 0.01 && d > 0) { return "< 1%"; }
      return d3.format(".0%")(d);
    }
    
    function findOriginalGroup(group_translation) {
      if (group_translation == total) {
        return "Total";
      } else {
        let keys = d3.keys(categories);
        let values = d3.values(categories);
        let idx = values.indexOf(group_translation);
        return keys[idx];
      }
    }

    let keys = d3.keys(data[0]).filter(d => ["portfolio_name", "this_portfolio", "asset_class", "asset_class_translation","Total"].indexOf(d) < 0);
    
    let subdata = data.filter(d => d.asset_class_translation == class_selector.value);
    subdata.sort((a, b) => b["Total"] - a["Total"]);
    subdata.sort((a, b) => b[findOriginalGroup(group_selector.value)] - a[findOriginalGroup(group_selector.value)]);
    keys.sort(d => d != findOriginalGroup(group_selector.value) ? 1 : -1);
    
    this.x.domain(subdata.map(d => d.portfolio_name));
    this.y.domain([0, d3.max(subdata, d => d.Total)]).nice();
    this.z.domain(keys);
    
    this.svg = this.container
      .append("svg")
      .attr("width", ttl_width)
      .attr("height", this.ttl_height)
    ;
    
    this.svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;

    this.svg.append("text")
      .attr("class", "ytitle")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(ytitle)
    ;
    
    this.svg = this.svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    ;

    const tooltip = this.container
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;
    
    this.svg.append("g").attr("class", "bar_grp");
    let bar_grp = this.svg.selectAll(".bar_grp");

    let portfolio_identifier = this.svg.append("g").attr("class", "portfolio_identifier");
    let portfolio_data = subdata.filter((d,i) => d.this_portfolio);
    
    portfolio_identifier.selectAll("text")
      .data(portfolio_data)
      .enter()
      .append("text")
      .text(port_label)
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("dx", "9")
      .attr("transform", d => "translate(" + (this.x(d.portfolio_name) + (this.x.bandwidth() / 2)) + "," + this.height + ") rotate(90)")
      .style("alignment-baseline", "central")
      .style("text-anchor", "start")
    ;
    
    portfolio_identifier.selectAll("line")
      .data(portfolio_data)
      .enter()
      .append("line", "#first + *")
      .attr("x1", d => this.x(d.portfolio_name) + (this.x.bandwidth() / 2))
      .attr("y1", this.height)
      .attr("x2", d => this.x(d.portfolio_name) + (this.x.bandwidth() / 2))
      .attr("y2", this.height + 6)
      .style("stroke", "black")
      .style("stroke-width", "2")
    ;
    
    this.svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(this.y).ticks(null, "s").tickFormat(d3.format(".0%")))
      .append("text")
      .attr("x", 2)
      .attr("y", this.y(this.y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
    ;
    
    var legend = this.svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(-" + 0 + "," + i * 20 + ")")
    ;

    legend.append("rect")
      .attr("class", d => d)
      .attr("x", this.width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", this.z)
    ;
    
    legend.append("text")
      .attr("x", this.width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => categories[d])
    ;
    
    let chart = this;
    
    // run it
    class_selector.dispatchEvent(new Event('change'));
    
    
    function mouseover(d) {
      tooltip
        .html((d.data.this_portfolio ? d.data.portfolio_name + "<br>" : "") +
              total + ": " + num_format(d.data.Total) + "<br>" +
              categories["High-carbon Transportion"] + ": " + num_format(d.data["High-carbon Transportion"]) + "<br>" +
              categories["High-carbon Power Production"] + ": " + num_format(d.data["High-carbon Power Production"]) + "<br>" +
              categories["High-carbon Industry"] + ": " + num_format(d.data["High-carbon Industry"]) + "<br>" +
              categories["Fossil Fuels"] + ": " + num_format(d.data["Fossil Fuels"]))
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
    
    function peer_sort() {      
      subdata = data.filter(d => d.asset_class_translation == class_selector.value);
      subdata.sort((a, b) => b["Total"] - a["Total"]);
      subdata.sort((a, b) => b[findOriginalGroup(group_selector.value)] - a[findOriginalGroup(group_selector.value)]);
      keys.sort(d => d != findOriginalGroup(group_selector.value) ? 1 : -1);

      chart.x.domain(subdata.map(d => d.portfolio_name));
      chart.y.domain([0, d3.max(subdata, d => d.Total)]).nice();

      let bars = bar_grp.selectAll("g").data(d3.stack().keys(keys)(subdata));
      
      bars.exit().remove();
      
      bars.enter()
        .append("g")
        .attr("stroke", "white")
        .attr("stroke-width", "0.5px")
        .attr("class", d => d.key)
        .attr("fill", d => chart.z(d.key))
        .attr("opacity", d => findOriginalGroup(group_selector.value) == "Total" ? 1 : d.key == findOriginalGroup(group_selector.value) ? 1 : 0.3)
      ;
      
      bars
        .transition()
        .attr("class", d => d.key)
        .attr("fill", d => chart.z(d.key))
        .attr("opacity", d => findOriginalGroup(group_selector.value) == "Total" ? 1 : d.key == findOriginalGroup(group_selector.value) ? 1 : 0.3)
      ;
      
      let rect_grp = bar_grp.selectAll("g").selectAll("rect").data(d => d);
      
      rect_grp.exit().remove();
      
      rect_grp.enter()
        .append("rect")
        .attr("class", "slice")
        .attr("x", d => chart.x(d.data.portfolio_name))
        .attr("y", d => chart.y(d[1]))
        .attr("height", d => chart.y(d[0]) - chart.y(d[1]))
        .attr("width", chart.x.bandwidth())
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
      ;
      
      rect_grp
        .transition()
        .attr("class", "slice")
        .attr("x", d => chart.x(d.data.portfolio_name))
        .attr("y", d => chart.y(d[1]))
        .attr("height", d => chart.y(d[0]) - chart.y(d[1]))
        .attr("width", chart.x.bandwidth())
      ;
      
      
      chart.svg.selectAll(".axis")
        .transition()
        .call(d3.axisLeft(chart.y).ticks(null, "s").tickFormat(d3.format(".0%")))
      ;
      
      portfolio_identifier.selectAll("text")
        .transition()
        .attr("transform", d => "translate(" + (chart.x(d.portfolio_name) + (chart.x.bandwidth() / 2)) + "," + chart.height + ") rotate(90)")
      ;
      
      portfolio_identifier.selectAll("line")
        .transition()
        .attr("x1", d => chart.x(d.portfolio_name) + (chart.x.bandwidth() / 2))
        .attr("x2", d => chart.x(d.portfolio_name) + (chart.x.bandwidth() / 2))
      ;
    }  
  }
}
