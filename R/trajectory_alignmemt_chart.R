#' Create an interactive trajectory alignment chart in an htmlwidget
#'
#' @param .data a trajectory alignment data frame
#' @param width width of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param height height of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param ... other options passed on to r2d3::r2d3() (see details)
#'
#' @description
#' The `trajectory_alignment_chart` function creates an interactive trajectory alignment chart in an htmlwidget
#'
#' @md
#' @export

trajectory_alignment_chart <-
  function(.data, width = NULL, height = NULL, ...) {
    .data <- export_data_utf8(.data)

    dependencies <-
      list(
        system.file("js/trajectory_alignment.js", package = "r2dii.interactive"),
        system.file("js/d3-array.v2.min.js", package = "r2dii.interactive"),
        jquerylib::jquery_core(major_version = 3),
        system.file("js/text_dropdown_jiggle.js", package = "r2dii.interactive"),
        system.file("css/2dii_gitbook_style.css", package = "r2dii.interactive"),
        system.file("css/hide_styles.css", package = "r2dii.interactive")
      )

    op <- options(r2d3.shadow = FALSE)
    on.exit(options(op), add = TRUE)

    r2d3::r2d3(
      data = .data,
      script = system.file("render_trajectory_alignment.js", package = "r2dii.interactive"),
      dependencies = dependencies,
      d3_version = 4,
      width = width,
      height = height,
      container = "div",
      ...
    )
  }


#' Convert raw data into a trajectory alignment data frame
#'
#' @param equity_results_portfolio equity_results_portfolio
#' @param bonds_results_portfolio bonds_results_portfolio
#' @param indices_equity_results_portfolio indices_equity_results_portfolio
#' @param indices_bonds_results_portfolio indices_bonds_results_portfolio
#' @param investor_name investor_name
#' @param portfolio_name portfolio_name
#' @param tech_roadmap_sectors tech_roadmap_sectors
#' @param scen_geo_levels scen_geo_levels
#' @param year_horizon number of years to include from the start year (single integer/numeric)
#' @param all_tech_levels all_tech_levels
#' @param dataframe_translations dataframe_translations
#' @param language_select two letter code for language (single string; default = "EN")
#'
#' @description
#' The `as_trajectory_alignment_data` function converts raw data into a trajectory alignment data frame
#'
#' @import dplyr
#' @import tidyr
#' @export

