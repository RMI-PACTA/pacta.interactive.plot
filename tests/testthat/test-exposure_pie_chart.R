test_that("as_exposure_pie_data() works", {
  expect_error(
    exposure_pie_data <- as_exposure_pie_data(audit_file),
    NA
  )
  expect_s3_class(exposure_pie_data, "data.frame")
})

test_that("exposure_pie_chart() works", {
  exposure_pie_data <- as_exposure_pie_data(audit_file)

  expect_error(exposure_pie_obj <- exposure_pie_chart(exposure_pie_data), NA)
  expect_s3_class(exposure_pie_obj, "r2d3")
})
