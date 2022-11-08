#' Create an interactive exposure map chart in an htmlwidget
#'
#' @param .data an exposure map data frame
#' @param width,height width and height of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param ... other options passed on to r2d3::r2d3() (see details)
#'
#' @description
#' The `exposure_map_chart` function creates an interactive exposure map chart in an htmlwidget
#'
#' @md
#' @export

exposure_map_chart <-
  function(.data, width = NULL, height = NULL, ...) {
    .data <- export_data_utf8(.data)

    dependencies <-
      list(
        system.file("js/map.js", package = "r2dii.interactive"),
        system.file("js/d3-geo-projection.v2.min.js", package = "r2dii.interactive"),
        system.file("js/d3-array.v2.min.js", package = "r2dii.interactive"),
        system.file("js/world.js", package = "r2dii.interactive"),
        system.file("js/text_dropdown_jiggle.js", package = "r2dii.interactive"),
        system.file("css/2dii_gitbook_style.css", package = "r2dii.interactive"),
        system.file("css/hide_styles.css", package = "r2dii.interactive")
        )

    op <- options(r2d3.shadow = FALSE)
    on.exit(options(op), add = TRUE)

    r2d3::r2d3(
      data = .data,
      script = system.file("render_exposure_map.js", package = "r2dii.interactive"),
      dependencies = dependencies,
      d3_version = 4,
      width = width,
      height = height,
      container = "div",
      ...
    )
  }


#' Convert raw data into a exposure map data frame
#'
#' @param results_map results_map
#' @param start_year start_year
#' @param dataframe_translations dataframe_translations
#' @param language_select two letter code for language (single string; default = "EN")
#'
#' @description
#' The `as_exposure_map_data` function converts raw data into a exposure map data frame
#'
#' @import dplyr
#' @export

as_exposure_map_data <-
  function(
    results_map,
    start_year,
    dataframe_translations,
    language_select = "EN"
  ) {
    .data <- NULL

    if (missing(dataframe_translations)) {
      dataframe_translations <- dataframe_translations_default
    }

    if (missing(start_year)) {
      start_year <- min(results_map$year, na.rm = TRUE)
    }

    sector_prefix <- 'All '

    filtered <-
      results_map %>%
      filter(
        .data$allocation == case_when(
          .data$asset_class == 'Listed Equity' ~ 'ownership_weight',
          .data$asset_class == 'Corporate Bonds' ~ 'portfolio_weight'
        )
      ) %>%
      filter(.data$year == start_year) %>%
      mutate(code = countrycode::countrycode(.data$ald_location, "iso2c", "iso3c", custom_match = c(XK = "XKX"))) %>%
      rename(unit = "ald_production_unit")

    by_sector <-
      filtered %>%
      group_by(.data$asset_class, .data$ald_sector) %>%
      filter(length(unique(.data$unit)) == 1L & length(unique(.data$technology)) > 1L) %>%
      mutate(option = paste0(sector_prefix, .data$ald_sector)) %>%
      group_by(.data$asset_class, .data$code, .data$option, .data$unit, group = .data$ald_sector) %>%
      summarise(value = sum(.data$plan_alloc_wt_tech_prod, na.rm = TRUE), .groups = 'drop') %>%
      mutate(order = 1L)

    data_exposure_map <-
      filtered %>%
      group_by(.data$asset_class, .data$code, option = .data$technology, .data$unit, group = .data$ald_sector) %>%
      summarise(value = sum(.data$plan_alloc_wt_tech_prod, na.rm = TRUE), .groups = 'drop') %>%
      mutate(order = 2L) %>%
      bind_rows(by_sector) %>%
      arrange(.data$asset_class, .data$code, .data$group, .data$order, .data$option)

    dictionary <-
      choose_dictionary_language(dataframe_translations,
                                 language = language_select)

    translate_df_contents(data_exposure_map, dictionary)
  }
