export type TimeseriesResponseDto = {
  isoCode: string;
  population: number;
  timeseries: HistoricalDataDto;
};

export type HistoricalDataDto = {
  [key in keyof typeof TimeseriesType]: TimeseriesDto;
};

export const enum TimeseriesType {
  CASES = 'CASES',
  DEATHS = 'DEATHS',
  TESTS = 'TESTS',
  HOSPITALIZATIONS = 'HOSPITALIZATIONS',
  TEST_POSITIVITY = 'TEST_POSITIVITY',
  VACCINATIONS = 'VACCINATIONS',
}

export interface TimeseriesDto {
  type: TimeseriesType;
  values: DataPointDto[];
}

export interface DataPointDto {
  date: string;
  value: number;
}

export interface CountriesResponseDto {
  countries: CountryDataDto[];
}

export interface CountryDataDto {
  name: string;
  isoCode: string;
  population: number;
  totalCases: number;
  totalDeaths: number;
  totalTests: number;
  totalVaccinations: number;
  historicalData?: HistoricalDataDto;
}

export interface UserInfo {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
  hash: string;
}

export interface PredictionModel {
  id: number;
  name: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  lastScore?: number;
  lastPrediction?: string;
  owner: string;
  ownerId: string;
  region: string;
  type: TimeseriesType;
  displayType: 'daily' | 'absolute';
  seasonalityMode: 'additive' | 'multiplicative';
  rollingSumWindow: number;
  smoothing: number;
  daysToLookBack: number;
  changePoints: string[];
  numChangePoints: number;
  changePointPriorScale: number;
  seasonalityPriorScale: number;
  holidaysPriorScale: number;
  changePointRange: number;
  addCountryHolidays: boolean;
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NewPredictionModel = PartialBy<PredictionModel, 'id' | 'owner'>;

export interface DataPointPrediction {
  date: string;
  upperBound: number;
  yhat: number;
  lowerBound: number;
  changePoint: boolean;
}

export interface PredictionResponse {
  score?: number;
  dataPoints: DataPointPrediction[];
}
