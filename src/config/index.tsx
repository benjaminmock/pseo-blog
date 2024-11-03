import Database from "better-sqlite3";
import { ReactElement } from "react";

// Define the type for the configuration module
interface ConfigModule {
  metadata: Record<string, any>;
  icon: ReactElement;
  faqs: { title: string; content: string }[];
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
  // configB: () => require("@/config/configB") as ConfigModule,
};

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

export let hasHeroImages = false;

export function initConfig(): ConfigModule {
  const configName = ACTIVE_CONFIGURATION;

  // If the config is already cached, return the cached version
  if (configCache[configName]) {
    const config = configCache[configName];
    metadata = config.metadata;
    icon = config.icon;
    faqs = config.faqs;
    return config;
  }

  // Load the config synchronously and cache it
  const config = loadConfigSync(configName);
  configCache[configName] = config;

  // Set module-level exports
  metadata = config.metadata;
  icon = config.icon;
  faqs = config.faqs;

  return config;
}
