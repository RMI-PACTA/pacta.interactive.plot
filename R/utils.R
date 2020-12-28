#' @importFrom jsonlite toJSON

to_json <-
  function(x,
           obj_name,
           pretty = FALSE,
           auto_unbox = TRUE,
           na = 'null',
           digits = NA,
           ...) {
    jsonlite::toJSON(x, pretty = pretty, auto_unbox = auto_unbox, na = na,
                     digits = digits, ...)
  }


export_data_utf8 <-
  function(.data) {
    json_data <- to_json(.data)
    utf8 <- enc2utf8(json_data)
    return(utf8)
  }


#' @import dplyr

choose_dictionary_language <-
  function(data, language) {
    .data <- NULL
    language <- tolower(language)
    stopifnot(language %in% names(data))

    key_values <- data %>%
      dplyr::transmute(
        .data$id_data,
        .data$id_column,
        translate_key = .data$key,
        translate_value = .data[[language]]
      )

    key_values
  }


#' @import dplyr

translate_df_contents <-
  function(data, dictionary, inplace = FALSE) {
    .data <- NULL

    data_object_name <- rlang::expr_text(rlang::enexpr(data))

    if (!(data_object_name %in% dictionary$id_data)) {
      rlang::abort(
        class = "dataset not in dictionary",
        paste0("the dataset ", data_object_name, " is not defined in translation dictionary.")
      )
    }

    dictionary_subset <-
      dictionary %>%
      dplyr::filter(.data$id_data == data_object_name) %>%
      dplyr::transmute(.data$id_column,
                       .data$translate_key,
                       .data$translate_value)

    columns <- unique(dictionary_subset$id_column)

    for (column in columns) {
      data <-
        translate_column_contents(
          data,
          dictionary_subset,
          column,
          inplace
        )
    }
    data
  }


#' @import dplyr
#' @importFrom magrittr %>%
#' @importFrom rlang := !!

translate_column_contents <-
  function(data, dictionary, column, inplace = FALSE) {
    .data <- NULL

    dictionary_column <-
      dictionary %>%
      dplyr::filter(.data$id_column == column) %>%
      dplyr::select(-.data$id_column)

    suffix <- ""
    if (!inplace) { suffix <- "_translation" }
    new_column <- paste0(column, suffix)

    data %>%
      dplyr::left_join(dictionary_column,
                by = rlang::set_names("translate_key", column)) %>%
      dplyr::mutate(!!new_column := ifelse(is.na(.data$translate_value),
                                    .data[[!!column]],
                                    .data$translate_value)) %>%
      dplyr::select(-.data$translate_value)
  }
