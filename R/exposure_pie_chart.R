#' Create an interactive exposure pie chart in an htmlwidget
#'
#' @param .data a exposure pie data frame
#' @param width width of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param height height of exported htmlwidget in pixels (single integer value; default == NULL)
#' @param ... other options passed on to r2d3::r2d3() (see details)
#'
#' @description
#' The `exposure_pie_chart` function creates an interactive exposure pie chart in an htmlwidget
#'
#' @md
#' @export

exposure_pie_chart <-
  function(.data, width = NULL, height = NULL, ...) {
    .data <- export_data_utf8(.data)

    dependencies <-
      list(
        system.file("js/pie_exploded.js", package = "r2dii.interactive"),
        system.file("js/d3-array.v2.min.js", package = "r2dii.interactive"),
        system.file("js/d3-scale.v3.min.js", package = "r2dii.interactive"),
        system.file("js/d3-scale-chromatic.v1.min.js", package = "r2dii.interactive"),
        jquerylib::jquery_core(major_version = 3),
        system.file("js/text_dropdown_jiggle.js", package = "r2dii.interactive"),
        system.file("css/2dii_gitbook_style.css", package = "r2dii.interactive"),
        system.file("css/hide_styles.css", package = "r2dii.interactive")
      )

    op <- options(r2d3.shadow = FALSE)
    on.exit(options(op), add = TRUE)

    r2d3::r2d3(
      data = .data,
      script = system.file("render_exposure_pie.js", package = "r2dii.interactive"),
      dependencies = dependencies,
      d3_version = 4,
      width = width,
      height = height,
      container = "div",
      ...
    )
  }


#' Convert raw data into a exposure pie data frame
#'
#' @param audit_file audit_file
#' @param investor_name investor_name
#' @param portfolio_name portfolio_name
#' @param twodi_sectors twodi_sectors
#' @param dataframe_translations dataframe_translations
#' @param language_select two letter code for language (single string; default = "EN")
#'
#' @description
#' The `as_exposure_pie_data` function converts raw data into a exposure pie data frame
#'
#' @import dplyr
#' @export

as_exposure_pie_data <-
  function(
           audit_file,
           investor_name,
           portfolio_name,
           twodi_sectors = c("Power", "Automotive", "Shipping", "Oil&Gas", "Coal", "Steel", "Cement", "Aviation"),
           dataframe_translations,
           language_select = "EN") {
    .data <- NULL

    if (missing(dataframe_translations)) {
      dataframe_translations <- dataframe_translations_default
    }

    if (missing(investor_name)) {
      investor_name <- audit_file$investor_name[[1]]
    }
    if (missing(portfolio_name)) {
      portfolio_name <- audit_file$portfolio_name[[1]]
    }

    data_exposure_pie <-
      audit_file %>%
      filter(.data$investor_name == !!investor_name &
        .data$portfolio_name == !!portfolio_name) %>%
      filter(.data$valid_input == TRUE) %>%
      mutate(across(c(.data$bics_sector, .data$financial_sector), as.character)) %>%
      mutate(sector = if_else(!.data$has_ald_in_fin_sector,
        "Other", .data$financial_sector
      )) %>%
      group_by(.data$sector) %>%
      summarise(value = sum(.data$value_usd, na.rm = TRUE), .groups = "drop") %>%
      mutate(exploded = .data$sector %in% twodi_sectors) %>%
      arrange(desc(.data$exploded), .data$sector) %>%
      rename(key = .data$sector) %>%
      filter(!is.na(.data$key))

    dictionary <-
      choose_dictionary_language(dataframe_translations,
        language = language_select
      )

    translate_df_contents(data_exposure_pie, dictionary)
  }
