test_that("as_trajectory_alignment_data() works", {
  expect_error(
    trajectory_alignment_data <-
      as_trajectory_alignment_data(
        equity_results_portfolio = equity_results_portfolio,
        bonds_results_portfolio = bonds_results_portfolio,
        indices_equity_results_portfolio = indices_equity_results_portfolio,
        indices_bonds_results_portfolio = indices_bonds_results_portfolio
      ),
    NA
  )
  expect_s3_class(trajectory_alignment_data, "data.frame")
})

test_that("trajectory_alignment_chart() works", {
  trajectory_alignment_data <-
    as_trajectory_alignment_data(
      equity_results_portfolio = equity_results_portfolio,
      bonds_results_portfolio = bonds_results_portfolio,
      indices_equity_results_portfolio = indices_equity_results_portfolio,
      indices_bonds_results_portfolio = indices_bonds_results_portfolio
    )

  expect_error(trajectory_alignment_obj <- trajectory_alignment_chart(trajectory_alignment_data), NA)
  expect_s3_class(trajectory_alignment_obj, "r2d3")
})
