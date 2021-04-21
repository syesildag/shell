export const development = "development";
export const production = "production";
export const test = "test";

export type environment = typeof development | typeof production | typeof test;

export const isDevEnvironment = process.env.NODE_ENV === development;
export const isProdEnvironment = process.env.NODE_ENV === production;
export const isTestEnvironment = process.env.NODE_ENV === test;