as_trajectory_alignment_data <-
  function(
           equity_results_portfolio,
           bonds_results_portfolio,
           indices_equity_results_portfolio,
           indices_bonds_results_portfolio,
           investor_name,
           portfolio_name,
           tech_roadmap_sectors,
           scen_geo_levels,
           all_tech_levels,
           year_horizon = 5,
           dataframe_translations,
           language_select = "en") {
    .data <- NULL

    if (missing(tech_roadmap_sectors)) {
      tech_roadmap_sectors <- tech_roadmap_sectors_default
    }
    if (missing(scen_geo_levels)) {
      scen_geo_levels <- scen_geo_levels_default
    }
    if (missing(all_tech_levels)) {
      all_tech_levels <- all_tech_levels_default
    }
    if (missing(dataframe_translations)) {
      dataframe_translations <- dataframe_translations_default
    }

    full_portfolio <-
      list(
        `Listed Equity` = equity_results_portfolio,
        `Corporate Bonds` = bonds_results_portfolio
      ) %>%
      bind_rows(.id = "asset_class")

    if (missing(investor_name)) {
      investor_name <- full_portfolio$investor_name[[1]]
    }
    if (missing(portfolio_name)) {
      portfolio_name <- full_portfolio$portfolio_name[[1]]
    }

    portfolio <-
      full_portfolio %>%
      filter(
        investor_name == !!investor_name,
        portfolio_name == !!portfolio_name
      ) %>%
      filter(.data$ald_sector %in% !!tech_roadmap_sectors) %>%
      group_by(.data$asset_class, .data$allocation, .data$equity_market, .data$technology, .data$scenario) %>%
      filter(n() > 1) %>%
      ungroup()

    asset_classes <-
      portfolio %>%
      pull(.data$asset_class) %>%
      unique()

    equity_markets <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      pull(.data$equity_market) %>%
      unique()

    bonds_markets <-
      portfolio %>%
      filter(.data$asset_class == "Corporate Bonds") %>%
      pull(.data$equity_market) %>%
      unique()

    equity_techs <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      pull(.data$technology) %>%
      unique()

    equity_scenario_geography <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      pull(.data$scenario_geography) %>%
      unique()

    bonds_scenario_geography <-
      portfolio %>%
      filter(.data$asset_class == "Corporate Bonds") %>%
      pull(.data$scenario_geography) %>%
      unique()

    bonds_techs <-
      portfolio %>%
      filter(.data$asset_class == "Corporate Bonds") %>%
      pull(.data$technology) %>%
      unique()

    benchmark_data <-
      list(
        `Listed Equity` = indices_equity_results_portfolio,
        `Corporate Bonds` = indices_bonds_results_portfolio
      ) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$ald_sector %in% !!tech_roadmap_sectors) %>%
      filter(.data$asset_class %in% asset_classes) %>%
      filter(.data$asset_class == "Listed Equity" & .data$equity_market %in% !!equity_markets |
        .data$asset_class == "Corporate Bonds" & .data$equity_market %in% !!bonds_markets) %>%
      filter(.data$asset_class == "Listed Equity" & .data$technology %in% !!equity_techs |
        .data$asset_class == "Corporate Bonds" & .data$technology %in% !!bonds_techs) %>%
      filter(.data$asset_class == "Listed Equity" & .data$scenario_geography %in% !!equity_scenario_geography |
        .data$asset_class == "Corporate Bonds" & .data$scenario_geography %in% !!bonds_scenario_geography)

    data_trajectory_alignment <-
      list(
        portfolio = portfolio,
        benchmark = benchmark_data
      ) %>%
      bind_rows(.id = "benchmark") %>%
      mutate(benchmark = .data$benchmark == "benchmark") %>%
      mutate(unit = case_when(
        ald_sector == "Power" ~ "MW",
        ald_sector == "Oil&Gas" ~ "GJ/a",
        ald_sector == "Coal" ~ "t/a",
        ald_sector == "Automotive" ~ "number of cars",
        ald_sector == "Aviation" ~ "number of planes",
        ald_sector == "Cement" ~ "t/a",
        ald_sector == "Shipping" ~ "number of ships",
        ald_sector == "Steel" ~ "t/a"
      )) %>%
      mutate(source = sub("_.*", "", .data$scenario)) %>%
      select("benchmark", "portfolio_name", "asset_class", "equity_market", "source", "scenario_geography", "allocation",
        "ald_sector", "technology", "scenario", "year", "unit",
        production = "plan_alloc_wt_tech_prod", "scen_alloc_wt_tech_prod"
      ) %>%
      pivot_wider(names_from = "scenario", values_from = "scen_alloc_wt_tech_prod") %>%
      pivot_longer(
        cols = -(1:11), names_to = "scenario", values_to = "value",
        values_drop_na = TRUE
      ) %>%
      mutate(value = if_else(.data$year > min(.data$year + !!year_horizon) & .data$value == 0, NA_real_, .data$value)) %>%
      filter(!is.na(.data$value)) %>%
      filter(.data$scenario == "production" | !.data$benchmark) %>%
      mutate(
        scenario = sub(".*_", "", .data$scenario),
        scenario = ifelse(.data$scenario == "m", "2c", .data$scenario)
      ) %>%
      mutate(equity_market = case_when(
        equity_market == "GlobalMarket" ~ "Global Market",
        equity_market == "DevelopedMarket" ~ "Developed Market",
        equity_market == "EmergingMarket" ~ "Emerging Market",
        TRUE ~ equity_market
      )) %>%
      mutate(allocation = case_when(
        allocation == "portfolio_weight" ~ "Portfolio Weight",
        allocation == "ownership_weight" ~ "Ownership Weight",
      )) %>%
      mutate(portfolio_name = case_when(
        portfolio_name == "pensionfund" ~ "Pension Fund",
        portfolio_name == "assetmanager" ~ "Asset Manager",
        portfolio_name == "bank" ~ "Bank",
        portfolio_name == "insurance" ~ "Insurance",
        TRUE ~ portfolio_name
      )) %>%
      mutate(scenario_geography = case_when(
        scenario_geography == "GlobalAggregate" ~ "Global Aggregate",
        TRUE ~ scenario_geography
      )) %>%
      arrange(
        .data$asset_class,
        factor(.data$equity_market, levels = c("Global Market", "Developed Market", "Emerging Market")),
        factor(.data$scenario, levels = c("WEO2019", "WEO2020", "GECO2019", "ETP2017")),
        factor(.data$scenario_geography, levels = scen_geo_levels),
        factor(.data$technology, levels = all_tech_levels)
      )

    dictionary <-
      choose_dictionary_language(
        dataframe_translations,
        language = language_select
      )

    data_trajectory_alignment <- translate_df_contents(data_trajectory_alignment, dictionary)

    return(data_trajectory_alignment)
  }
