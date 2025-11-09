import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import { BellIcon, FileUserIcon } from "lucide-react";

export default function UserSettingsSidebar() {
  return (
    <SidebarNavMenuGroup
      items={[
        {
          icon: <BellIcon />,
          label: "Notifications",
          href: "/user-settings/notifications",
        },
        {
          icon: <FileUserIcon />,
          label: "Resume",
          href: "/user-settings/resume",
        },
      ]}
    />
  );
}
