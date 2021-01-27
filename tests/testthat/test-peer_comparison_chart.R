test_that("as_peer_comparison_data() works", {
  expect_error(
    peer_comparison_data <-
      as_peer_comparison_data(
        equity_results_portfolio = equity_results_portfolio,
        bonds_results_portfolio = bonds_results_portfolio,
        peers_equity_results_user = peers_equity_results_user,
        peers_bonds_results_user = peers_bonds_results_user,
        investor_name = "Test",
        portfolio_name = "TestPortfolio_Input",
        start_year = 2020,
        peer_group = "pensionfund",
        select_scenario = "WEO2019_SDS",
        select_scenario_auto = "ETP2017_B2DS",
        select_scenario_shipping = "SBTI_SBTI",
        select_scenario_other = "ETP2017_B2DS"
      ),
    NA
  )
  expect_s3_class(peer_comparison_data, "data.frame")
})

test_that("trajectory_alignment_chart() works", {
  peer_comparison_data <-
    as_peer_comparison_data(
      equity_results_portfolio = equity_results_portfolio,
      bonds_results_portfolio = bonds_results_portfolio,
      peers_equity_results_user = peers_equity_results_user,
      peers_bonds_results_user = peers_bonds_results_user,
      investor_name = "Test",
      portfolio_name = "TestPortfolio_Input",
      start_year = 2020,
      peer_group = "pensionfund",
      select_scenario = "WEO2019_SDS",
      select_scenario_auto = "ETP2017_B2DS",
      select_scenario_shipping = "SBTI_SBTI",
      select_scenario_other = "ETP2017_B2DS"
    )

  expect_error(peer_comparison_obj <- peer_comparison_chart(peer_comparison_data), NA)
  expect_s3_class(peer_comparison_obj, "r2d3")
})
