#' Create an interactive tech exposure chart in an htmlwidget
#'
#' @param .data a tech exposure data frame
#' @param width width of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param height height of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param ... other options passed on to r2d3::r2d3() (see details)
#'
#' @description
#' The `tech_exposure_chart` function creates an interactive tech exposure chart in an htmlwidget
#'
#' @md
#' @export

tech_exposure_chart <-
  function(.data, width = NULL, height = NULL, ...) {
    .data <- export_data_utf8(.data)

    dependencies <-
      list(
        system.file("initialize_charts.js", package = "r2dii.interactive"),
        system.file("jquery-3.5.1.js", package = "r2dii.interactive"),
        system.file("techexposure.js", package = "r2dii.interactive"),
        system.file("text_dropdown_jiggle.js", package = "r2dii.interactive")
        )

    r2d3::r2d3(
      data = .data,
      script = system.file("render_tech_exposure.js", package = "r2dii.interactive"),
      dependencies = dependencies,
      css = system.file("2dii_gitbook_style.css", package = "r2dii.interactive"),
      d3_version = 4,
      width = width,
      height = height,
      container = "div",
      ...
    )
  }


#' Convert raw data into a tech exposure data frame
#'
#' @param investor_name investor_name
#' @param portfolio_name portfolio_name
#' @param start_year start_year
#' @param peer_group peer_group
#' @param equity_results_portfolio equity_results_portfolio
#' @param bonds_results_portfolio bonds_results_portfolio
#' @param indices_equity_results_portfolio indices_equity_results_portfolio
#' @param indices_bonds_results_portfolio indices_bonds_results_portfolio
#' @param peers_equity_results_portfolio peers_equity_results_portfolio
#' @param peers_bonds_results_portfolio peers_bonds_results_portfolio
#' @param green_techs green_techs
#' @param select_scenario select_scenario
#' @param select_scenario_auto select_scenario_auto
#' @param select_scenario_shipping select_scenario_shipping
#' @param select_scenario_other select_scenario_other
#' @param all_tech_levels all_tech_levels
#' @param equity_market_levels equity_market_levels
#' @param dataframe_translations dataframe_translations
#' @param language_select two letter code for language (single string; default = "EN")
#'
#' @description
#' The `as_tech_exposure_data` function converts raw data into a tech exposure data frame
#'
#' @import dplyr
#' @export

