import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
   return {
      verbose: true,
      roots: ["<rootDir>/src/"],
      transform: {
         "\\.(ts)$": "ts-jest"
      }
   };
};