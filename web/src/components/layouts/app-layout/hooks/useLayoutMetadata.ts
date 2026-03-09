/**
 * Hook to generate layout metadata (page titles, favicons, etc.)
 * Based on active navigation and environment
 */

import { useMemo } from "react";
import { useLangfuseCloudRegion } from "@/src/features/organizations/hooks";
import { env } from "@/src/env.mjs";
import type { NavigationItem } from "@/src/components/layouts/utilities/routes";
import { useUiCustomization } from "@/src/ee/features/ui-customization/useUiCustomization";

/**
 * Generates metadata for the layout including:
 * - Dynamic page title based on active route
 * - Region-specific favicon (dev vs production)
 * - Custom favicon from EE UI customization when available
 * - Apple touch icon path
 *
 * @param activePathName - Title of the currently active navigation item
 * @param navigation - Full navigation array for finding active item
 * @returns Metadata object with title and icon paths
 */
export function useLayoutMetadata(
  activePathName: string | undefined,
  _navigation: NavigationItem[],
) {
  const { region } = useLangfuseCloudRegion();
  const uiCustomization = useUiCustomization();

  return useMemo(() => {
    const basePath = env.NEXT_PUBLIC_BASE_PATH ?? "";
    const appName = uiCustomization?.companyName ?? "Langfuse";

    // Determine page title from active route
    const title = activePathName ? `${activePathName} | ${appName}` : appName;

    // Use custom favicon from EE UI customization when available (supports SVG, PNG, and ICO)
    const faviconUrl = uiCustomization?.faviconUrl;
    const defaultFaviconPath =
      region === "DEV" ? `${basePath}/icon-dev.svg` : `${basePath}/icon.svg`;
    const defaultFavicon256Path = `${basePath}/icon256.png`;

    const faviconPath = faviconUrl ?? defaultFaviconPath;
    const favicon256Path = faviconUrl ?? defaultFavicon256Path;

    // Detect MIME type from URL for custom favicon (supports SVG, PNG, and ICO)
    const pathWithoutQuery = faviconUrl?.toLowerCase().split("?")[0] ?? "";
    const faviconMimeType = faviconUrl
      ? pathWithoutQuery.endsWith(".svg")
        ? ("image/svg+xml" as const)
        : pathWithoutQuery.endsWith(".ico")
          ? ("image/x-icon" as const)
          : ("image/png" as const)
      : null;

    return {
      title,
      faviconPath,
      favicon256Path,
      faviconUrl: faviconUrl ?? null,
      faviconMimeType,
      appleTouchIconPath: `${basePath}/apple-touch-icon.png`,
    };
  }, [
    activePathName,
    region,
    uiCustomization?.companyName,
    uiCustomization?.faviconUrl,
  ]);
}
