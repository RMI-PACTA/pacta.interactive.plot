
<!-- README.md is generated from README.Rmd. Please edit that file -->

# r2dii.interactive

<!-- badges: start -->

[![Lifecycle:
experimental](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental)
[![test-coverage](https://github.com/RMI-PACTA/r2dii.interactive/actions/workflows/test-coverage.yaml/badge.svg)](https://github.com/RMI-PACTA/r2dii.interactive/actions/workflows/test-coverage.yaml)
[![Codecov test
coverage](https://codecov.io/gh/RMI-PACTA/r2dii.interactive/branch/master/graph/badge.svg)](https://codecov.io/gh/RMI-PACTA/r2dii.interactive?branch=master)
[![R-CMD-check](https://github.com/RMI-PACTA/r2dii.interactive/workflows/R-CMD-check/badge.svg)](https://github.com/RMI-PACTA/r2dii.interactive/actions)
[![r2dii.interactive status
badge](https://2degreesinvesting.r-universe.dev/badges/r2dii.interactive)](https://2degreesinvesting.r-universe.dev)
[![CRAN
status](https://www.r-pkg.org/badges/version/r2dii.interactive)](https://CRAN.R-project.org/package=r2dii.interactive)
<!-- badges: end -->

The goal of r2dii.interactive is to …

## Installation

<!--
You can install the released version of r2dii.interactive from [CRAN](https://CRAN.R-project.org) with:

``` r
install.packages("r2dii.interactive")
```
-->

You can install the development version of r2dii.interactive from
[GitHub](https://github.com/RMI-PACTA/r2dii.interactive) with:

``` r
devtools::install_github("RMI-PACTA/r2dii.interactive")
```

## Example

This is a basic example usage of tech_exposure_chart():

``` r
library(r2dii.interactive)

load(system.file("example-data/test.rda", package = "r2dii.interactive"))

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
library(r2dii.interactive)

load(system.file("example-data/test.rda", package = "r2dii.interactive"))

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
library(r2dii.interactive)

load(system.file("example-data/test.rda", package = "r2dii.interactive"))

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
