#' Create an interactive peer comparison chart in an htmlwidget
#'
#' @param .data a peer comparison data frame
#' @param width width of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param height height of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param ... other options passed on to r2d3::r2d3() (see details)
#'
#' @description
#' The `peer_comparison_chart` function creates an interactive peer comparison chart in an htmlwidget
#'
#' @md
#' @export

peer_comparison_chart <-
  function(.data, width = NULL, height = NULL, ...) {
    .data <- export_data_utf8(.data)

    dependencies <-
      list(
        system.file("js/stackedbars.js", package = "r2dii.interactive"),
        system.file("js/d3-array.v2.min.js", package = "r2dii.interactive"),
        system.file("js/jquery-3.5.1.js", package = "r2dii.interactive"),
        system.file("js/text_dropdown_jiggle.js", package = "r2dii.interactive"),
        system.file("css/2dii_gitbook_style.css", package = "r2dii.interactive"),
        system.file("css/hide_styles.css", package = "r2dii.interactive")
        )

    op <- options(r2d3.shadow = FALSE)
    on.exit(options(op), add = TRUE)

    r2d3::r2d3(
      data = .data,
      script = system.file("render_peer_comparison.js", package = "r2dii.interactive"),
      dependencies = dependencies,
      d3_version = 4,
      width = width,
      height = height,
      container = "div",
      ...
    )
  }


#' Convert raw data into a peer comparison data frame
#'
#' @param investor_name investor_name
#' @param portfolio_name portfolio_name
#' @param peer_group peer_group
#' @param start_year start_year
#' @param equity_results_portfolio equity_results_portfolio
#' @param bonds_results_portfolio bonds_results_portfolio
#' @param peers_equity_results_user peers_equity_results_user
#' @param peers_bonds_results_user peers_bonds_results_user
#' @param select_scenario select_scenario
#' @param select_scenario_auto select_scenario_auto
#' @param select_scenario_shipping select_scenario_shipping
#' @param select_scenario_other select_scenario_other
#' @param dataframe_translations dataframe_translations
#' @param language_select two letter code for language (single string; default = "EN")
#'
#' @description
#' The `as_peer_comparison_data` function converts raw data into a peer comparison data frame
#'
#' @import dplyr
#' @import tidyr
#' @export

