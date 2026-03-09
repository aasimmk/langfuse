import { env } from "@/src/env.mjs";
import { hasEntitlementBasedOnPlan } from "@/src/features/entitlements/server/hasEntitlement";
import {
  createTRPCRouter,
  authenticatedProcedure,
} from "@/src/server/api/trpc";
import { getVisibleProductModules } from "@/src/ee/features/ui-customization/productModuleSchema";

export const uiCustomizationRouter = createTRPCRouter({
  get: authenticatedProcedure.query(({ ctx }) => {
    const hasEntitlement = hasEntitlementBasedOnPlan({
      plan: ctx.session.environment.selfHostedInstancePlan,
      entitlement: "self-host-ui-customization",
    });
    if (!hasEntitlement) return null;

    const logoLightModeHref = env.LANGFUSE_UI_LOGO_LIGHT_MODE_HREF;
    const logoDarkModeHref = env.LANGFUSE_UI_LOGO_DARK_MODE_HREF;
    const faviconHref = env.LANGFUSE_UI_FAVICON_HREF;
    const favicon256Href = env.LANGFUSE_UI_FAVICON_256_HREF;

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
