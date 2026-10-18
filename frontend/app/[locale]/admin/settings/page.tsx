import { AdminResourcePage } from "@/components/admin-resource";
import { AdminSettingsNav } from "@/components/admin-settings-nav";

export default function SettingsPage() {
  return <><div className="admin-settings-nav-wrap"><AdminSettingsNav /></div><AdminResourcePage resource="settings" /></>;
}