as_peer_comparison_data <-
  function(
    investor_name,
    portfolio_name,
    peer_group,
    start_year,
    equity_results_portfolio,
    bonds_results_portfolio,
    peers_equity_results_user,
    peers_bonds_results_user,
    select_scenario,
    select_scenario_auto,
    select_scenario_shipping,
    select_scenario_other,
    dataframe_translations,
    language_select = "EN"
  ) {
    .data <- NULL


    if (missing(dataframe_translations)) {
      dataframe_translations <- dataframe_translations_default
    }

    high_carbon_vars <-
      c("High-carbon Power Production", "High-carbon Transportion", "Fossil Fuels", "High-carbon Industry")

    equity_data <-
      equity_results_portfolio %>%
      filter(.data$allocation == 'portfolio_weight',
             .data$scenario_geography == if_else(.data$ald_sector == "Power", "GlobalAggregate", "Global"),
             .data$equity_market %in% c("Global", "GlobalMarket"),
             .data$year == !!start_year
      ) %>%
      filter(.data$scenario == case_when(
        ald_sector == "Automotive" ~ select_scenario_auto,
        ald_sector == "Shipping" ~ select_scenario_shipping,
        ald_sector %in% c("Cement", "Steel", "Aviation") ~ select_scenario_other,
        TRUE ~ select_scenario
      )) %>%
      mutate(high_carbon_sector = case_when(
        ald_sector %in% c('Oil&Gas', 'Coal') ~ 'Fossil Fuels',
        technology %in% c('OilCap', 'CoalCap', 'GasCap') ~ 'High-carbon Power Production',
        technology %in% c('ICE') ~ 'High-carbon Transportion',
        ald_sector %in% c('Shipping', 'Aviation') ~ 'High-carbon Transportion',
        ald_sector %in% c('Cement', 'Steel') ~ 'High-carbon Industry',
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE), .groups = 'drop') %>%
      mutate(this_portfolio =
               .data$investor_name == !!investor_name &
               .data$portfolio_name == !!portfolio_name) %>%
      pivot_wider(names_from = .data$high_carbon_sector,
                  values_from = .data$plan_carsten,
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-.data$investor_name, -.data$this_portfolio) %>%
      mutate(this_portfolio = .data$portfolio_name == !!portfolio_name) %>%
      mutate(asset_class = 'Listed Equity') %>%
      filter(.data$this_portfolio)
    if ("plan_carsten" %in% colnames(equity_data)) {
      equity_data <- equity_data %>% select(-.data$plan_carsten)
    }
    if (any(equity_data$Total > 1)) { stop("Total Exceeds 1, check filters") }

    peers_equity_data <-
      peers_equity_results_user %>%
      filter(.data$allocation == 'portfolio_weight',
             .data$equity_market %in% c('Global','GlobalMarket'),
             .data$scenario_geography == if_else(.data$ald_sector == "Power", "GlobalAggregate", "Global"),
             .data$year == !!start_year,
             .data$investor_name == !!peer_group
      ) %>%
      filter(.data$scenario == case_when(
        ald_sector == "Automotive" ~ select_scenario_auto,
        ald_sector == "Shipping" ~ select_scenario_shipping,
        ald_sector %in% c("Cement", "Steel", "Aviation") ~ select_scenario_other,
        TRUE ~ select_scenario
      )) %>%
      mutate(high_carbon_sector = case_when(
        ald_sector %in% c('Oil&Gas', 'Coal') ~ 'Fossil Fuels',
        technology %in% c('OilCap', 'CoalCap', 'GasCap') ~ 'High-carbon Power Production',
        technology %in% c('ICE') ~ 'High-carbon Transportion',
        ald_sector %in% c('Shipping', 'Aviation') ~ 'High-carbon Transportion',
        ald_sector %in% c('Cement', 'Steel') ~ 'High-carbon Industry',
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE), .groups = 'drop') %>%
      mutate(this_portfolio = .data$portfolio_name == !!investor_name) %>%
      filter(.data$this_portfolio == FALSE) %>%
      pivot_wider(names_from = .data$high_carbon_sector,
                  values_from = .data$plan_carsten,
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-.data$investor_name) %>%
      mutate(asset_class = 'Listed Equity') %>%
      group_by(.data$portfolio_name) %>%
      mutate(g = cur_group_id()) %>%
      ungroup() %>%
      mutate(portfolio_name = as.character(.data$g)) %>%
      select(-.data$g)
    if ("plan_carsten" %in% colnames(peers_equity_data)) {
      peers_equity_data <- peers_equity_data %>% select(-.data$plan_carsten)
    }
    if (any(peers_equity_data$Total > 1)) { stop("Total Exceeds 1, check filters") }


    bonds_data <-
      bonds_results_portfolio %>%
      filter(.data$allocation == 'portfolio_weight',
             .data$scenario_geography == if_else(.data$ald_sector == "Power", "GlobalAggregate", "Global"),
             .data$year == !!start_year
      ) %>%
      filter(.data$scenario == case_when(
        ald_sector == "Automotive" ~ select_scenario_auto,
        ald_sector == "Shipping" ~ select_scenario_shipping,
        ald_sector %in% c("Cement", "Steel", "Aviation") ~ select_scenario_other,
        TRUE ~ select_scenario
      )) %>%
      mutate(high_carbon_sector = case_when(
        ald_sector %in% c('Oil&Gas', 'Coal') ~ 'Fossil Fuels',
        technology %in% c('OilCap', 'CoalCap', 'GasCap') ~ 'High-carbon Power Production',
        technology %in% c('ICE') ~ 'High-carbon Transportion',
        ald_sector %in% c('Shipping', 'Aviation') ~ 'High-carbon Transportion',
        ald_sector %in% c('Cement', 'Steel') ~ 'High-carbon Industry',
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE), .groups = 'drop') %>%
      mutate(this_portfolio =
               .data$investor_name == !!investor_name &
               .data$portfolio_name == !!portfolio_name) %>%
      pivot_wider(names_from = .data$high_carbon_sector,
                  values_from = .data$plan_carsten,
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-.data$investor_name, -.data$this_portfolio) %>%
      mutate(this_portfolio = .data$portfolio_name == !!portfolio_name) %>%
      mutate(asset_class = 'Corporate Bonds') %>%
      filter(.data$this_portfolio)
    if ("plan_carsten" %in% colnames(bonds_data)) {
      bonds_data <- bonds_data %>% select(-.data$plan_carsten)
    }
    if (any(bonds_data$Total > 1)) { stop("Total Exceeds 1, check filters") }

    peers_bonds_data <-
      peers_bonds_results_user %>%
      filter(.data$allocation == 'portfolio_weight',
             .data$scenario_geography == if_else(.data$ald_sector == "Power", "GlobalAggregate", "Global"),
             .data$year == !!start_year,
             .data$investor_name == !!peer_group
      ) %>%
      filter(.data$scenario == case_when(
        ald_sector == "Automotive" ~ select_scenario_auto,
        ald_sector == "Shipping" ~ select_scenario_shipping,
        ald_sector %in% c("Cement", "Steel", "Aviation") ~ select_scenario_other,
        TRUE ~ select_scenario
      )) %>%
      mutate(high_carbon_sector = case_when(
        ald_sector %in% c('Oil&Gas', 'Coal') ~ 'Fossil Fuels',
        technology %in% c('OilCap', 'CoalCap', 'GasCap') ~ 'High-carbon Power Production',
        technology %in% c('ICE') ~ 'High-carbon Transportion',
        ald_sector %in% c('Shipping', 'Aviation') ~ 'High-carbon Transportion',
        ald_sector %in% c('Cement', 'Steel') ~ 'High-carbon Industry',
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE), .groups = 'drop') %>%
      mutate(this_portfolio = .data$portfolio_name == !!investor_name) %>%
      filter(.data$this_portfolio == FALSE) %>%
      pivot_wider(names_from = .data$high_carbon_sector,
                  values_from = .data$plan_carsten,
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-.data$investor_name) %>%
      mutate(asset_class = 'Corporate Bonds') %>%
      group_by(.data$portfolio_name) %>%
      mutate(g = cur_group_id()) %>%
      ungroup() %>%
      mutate(portfolio_name = as.character(.data$g)) %>%
      select(-.data$g)
    if ("plan_carsten" %in% colnames(peers_bonds_data)) {
      peers_bonds_data <- peers_bonds_data %>% select(-.data$plan_carsten)
    }
    if (any(peers_bonds_data$Total > 1)) { stop("Total Exceeds 1, check filters") }

    equity_data <- bind_rows(equity_data, peers_equity_data)

    bonds_data <- bind_rows(bonds_data, peers_bonds_data)

    if (filter(equity_data, .data$portfolio_name == !!portfolio_name) %>% nrow() < 1) {
      equity_data <- equity_data %>% slice(0)
    }

    if (filter(bonds_data, .data$portfolio_name == !!portfolio_name) %>% nrow() < 1) {
      bonds_data <- bonds_data %>% slice(0)
    }

    data_peercomparison <- bind_rows(equity_data, bonds_data)

    dictionary <-
      choose_dictionary_language(
        dataframe_translations,
        language = language_select
        )

    data_peercomparison <- translate_df_contents(data_peercomparison, dictionary)

    return(data_peercomparison)
  }
