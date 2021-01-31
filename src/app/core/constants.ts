import { PredictionModel, TimeseriesType } from '../api/dto/dtos';

export const TYPE_DASHES_CONFIG: { [index in keyof typeof TimeseriesType]: string } = {
  CASES: '1,0',
  TESTS: '1,5',
  TEST_POSITIVITY: '2,1',
  DEATHS: '2,1',
  HOSPITALIZATIONS: '2,1',
  VACCINATIONS: '1',
};

export const TIMESERIES_TYPE_DISPLAY_NAME: { [index in keyof typeof TimeseriesType]: string } = {
  CASES: 'Cases',
  DEATHS: 'Fatalities',
  TESTS: 'Tests',
  VACCINATIONS: 'Vaccinations',
  HOSPITALIZATIONS: 'Hospitalizations',
  TEST_POSITIVITY: 'Test Positivity',
};

export const MODEL_STATUS: { [index in PredictionModel['status']]: string } = {
  DRAFT: 'Draft',
  INACTIVE: 'Inactive',
  PUBLISHED: 'PUBLISHED',
};
