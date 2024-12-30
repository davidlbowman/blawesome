import { SidebarNav } from "@/components/SidebarNav";

export default function ModulesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SidebarNav>{children}</SidebarNav>;
}
