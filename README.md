
<!-- README.md is generated from README.Rmd. Please edit that file -->

# pacta.interactive.plot <a href="https://rmi-pacta.github.io/pacta.interactive.plot"><img src="man/figures/logo.png" align="right" height="31" /></a>

<!-- badges: start -->

[![Lifecycle:
experimental](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental)
[![test-coverage](https://github.com/RMI-PACTA/pacta.interactive.plot/actions/workflows/test-coverage.yaml/badge.svg)](https://github.com/RMI-PACTA/pacta.interactive.plot/actions/workflows/test-coverage.yaml)
[![Codecov test
coverage](https://codecov.io/gh/RMI-PACTA/pacta.interactive.plot/branch/master/graph/badge.svg)](https://codecov.io/gh/RMI-PACTA/pacta.interactive.plot?branch=master)
[![R-CMD-check](https://github.com/RMI-PACTA/pacta.interactive.plot/workflows/R-CMD-check/badge.svg)](https://github.com/RMI-PACTA/pacta.interactive.plot/actions)
[![pacta.interactive.plot status
badge](https://rmi-pacta.r-universe.dev/badges/pacta.interactive.plot)](https://rmi-pacta.r-universe.dev)
[![CRAN
status](https://www.r-pkg.org/badges/version/pacta.interactive.plot)](https://CRAN.R-project.org/package=pacta.interactive.plot)
<!-- badges: end -->

The goal of pacta.interactive.plot is to …

## Installation

<!--
You can install the released version of pacta.interactive.plot from [CRAN](https://CRAN.R-project.org) with:
&#10;``` r
install.packages("pacta.interactive.plot")
```
-->

You can install the development version of pacta.interactive.plot from
[R-universe](https://r-universe.dev) with:

``` r
install.packages("pacta.interactive.plot", repos = "https://rmi-pacta.r-universe.dev")
```

You can install the development version of pacta.interactive.plot from
[GitHub](https://github.com/RMI-PACTA/pacta.interactive.plot) with:

``` r
devtools::install_github("RMI-PACTA/pacta.interactive.plot")
```

## Example

This is a basic example usage of tech_exposure_chart():

``` r
library(pacta.interactive.plot)

load(system.file("example-data/test.rda", package = "pacta.interactive.plot"))

tech_exposure <-
  as_tech_exposure_data(
    equity_results_portfolio = equity_results_portfolio,
    bonds_results_portfolio = bonds_results_portfolio,
    indices_equity_results_portfolio = indices_equity_results_portfolio,
    indices_bonds_results_portfolio = indices_bonds_results_portfolio,
    select_scenario = "WEO2019_SDS",
    select_scenario_auto = "ETP2017_B2DS",
    select_scenario_shipping = "SBTI_SBTI",
    select_scenario_other = "ETP2017_B2DS",
    equity_market_levels = c("Global Market", "Developed Market", "Emerging Market")
  )

tech_exposure_chart(tech_exposure)
```

This is a basic example usage of trajectory_alignment_chart():

``` r
library(pacta.interactive.plot)

load(system.file("example-data/test.rda", package = "pacta.interactive.plot"))

trajectory_alignment_data <-
  as_trajectory_alignment_data(
    equity_results_portfolio = equity_results_portfolio,
    bonds_results_portfolio = bonds_results_portfolio,
    indices_equity_results_portfolio = indices_equity_results_portfolio,
    indices_bonds_results_portfolio = indices_bonds_results_portfolio,
  )

trajectory_alignment_chart(trajectory_alignment_data)
```

This is a basic example usage of peer_comparison_chart():

``` r
library(pacta.interactive.plot)

load(system.file("example-data/test.rda", package = "pacta.interactive.plot"))

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

peer_comparison_chart(peer_comparison_data)
```
