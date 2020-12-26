
<!-- README.md is generated from README.Rmd. Please edit that file -->

# r2dii.interactive

<!-- badges: start -->

[![Lifecycle:
experimental](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental)
[![CRAN
status](https://www.r-pkg.org/badges/version/r2dii.interactive)](https://CRAN.R-project.org/package=r2dii.interactive)
[![Codecov test
coverage](https://codecov.io/gh/2DegreesInvesting/r2dii.interactive/branch/master/graph/badge.svg)](https://codecov.io/gh/2DegreesInvesting/r2dii.interactive?branch=master)
[![R-CMD-check](https://github.com/2DegreesInvesting/r2dii.interactive/workflows/R-CMD-check/badge.svg)](https://github.com/2DegreesInvesting/r2dii.interactive/actions)
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
[GitHub](https://github.com/2DegreesInvesting/r2dii.interactive) with:

``` r
devtools::install_github("2DegreesInvesting/r2dii.interactive")
```

## Example

This is a basic example usage of tech\_exposure\_chart():

``` r
library(r2dii.interactive)

load(system.file("example-data/test.rda", package = "r2dii.interactive"))

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
    all_tech_levels = all_tech_levels,
    equity_market_levels = equity_market_levels,
    dataframe_translations = dataframe_translations,
    language_select = "EN"
  )

tech_exposure_chart(tech_exposure)
```

This is a basic example usage of trajectory\_alignment\_chart():

``` r
library(r2dii.interactive)

load(system.file("example-data/test.rda", package = "r2dii.interactive"))

trajectory_alignment_data <-
  as_trajectory_alignment_data(
    investor_name = investor_name,
    portfolio_name = portfolio_name,
    peer_group = peer_group,
    equity_results_portfolio = equity_results_portfolio,
    bonds_results_portfolio = bonds_results_portfolio,
    indices_equity_results_portfolio = indices_equity_results_portfolio,
    indices_bonds_results_portfolio = indices_bonds_results_portfolio,
    peers_equity_results_portfolio = peers_equity_results_portfolio,
    peers_bonds_results_portfolio = peers_bonds_results_portfolio,
    tech_roadmap_sectors = tech_roadmap_sectors,
    scen_geo_levels = scen_geo_levels,
    all_tech_levels = all_tech_levels,
    dataframe_translations = dataframe_translations,
    language_select = "EN"
  )

trajectory_alignment_chart(trajectory_alignment_data)
```

This is a basic example usage of peer\_comparison\_chart():

``` r
library(r2dii.interactive)

load(system.file("example-data/test.rda", package = "r2dii.interactive"))

peer_comparison_data <-
  as_peer_comparison_data(
    investor_name = investor_name,
    portfolio_name = portfolio_name,
    peer_group = peer_group,
    start_year = start_year,
    equity_results_portfolio = equity_results_portfolio,
    bonds_results_portfolio = bonds_results_portfolio,
    indices_equity_results_portfolio = indices_equity_results_portfolio,
    indices_bonds_results_portfolio = indices_bonds_results_portfolio,
    peers_equity_results_user = peers_equity_results_user,
    peers_bonds_results_user = peers_bonds_results_user,
    select_scenario = select_scenario,
    select_scenario_auto = select_scenario_auto,
    select_scenario_shipping = select_scenario_shipping,
    select_scenario_other = select_scenario_other,
    dataframe_translations = dataframe_translations,
    language_select = "EN"
  )

peer_comparison_chart(peer_comparison_data)
```
