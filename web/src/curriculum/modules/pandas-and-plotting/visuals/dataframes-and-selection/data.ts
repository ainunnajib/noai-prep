/*
  The running example for this lesson: eight HDB resale flats (made-up but realistic numbers).

    df = pd.DataFrame({
        'town':  ['Tampines', 'Bedok', 'Punggol', 'Tampines', 'Yishun', 'Tampines', 'Bedok', 'Punggol'],
        'rooms': [4, 3, 5, 3, 4, 5, 4, 4],
        'area':  [92, 67, 112, 68, None, 120, 90, 95],
        'price': [585000, 398000, 720000, 430000, 512000, 760000, 540000, 598000],
    })

  `area` has one missing value (row 4), so pandas stores it as float64.
*/

export type ColName = 'town' | 'rooms' | 'area' | 'price'
export const COLS: ColName[] = ['town', 'rooms', 'area', 'price']
export const DTYPES: Record<ColName, string> = { town: 'object', rooms: 'int64', area: 'float64', price: 'int64' }

export interface Flat {
  town: string
  rooms: number
  /** null = missing (NaN) */
  area: number | null
  price: number
}

export const FLATS: Flat[] = [
  { town: 'Tampines', rooms: 4, area: 92, price: 585000 },
  { town: 'Bedok', rooms: 3, area: 67, price: 398000 },
  { town: 'Punggol', rooms: 5, area: 112, price: 720000 },
  { town: 'Tampines', rooms: 3, area: 68, price: 430000 },
  { town: 'Yishun', rooms: 4, area: null, price: 512000 },
  { town: 'Tampines', rooms: 5, area: 120, price: 760000 },
  { town: 'Bedok', rooms: 4, area: 90, price: 540000 },
  { town: 'Punggol', rooms: 4, area: 95, price: 598000 },
]

export const TOWNS = ['Bedok', 'Punggol', 'Tampines', 'Yishun']

/** Format a cell the way pandas prints this DataFrame (area is float64, so 92 prints as 92.0). */
export function fmtCell(f: Flat, c: ColName): string {
  const v = f[c]
  if (v === null) return 'NaN'
  if (c === 'area') return (v as number).toFixed(1)
  return String(v)
}

// ---- Outputs below were generated with pandas 2.2.3 (print() output, verbatim). ----
/** print(df[col]) */
export const SERIES_OUT: Record<string, string> = {
  town: "0    Tampines\n1       Bedok\n2     Punggol\n3    Tampines\n4      Yishun\n5    Tampines\n6       Bedok\n7     Punggol\nName: town, dtype: object",
  rooms: "0    4\n1    3\n2    5\n3    3\n4    4\n5    5\n6    4\n7    4\nName: rooms, dtype: int64",
  area: "0     92.0\n1     67.0\n2    112.0\n3     68.0\n4      NaN\n5    120.0\n6     90.0\n7     95.0\nName: area, dtype: float64",
  price: "0    585000\n1    398000\n2    720000\n3    430000\n4    512000\n5    760000\n6    540000\n7    598000\nName: price, dtype: int64",
}
/** df[col].to_numpy() as Jupyter displays it (repr) */
export const ARRAY_OUT: Record<string, string> = {
  town: "array(['Tampines', 'Bedok', 'Punggol', 'Tampines', 'Yishun', 'Tampines',\n       'Bedok', 'Punggol'], dtype=object)",
  rooms: "array([4, 3, 5, 3, 4, 5, 4, 4])",
  area: "array([ 92.,  67., 112.,  68.,  nan, 120.,  90.,  95.])",
  price: "array([585000, 398000, 720000, 430000, 512000, 760000, 540000, 598000])",
}
/** print(df.loc[r]) */
export const ROW_OUT: string[] = [
  "town     Tampines\nrooms           4\narea         92.0\nprice      585000\nName: 0, dtype: object",
  "town      Bedok\nrooms         3\narea       67.0\nprice    398000\nName: 1, dtype: object",
  "town     Punggol\nrooms          5\narea       112.0\nprice     720000\nName: 2, dtype: object",
  "town     Tampines\nrooms           3\narea         68.0\nprice      430000\nName: 3, dtype: object",
  "town     Yishun\nrooms         4\narea        NaN\nprice    512000\nName: 4, dtype: object",
  "town     Tampines\nrooms           5\narea        120.0\nprice      760000\nName: 5, dtype: object",
  "town      Bedok\nrooms         4\narea       90.0\nprice    540000\nName: 6, dtype: object",
  "town     Punggol\nrooms          4\narea        95.0\nprice     598000\nName: 7, dtype: object",
]
/** print(df.loc[r, col]) */
export const CELL_OUT: string[][] = [
  ["Tampines", "4", "92.0", "585000"],
  ["Bedok", "3", "67.0", "398000"],
  ["Punggol", "5", "112.0", "720000"],
  ["Tampines", "3", "68.0", "430000"],
  ["Yishun", "4", "nan", "512000"],
  ["Tampines", "5", "120.0", "760000"],
  ["Bedok", "4", "90.0", "540000"],
  ["Punggol", "4", "95.0", "598000"],
]
export const INDEX_OUT = "RangeIndex(start=0, stop=8, step=1)"
export const COLUMNS_OUT = "Index(['town', 'rooms', 'area', 'price'], dtype='object')"
export const DTYPES_OUT = "town      object\nrooms      int64\narea     float64\nprice      int64\ndtype: object"
export const SHAPE_OUT = "(8, 4)"