as_tech_exposure_data <-
  function(
    investor_name,
    portfolio_name,
    start_year,
    peer_group,
    equity_results_portfolio,
    bonds_results_portfolio,
    indices_equity_results_portfolio,
    indices_bonds_results_portfolio,
    peers_equity_results_portfolio,
    peers_bonds_results_portfolio,
    green_techs = c('RenewablesCap', 'HydroCap', 'NuclearCap', 'Hybrid', 'Electric', "FuelCell", "Hybrid_HDV", "Electric_HDV", "FuelCell_HDV","Ac-Electric Arc Furnace","Dc-Electric Arc Furnace"),
    select_scenario,
    select_scenario_auto,
    select_scenario_shipping,
    select_scenario_other,
    all_tech_levels,
    equity_market_levels,
    dataframe_translations,
    language_select = "EN"
  ) {
    .data <- NULL

    portfolio <-
      list(`Listed Equity` = equity_results_portfolio,
           `Corporate Bonds` = bonds_results_portfolio) %>%
      dplyr::bind_rows(.id = 'asset_class') %>%
      dplyr::filter(investor_name == !!investor_name,
                    portfolio_name == !!portfolio_name) %>%
      dplyr::filter(!is.na(.data$ald_sector))

    asset_classes <-
      portfolio %>%
      dplyr::pull(.data$asset_class) %>%
      unique()

    equity_sectors <-
      portfolio %>%
      dplyr::filter(.data$asset_class == "Listed Equity") %>%
      dplyr::pull(.data$ald_sector) %>%
      unique()

    bonds_sectors <-
      portfolio %>%
      dplyr::filter(.data$asset_class == 'Corporate Bonds') %>%
      dplyr::pull(.data$ald_sector) %>%
      unique()

    indices <-
      list(`Listed Equity` = indices_equity_results_portfolio,
           `Corporate Bonds` = indices_bonds_results_portfolio) %>%
      dplyr::bind_rows(.id = 'asset_class') %>%
      dplyr::filter(.data$asset_class %in% asset_classes) %>%
      dplyr::filter(.data$asset_class == 'Listed Equity' & .data$ald_sector %in% equity_sectors |
                      .data$asset_class == 'Corporate Bonds' & .data$ald_sector %in% bonds_sectors)

    peers <-
      list(`Listed Equity` = peers_equity_results_portfolio,
           `Corporate Bonds` = peers_bonds_results_portfolio) %>%
      dplyr::bind_rows(.id = 'asset_class') %>%
      dplyr::as_tibble() %>%
      dplyr::filter(.data$asset_class %in% asset_classes) %>%
      dplyr::filter(.data$asset_class == 'Listed Equity' & .data$ald_sector %in% equity_sectors |
                      .data$asset_class == 'Corporate Bonds' & .data$ald_sector %in% bonds_sectors) %>%
      dplyr::filter(investor_name == !!peer_group)

    techexposure_data <-
      dplyr::bind_rows(portfolio, peers, indices) %>%
      dplyr::filter(.data$allocation == 'portfolio_weight') %>%
      dplyr::filter(.data$scenario == dplyr::if_else(.data$ald_sector == "Automotive", select_scenario_auto,
                                               dplyr::if_else(.data$ald_sector == "Shipping", select_scenario_shipping,
                                                              dplyr::if_else(.data$ald_sector %in% c("Cement", "Steel", "Aviation"), select_scenario_other,
                                                 select_scenario)))) %>%
      dplyr::filter(.data$scenario_geography == dplyr::if_else(.data$ald_sector == 'Power', 'GlobalAggregate', 'Global')) %>%
      dplyr::filter(.data$year == !!start_year) %>%
      dplyr::filter(.data$equity_market == "GlobalMarket") %>%
      dplyr::mutate(green = .data$technology %in% !!green_techs) %>%
      dplyr::group_by(.data$asset_class, .data$equity_market, .data$portfolio_name, .data$ald_sector) %>%
      dplyr::arrange(.data$asset_class, .data$portfolio_name,
                     factor(.data$technology, levels = !!all_tech_levels), dplyr::desc(.data$green)) %>%
      dplyr::mutate(sector_sum = sum(.data$plan_carsten)) %>%
      dplyr::mutate(sector_prcnt = .data$plan_carsten / sum(.data$plan_carsten)) %>%
      dplyr::mutate(sector_cumprcnt = cumsum(.data$sector_prcnt)) %>%
      dplyr::mutate(sector_cumprcnt = dplyr::lag(.data$sector_cumprcnt, default = 0)) %>%
      dplyr::mutate(cumsum = cumsum(.data$plan_carsten)) %>%
      dplyr::mutate(cumsum = dplyr::lag(cumsum, default = 0)) %>%
      dplyr::ungroup() %>%
      dplyr::group_by(.data$asset_class, .data$equity_market, .data$portfolio_name, .data$ald_sector, .data$green) %>%
      dplyr::mutate(green_sum = sum(.data$plan_carsten)) %>%
      dplyr::mutate(green_prcnt = sum(.data$plan_carsten) / .data$sector_sum) %>%
      dplyr::ungroup() %>%
      dplyr::mutate(this_portfolio = .data$portfolio_name == !!portfolio_name) %>%
      dplyr::mutate(equity_market = dplyr::case_when(
        .data$equity_market == 'GlobalMarket' ~ 'Global Market',
        .data$equity_market == 'DevelopedMarket' ~ 'Developed Market',
        .data$equity_market == 'EmergingMarket' ~ 'Emerging Market',
        TRUE ~ .data$equity_market)
      ) %>%
      dplyr::mutate(portfolio_name = dplyr::case_when(
        .data$portfolio_name == 'pensionfund' ~ 'Pension Fund',
        .data$portfolio_name == 'assetmanager' ~ 'Asset Manager',
        .data$portfolio_name == 'bank' ~ 'Bank',
        .data$portfolio_name == 'insurance' ~ 'Insurance',
        TRUE ~ .data$portfolio_name)
      ) %>%
      dplyr::arrange(.data$asset_class, factor(.data$equity_market, levels = !!equity_market_levels), dplyr::desc(.data$this_portfolio), .data$portfolio_name,
              factor(.data$technology, levels = !!all_tech_levels), dplyr::desc(.data$green)) %>%
      dplyr::select(.data$asset_class, .data$equity_market, .data$portfolio_name, .data$this_portfolio, .data$ald_sector, .data$technology,
                    .data$plan_carsten, .data$sector_sum, .data$sector_prcnt, .data$cumsum, .data$sector_cumprcnt,
                    .data$green, .data$green_sum, .data$green_prcnt)

    dictionary <-
      choose_dictionary_language(
        dataframe_translations,
        language = language_select
        )

    techexposure_data <- translate_df_contents(techexposure_data, dictionary)

    return(techexposure_data)
  }
