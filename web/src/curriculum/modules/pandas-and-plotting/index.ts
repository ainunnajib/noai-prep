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
      objectives: ["You can tell when pandas gives a Series and when it gives a DataFrame", "You can read info() and describe() output: missing counts, mean, median and std", "You can predict which rows loc and iloc return, even after sorting", "You can filter rows with combined conditions using &, | and brackets"],
      load: () => import('./dataframes-and-selection.mdx'),
    },
    {
      slug: "cleaning-data",
      title: "Cleaning data: missing values, types and duplicates",
      summary: "Finding and handling missing values with isna, dropna, fillna, ffill and interpolate, fixing column types, and removing duplicates before any model sees the data.",
      minutes: 25,
      objectives: ["You can count missing values per column with df.isna().sum()", "You can choose between dropna, fillna, ffill and interpolate, and predict the shape and values each one gives", "You can fix numbers stored as text with str.replace, astype and pd.to_numeric, and remove duplicate rows"],
      load: () => import('./cleaning-data.mdx'),
    },
    {
      slug: "groupby-merge",
      title: "groupby, aggregation and merging",
      summary: "Split-apply-combine summaries with groupby, joining tables on a key with merge, and adding new columns with vectorised maths, map and apply.",
      minutes: 25,
      objectives: ["You can work out what a groupby with mean, sum or count returns: one row per group", "You can choose the join type for a merge and count the rows it returns", "You can add new columns with vectorised arithmetic, map and apply, and say why vectorised code is faster"],
      load: () => import('./groupby-merge.mdx'),
    },
    {
      slug: "plotting-data",
      title: "Plotting data with matplotlib and seaborn",
      summary: "Choose the plot that answers your question, read histograms, box plots and training curves, and draw them with matplotlib and seaborn.",
      minutes: 30,
      objectives: ["You can choose a histogram, scatter, line, bar or box plot to answer a given question", "You can work out a box plot's quartiles, IQR and outlier fences by hand", "You can set up a matplotlib figure and grid of axes with plt.subplots and label them", "You can read seaborn calls that split a plot by category with hue"],
      load: () => import('./plotting-data.mdx'),
    },
  ],
}

export default mod
