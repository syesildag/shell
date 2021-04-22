import dotenv, { DotenvConfigOutput } from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';
import { LevelWithSilent } from 'pino';

let output: DotenvConfigOutput = dotenv.config();

if (output.error)
   throw output.error;

export const development = "development";
export const production = "production";
export const test = "test";

export type type = typeof development | typeof production | typeof test;

export const isDevEnvironment = process.env.NODE_ENV === development;
export const isProdEnvironment = process.env.NODE_ENV === production;
export const isTestEnvironment = process.env.NODE_ENV === test;

export interface Environment extends NodeJS.Dict<any> {
   POSTGRES_HOST?: string;
   POSTGRES_PORT?: number;
   POSTGRES_USER?: string;
   POSTGRES_PASS?: string;
   POSTGRES_DATABASE?: string;
   REDIS_HOST?: string;
   REDIS_PORT?: number;
   HOTMAIL_USER?: string;
   HOTMAIL_PASS?: string;
   NB_TASK_WORKERS?: number;
   LOG_LEVEL?: LevelWithSilent;
   LOG_PRETTY_PRINT?: boolean;
}

const env: Readonly<Environment> = dotenvParseVariables(output.parsed);

export default env;