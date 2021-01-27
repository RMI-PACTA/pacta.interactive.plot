test_that("as_tech_exposure_data() works", {
  expect_error(
    tech_exposure <-
      as_tech_exposure_data(
        equity_results_portfolio = equity_results_portfolio,
        bonds_results_portfolio = bonds_results_portfolio,
        indices_equity_results_portfolio = indices_equity_results_portfolio,
        indices_bonds_results_portfolio = indices_bonds_results_portfolio,
        select_scenario = select_scenario,
        select_scenario_auto = select_scenario_auto,
        select_scenario_shipping = select_scenario_shipping,
        select_scenario_other = select_scenario_other,
        equity_market_levels = equity_market_levels
      ),
    NA
  )
  expect_s3_class(tech_exposure, "data.frame")
})

test_that("tech_exposure_chart() works", {
  tech_exposure <-
    as_tech_exposure_data(
      equity_results_portfolio = equity_results_portfolio,
      bonds_results_portfolio = bonds_results_portfolio,
      indices_equity_results_portfolio = indices_equity_results_portfolio,
      indices_bonds_results_portfolio = indices_bonds_results_portfolio,
      select_scenario = select_scenario,
      select_scenario_auto = select_scenario_auto,
      select_scenario_shipping = select_scenario_shipping,
      select_scenario_other = select_scenario_other,
      equity_market_levels = equity_market_levels
    )

  expect_error(tech_exposure_obj <- tech_exposure_chart(tech_exposure), NA)
  expect_s3_class(tech_exposure_obj, "r2d3")
})
