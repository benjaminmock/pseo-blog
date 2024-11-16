/* eslint-disable @typescript-eslint/no-require-imports */
import Database from "better-sqlite3";
import { ReactElement } from "react";

// Define the type for the configuration module
export interface ConfigModule {
  metadata: Record<string, string>;
  icon: ReactElement;
  favicon: string;
  faqs: { title: string; content: string }[];
  hasHeroImages: boolean;
}

// Define a cache for the loaded configuration
const configCache: Record<string, ConfigModule> = {};

// Set the active configuration
export const ACTIVE_CONFIGURATION = "yoga";

// Initialize the database connection
export const db = new Database(`${ACTIVE_CONFIGURATION}.db`);

// Map configuration names to module paths
const configMap: Record<string, () => ConfigModule> = {
  yoga: () => require("@/config/yoga") as ConfigModule,
  money: () => require("@/config/money") as ConfigModule,
  // configB: () => require("@/config/configB") as ConfigModule,
};

// const configMap: Record<string, () => Promise<ConfigModule>> = {
//   yoga: () => import("@/config/yoga") as Promise<ConfigModule>,
//   money: () => import("@/config/money") as Promise<ConfigModule>,
//   // configB: () => import("@/config/configB") as Promise<ConfigModule>,
// };

// Function to synchronously load the configuration module
function loadConfigSync(configName: string): ConfigModule {
  const loadModule = configMap[configName];
  if (!loadModule) {
    throw new Error(`Configuration module '${configName}' not found`);
  }
  return loadModule();
}

// Lazy-load the configuration once, populate exports, and cache it
export let metadata: ConfigModule["metadata"];
export let icon: ConfigModule["icon"];
export let faqs: ConfigModule["faqs"];
export let favicon: ConfigModule["favicon"];

export let hasHeroImages = false;

export function initConfig(): ConfigModule {
  const configName = ACTIVE_CONFIGURATION;

  // If the config is already cached, return the cached version
  if (configCache[configName]) {
    const config = configCache[configName];
    metadata = config.metadata;
    icon = config.icon;
    faqs = config.faqs;
    favicon = config.favicon;
    return config;
  }

  // Load the config synchronously and cache it
  const config = loadConfigSync(configName);
  configCache[configName] = config;

  // Set module-level exports
  metadata = config.metadata;
  icon = config.icon;
  favicon = config.favicon;
  faqs = config.faqs;

  hasHeroImages = config.hasHeroImages;

  return config;
}
