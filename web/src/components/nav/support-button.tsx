import { LifeBuoy } from "lucide-react";
import { SidebarMenuButton, useSidebar } from "@/src/components/ui/sidebar";
import { useSupportDrawer } from "@/src/features/support-chat/SupportDrawerProvider";
import { useUiCustomization } from "@/src/ee/features/ui-customization/useUiCustomization";

export const SupportButton = () => {
  const uiCustomization = useUiCustomization();
  const { setOpen: setSupportDrawerOpen } = useSupportDrawer();
  const { isMobile, setOpenMobile: setOpenMobileSidebar } = useSidebar();

  if (uiCustomization?.disableSupportButton) {
    return null;
  }

  return (
    <SidebarMenuButton
      onClick={() => {
        if (isMobile) {
          setOpenMobileSidebar(false);
        }
        setTimeout(() => {
          // push to next tick to avoid flickering when hiding sidebar on mobile
          setSupportDrawerOpen(true);
        }, 1);
      }}
    >
      <LifeBuoy className="h-4 w-4" />
      Support
    </SidebarMenuButton>
  );
};
