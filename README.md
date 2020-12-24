
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

This is a basic example usage:

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

<img src="man/figures/README-example-1.png" width="100%" />

<iframe src="example.html" width="100%" height="900" style="border:thin solid black;">
</iframe>
