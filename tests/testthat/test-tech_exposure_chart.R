test_that("as_tech_exposure_data() works", {
  load("example-data/test.rda")
  tech_exposure <-
    as_tech_exposure_data(
      investor_name = investor_name,
      portfolio_name = portfolio_name,
      start_year = start_year,
      peer_group = peer_group,
      equity_results_portfolio = equity_results_portfolio,
      bonds_results_portfolio = bonds_results_portfolio,
      indices_equity_results_portfolio = indices_equity_results_portfolio,
      indices_bonds_results_portfolio = indices_bonds_results_portfolio,
      peers_equity_results_portfolio = peers_equity_results_portfolio,
      peers_bonds_results_portfolio = peers_bonds_results_portfolio,
      green_techs = green_techs,
      select_scenario = select_scenario,
      select_scenario_auto = select_scenario_auto,
      select_scenario_shipping = select_scenario_shipping,
      select_scenario_other = select_scenario_other,
      equity_market_levels = equity_market_levels,
      language_select = "EN"
    )

  expect_error(
    as_tech_exposure_data(
      investor_name = investor_name,
      portfolio_name = portfolio_name,
      start_year = start_year,
      peer_group = peer_group,
      equity_results_portfolio = equity_results_portfolio,
      bonds_results_portfolio = bonds_results_portfolio,
      indices_equity_results_portfolio = indices_equity_results_portfolio,
      indices_bonds_results_portfolio = indices_bonds_results_portfolio,
      peers_equity_results_portfolio = peers_equity_results_portfolio,
      peers_bonds_results_portfolio = peers_bonds_results_portfolio,
      green_techs = green_techs,
      select_scenario = select_scenario,
      select_scenario_auto = select_scenario_auto,
      select_scenario_shipping = select_scenario_shipping,
      select_scenario_other = select_scenario_other,
      equity_market_levels = equity_market_levels,
      language_select = "EN"
    )
    , NA)
  expect_s3_class(tech_exposure, "data.frame")
})
