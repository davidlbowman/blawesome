import { SidebarNav } from "@/components/core/SidebarNav";

export default function ModulesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SidebarNav>{children}</SidebarNav>;
}
