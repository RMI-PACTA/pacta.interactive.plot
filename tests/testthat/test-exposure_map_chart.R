test_that("as_exposure_map_data() works", {
  expect_error(
    exposure_map_data <- as_exposure_map_data(bonds_results_map),
    NA
  )
  expect_s3_class(exposure_map_data, "data.frame")
})

test_that("exposure_map_chart() works", {
  exposure_map_data <- as_exposure_map_data(bonds_results_map)

  expect_error(exposure_map_obj <- exposure_map_chart(exposure_map_data), NA)
  expect_s3_class(exposure_map_obj, "r2d3")
})
