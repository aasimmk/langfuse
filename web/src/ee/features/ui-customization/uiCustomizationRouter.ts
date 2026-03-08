import { env } from "@/src/env.mjs";
import { hasEntitlementBasedOnPlan } from "@/src/features/entitlements/server/hasEntitlement";
import {
  createTRPCRouter,
  authenticatedProcedure,
} from "@/src/server/api/trpc";
import { getVisibleProductModules } from "@/src/ee/features/ui-customization/productModuleSchema";

function parseAllowedDomains(envValue: string | undefined): Set<string> {
  if (!envValue?.trim()) return new Set();
  return new Set(
    envValue
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isUrlAllowedByWhitelist(
  url: string | undefined,
  allowedDomains: Set<string>,
): url is string {
  if (!url || allowedDomains.size === 0) return Boolean(url);
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      allowedDomains.has(host) ||
      [...allowedDomains].some((d) => host.endsWith(`.${d}`))
    );
  } catch {
    return false;
  }
}

export const uiCustomizationRouter = createTRPCRouter({
  get: authenticatedProcedure.query(({ ctx }) => {
    const hasEntitlement = hasEntitlementBasedOnPlan({
      plan: ctx.session.environment.selfHostedInstancePlan,
      entitlement: "self-host-ui-customization",
    });
    if (!hasEntitlement) return null;

    const allowedDomains = parseAllowedDomains(
      env.LANGFUSE_UI_LOGO_FAVICON_ALLOWED_DOMAINS,
    );

    const logoLightModeHref = isUrlAllowedByWhitelist(
      env.LANGFUSE_UI_LOGO_LIGHT_MODE_HREF,
      allowedDomains,
    )
      ? env.LANGFUSE_UI_LOGO_LIGHT_MODE_HREF
      : undefined;
    const logoDarkModeHref = isUrlAllowedByWhitelist(
      env.LANGFUSE_UI_LOGO_DARK_MODE_HREF,
      allowedDomains,
    )
      ? env.LANGFUSE_UI_LOGO_DARK_MODE_HREF
      : undefined;
    const faviconHref = isUrlAllowedByWhitelist(
      env.LANGFUSE_UI_FAVICON_HREF,
      allowedDomains,
    )
      ? env.LANGFUSE_UI_FAVICON_HREF
      : undefined;
    const favicon256Href = isUrlAllowedByWhitelist(
      env.LANGFUSE_UI_FAVICON_256_HREF,
      allowedDomains,
    )
      ? env.LANGFUSE_UI_FAVICON_256_HREF
      : undefined;

    return {
      hostname: env.LANGFUSE_UI_API_HOST,
      documentationHref: env.LANGFUSE_UI_DOCUMENTATION_HREF,
      supportHref: env.LANGFUSE_UI_SUPPORT_HREF,
      feedbackHref: env.LANGFUSE_UI_FEEDBACK_HREF,
      logoLightModeHref,
      logoDarkModeHref,
      defaultModelAdapter: env.LANGFUSE_UI_DEFAULT_MODEL_ADAPTER,
      defaultBaseUrlOpenAI: env.LANGFUSE_UI_DEFAULT_BASE_URL_OPENAI,
      defaultBaseUrlAnthropic: env.LANGFUSE_UI_DEFAULT_BASE_URL_ANTHROPIC,
      defaultBaseUrlAzure: env.LANGFUSE_UI_DEFAULT_BASE_URL_AZURE,
      visibleModules: getVisibleProductModules(
        env.LANGFUSE_UI_VISIBLE_PRODUCT_MODULES,
        env.LANGFUSE_UI_HIDDEN_PRODUCT_MODULES,
      ),
      disableBookCallButton:
        env.LANGFUSE_UI_DISABLE_BOOK_CALL_BUTTON === "true",
      disableSupportButton: env.LANGFUSE_UI_DISABLE_SUPPORT_BUTTON === "true",
      faviconHref,
      favicon256Href,
      companyName: env.LANGFUSE_UI_COMPANY_NAME?.trim() || undefined,
    };
  }),
});
