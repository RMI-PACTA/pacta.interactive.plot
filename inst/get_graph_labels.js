function getGraphLabels(labels) {
	let graph_labels = {};

	if (typeof labels !== "undefined") {
		graphs_to_label = d3.map(labels, d => d.id).keys().sort();
		$.each(graphs_to_label, function(index, item) {
			var labels_filtered = labels.filter(d => d.id == item);
			temp_obj = {};
			$.each(labels_filtered, function(index2,item2) {
				temp_obj[item2.label] = item2.value;
			})
			graph_labels[item] = temp_obj;
		});
	} else {
		graph_labels["value_pie"] = {
	      title: ": Financial exposure to climate relevant sectors", 
	      comment: [" of the portfolio", "in PACTA sectors"], 
	      numbers_long: {M: " million", G: " billion", T: " trillion"}
	    };

		graph_labels["emissions_pie"] = {
		      title: ": Emissions exposure from climate relevant sectors", 
		      comment: [" of the portfolio", "in PACTA sectors"], 
		      numbers_long: {M: " million", G: " billion", T: " trillion"}
		    };

		graph_labels["techexposure"] = {
		        title_what: ": Technology mix ",
		        title_opts_how: {opt_asset: "as % of assets under management", opt_sec:"as % of sector"},
		        title_how: "compared to ",
		        caption_market: "Equity market: ",
		        port_label: "This portfolio",
		        comp_label: "Benchmark",
		        hover_over_asset: " of assets under management<br>",
		        hover_over_sec: {before_sec: " of ", after_sec: " sector"},
		        hover_over_low_carbon: {before_sec: "Low-carbon ", after_sec: " technologies<br>"}
		      };


		graph_labels["techexposure_future"] = {
		        title_up: ': Future technology mix as % of sector',
		        title_down: 'compared to ',
		    };

		graph_labels["trajectory_alignment"] = {
		      title_what: ": Production trajectory of ",
		      title_how: " compared to ",
		      caption_alloc: "Allocation method: ",
		      caption_market: "Equity market: ",
		      ytitle: " production in ",
		      portfolio_label: "Portfolio",
		      benchmark_label: "Benchmark"
		    };

		graph_labels["greenbrown_bubble"] = {
		        title: ": Current low-carbon share and future scenario compatibility",
		        xtitle: "Share of low-carbon technologies",
		        ytitle: "Share of high-carbon technologies",
		        caption_market: "Equity market: ",
		        port_label: "This portfolio",
		        comp_label: "Benchmark"
		      };

		graph_labels["map"] = {
		        title_what: 'Regional exposure of ',
		        title_how: ' towards '
		      };

		graph_labels["portfolio_bubble"] = {
		        chrt_slctr_subtitle: "Current low-carbon share and future scenario compatibility",
		        title_how: " - ",
		        title_what: " sector:",
		        xtitle: "Current share of low-carbon technologies",
		        ytitle: "% of required build-out (as ratio of the B2DS scenario build-out)",
		        caption_market: "Equity market: ",
		        caption_alloc: "Allocation method: ",
		        port_label: "This portfolio",
		        comp_label: "Benchmark"
		      };

		graph_labels["emissions_time_line"] = {
		            title_what: " sector: 5-year emission Intensity trend",
		            title_how: " - ",
		            caption_alloc: "Allocation method: ",
		            caption_market: "Equity market: ",
		            scen_label: "Scenario",
		            port_label: "Portfolio",
		            hoverover_value: "Value: "
		          };

		graph_labels["peercomparison"] = {
		        title: ": Exposure to high-carbon economic activities sorted by ",
		        ytitle: "% of assets under management",
		        port_label: "This portfolio"
		      };

		graph_labels["company_bubble"] = {
		          title_what: " sector:",
		          ttile_how: " Clients - ",
		          chrt_slctr_subtitle: "Current low-carbon share and future scenario compatibility",
		          xtitle: "Share of the Client capacity in low-carbon technologies",
		          ytitle: "% of required build-out (as ratio of the B2DS scenario build-out)",
		          ztooltip: "Weight in portfolio (% of AUM)"
		        };

		graph_labels["key_bars"] = {
		        title_what: ": Future technology mix for the largest holdings (by portfolio weight)",
		        title_how: "as % of sector for ",
		        title_who: " sector." 
		      };

		graph_labels["peer_bubbles"] = {
		          xtitle: "Current share of low-carbon technologies",
		          ytitle: "% of required build-out (as ratio of the B2DS scenario build-out)",
		          chrt_slctr_subtitle: "Current low-carbon share and future scenario compatibility",
		          title_what: " sector:",
		          title_how: " - ",
		          title_with_whom: "compared to: ",
		          port_label: "This portfolio",
		          comp_label: "Benchmark"
		        };

		graph_labels["stress_test_bar_chart"] = {
          title: ": Potential value changes in a stress scenario: ",
          xtitle: "Reference point",
          ytitle: "Million USD",
          legend_labels: ["AUM Other", "AUM Climate Relevant - Not Analyzed", "AUM Climate Relevant - Analyzed", "Value change"],
          annotation: "Value change of "
        };

        graph_labels["stress_test_table"] = {
          headers: {
            name_portfolio_part: "Portfolio part",
            percent_aum_portfolio: "Percentage part AUM",
            value: "Value AUM (mln USD)",
            percent_lost_value: "Percentage stress value lost",
            lost_value: "Stress value lost (mln USD)"
          }
        };

        graph_labels["stress_test_sectors"] = {
          title: ' Value at Risk by technology for scenario: ',
          ytitle_left: 'Value (mln USD)',
          ytitle_right: 'Percentage at Risk',
          xtitle: 'Technology'
        };
	}
	
	return graph_labels;
}