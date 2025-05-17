import { Platform } from "react-native";

/**
 * Helper function to determine if code is running on a specific platform
 * @returns boolean indicating if the code is running on the specified platform
 */
export function isPlatform(platform: "web" | "native"): boolean {
  if (platform === "web") {
    return Platform.OS === "web";
  }
  return Platform.OS !== "web";
}

/**
 * Platform specific component types
 * Use this for components that have fundamentally different implementations on web vs native
 */
export type PlatformComponent<T = Record<string, unknown>> = {
  web: React.ComponentType<T>;
  native: React.ComponentType<T>;
};
