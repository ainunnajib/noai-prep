import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "pandas-and-plotting",
  order: 10,
  part: "toolkit",
  domain: "computing",
  title: "pandas and plotting",
  tagline: "Tables you can question",
  summary: "Loading and inspecting tables with pandas, selecting rows and columns with loc, iloc and boolean filters, cleaning missing values, types and duplicates, grouping, merging and adding columns, and choosing and drawing the right plot with matplotlib and seaborn.",
  prerequisites: ["numpy", "probability-and-statistics"],
  syllabus: ["NOAI Computing: Pandas", "IOAI 1A2 NumPy and Pandas for Data Handling", "IOAI 1A3 Matplotlib and Seaborn for Visualization", "Series and DataFrames, head/info/describe, loc vs iloc, boolean filtering", "groupby (split-apply-combine), merge/join, map and apply", "Cleaning: isna, dropna, fillna, ffill, interpolate, astype, drop_duplicates"],
  lessons: [
    {
      slug: "dataframes-and-selection",
      title: "DataFrames: inspect, select and filter",
      summary: "Load a table, get a quick picture of it, and pull out exactly the rows and columns you need.",
      minutes: 25,
      objectives: ["You can describe a DataFrame as labelled columns (Series) sharing an index", "You can inspect data with head, info, describe and value_counts", "You can select with loc and iloc and filter rows with combined conditions"],
      load: () => import('./dataframes-and-selection.mdx'),
    },
    {
      slug: "cleaning-data",
      title: "Cleaning data: missing values, types and duplicates",
      summary: "Finding and handling missing values with isna, dropna, fillna, ffill and interpolate, fixing column types, and removing duplicates before any model sees the data.",
      minutes: 25,
      objectives: ["You can count missing values per column with df.isna().sum()", "You can choose between dropna, fillna, ffill and interpolate and predict the resulting shape", "You can fix column types with astype and pd.to_numeric and remove duplicate rows"],
      load: () => import('./cleaning-data.mdx'),
    },
    {
      slug: "groupby-merge",
      title: "groupby, aggregation and merging",
      summary: "Split-apply-combine summaries and joining tables on keys.",
      minutes: 25,
      objectives: ["You can predict the output of df.groupby('category').mean()", "You can choose the right join type for a merge", "You can create new columns with vectorised operations and map/apply"],
      load: () => import('./groupby-merge.mdx'),
    },
    {
      slug: "plotting-data",
      title: "Plotting data with matplotlib and seaborn",
      summary: "Choose the plot that answers your question, then draw it with the figure-axes recipe.",
      minutes: 30,
      objectives: ["You can choose a histogram, scatter, line, bar or box plot to answer a given question", "You can build a matplotlib figure with labelled axes", "You can draw grouped statistical plots with seaborn"],
      load: () => import('./plotting-data.mdx'),
    },
  ],
}

export default mod
