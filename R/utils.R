to_jsonp <-
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
  function(data, data_id) {
    json_data <- to_jsonp(data, data_id)
    utf8 <- enc2utf8(json_data)
    return(utf8)
  }


translate <-
  function(
    value_to_extract,
    language_select = "EN",
    translations = translation_list
  ){

    translations$value[translations$label == value_to_extract]


  }


# dataframe language translation functions--------------------------------------

choose_dictionary_language <- function(data, language){
  language <- tolower(language)

  key_values <- data %>%
    dplyr::transmute(
      id_data,
      id_column,
      translate_key = key,
      translate_value = .data[[language]]
    )

  key_values
}


translate_df_contents <- function(data,
                                  dictionary,
                                  inplace = FALSE){

  data_object_name <- rlang::expr_text(
    rlang::enexpr(data)
  )

  if (!(data_object_name %in% dictionary$id_data)) {
    rlang::abort(
      class = "dataset not in dictionary",
      glue::glue("the dataset {data_object_name} is not defined in translation dictionary.")
    )
  }

  dictionary_subset <- dictionary %>%
    filter(
      id_data == data_object_name
    ) %>%
    transmute(
      id_column,
      translate_key,
      translate_value
    )

  columns <- unique(dictionary_subset$id_column)

  for (column in columns) {

    data <- translate_column_contents(
      data,
      dictionary_subset,
      column,
      inplace
    )

  }

  data

}


translate_column_contents <- function(data,
                                      dictionary,
                                      column,
                                      inplace = FALSE){

  dictionary_column <- dictionary %>%
    filter(id_column == column) %>%
    select(-id_column)

  if (inplace){
    new_column <- column
  } else {
    new_column <- glue::glue(column, "_translation")
  }

  data %>%
    left_join(
      dictionary_column,
      by = rlang::set_names("translate_key", column)
    ) %>%
    mutate(
      !!new_column := ifelse(
        is.na(translate_value),
        .data[[!!column]],
        translate_value
      )
    ) %>%
    select(-translate_value)
}


translate_df_headers <- function(data, language_select, dictionary){

  language <- tolower(language_select)

  data_object_name <- rlang::expr_text(
    rlang::enexpr(data)
  )

  if (!(data_object_name %in% dictionary$id_data)) {
    rlang::abort(
      class = "dataset not in dictionary",
      glue::glue("the dataset {data_object_name} is not defined in translation dictionary.")
    )
  }

  column_tibble <- tibble(column_name = names(data))

  dictionary_subset <- dictionary %>%
    filter(
      id_data == data_object_name
    ) %>%
    transmute(
      id_column,
      .data[[!!language]]
    )

  translated_headers <- dictionary_subset %>%
    left_join(column_tibble, by = c(id_column = "column_name"))

  names(data) <- translated_headers[[language]]

  data
}


replace_contents <- function(data, display_currency){
  data %>% mutate(across(.fns = ~ gsub("_CUR_", display_currency, .x)))
}
