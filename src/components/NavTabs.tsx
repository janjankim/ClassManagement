import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "경기 현황", end: true },
  { to: "/table", label: "경기 표", end: false },
  { to: "/standings", label: "순위", end: false },
  { to: "/admin", label: "관리자", end: false },
];

export function NavTabs() {
  return (
    <nav className="flex flex-wrap justify-center gap-2 pb-6">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              isActive ? "bg-brand-600 text-white" : "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
