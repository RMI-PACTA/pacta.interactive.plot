tech_roadmap_sectors_default <-
  c("Automotive", "Power", "Oil&Gas", "Coal")

scen_geo_levels_default <-
  c("Global Aggregate", "Global", "OECD", "NonOECD")

all_tech_levels_default <-
  c(
    "RenewablesCap",
    "HydroCap",
    "NuclearCap",
    "GasCap",
    "OilCap",
    "CoalCap",
    "Electric",
    "Electric_HDV",
    "FuelCell",
    "FuelCell_HDV",
    "Hybrid",
    "Hybrid_HDV",
    "ICE",
    "ICE_HDV",
    "Oil",
    "Gas",
    "Coal",
    "Integrated facility",
    "Grinding",
    "Ac-Electric Arc Furnace",
    "Dc-Electric Arc Furnace",
    "Bof Shop",
    "Open Hearth Meltshop",
    "Freight",
    "Passenger",
    "Mix",
    "Other",
    "A Grade",
    "B Grade",
    "C Grade",
    "D Grade",
    "E Grade",
    "F Grade",
    "G Grade",
    "U Grade",
    "No Grade"
  )

dataframe_translations_default <-
  readr::read_csv("data-raw/dataframe_translations.csv",
    col_types = readr::cols(.default = "c")
  )


usethis::use_data(
  tech_roadmap_sectors_default,
  scen_geo_levels_default,
  all_tech_levels_default,
  dataframe_translations_default,
  overwrite = TRUE,
  internal = TRUE
)
