import { useLocation, Link } from "wouter";
import { useAdminKey } from "@/hooks/use-admin-key";
import {
  BarChart3,
  Briefcase,
  Server,
  Search,
  FlaskConical,
  FileText,
  Users,
  LayoutGrid,
  KeyRound,
  LogOut,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/admin/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/admin/business", label: "Business", icon: Briefcase },
  { href: "/admin/technical", label: "Technical", icon: Server },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
];

function navLinkClass(isActive: boolean): string {
  return [
    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-muted",
  ].join(" ");
}

export function AdminNav() {
  const [location] = useLocation();
  const [adminKey, , clearKey] = useAdminKey();

  return (
    <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 h-12 overflow-x-auto">
          <Link
            href="/admin"
            className={navLinkClass(location === "/admin")}
            data-testid="nav-link-admin-hub"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Hub
          </Link>

          <div className="w-px h-5 bg-border flex-shrink-0 mx-1" />

          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(location === href)}
              data-testid={`nav-link-${label.toLowerCase()}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}

          <div className="ml-auto flex items-center gap-2 flex-shrink-0 pl-2">
            {adminKey ? (
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium"
                  data-testid="nav-auth-status"
                >
                  <KeyRound className="h-3 w-3" />
                  Authenticated
                </span>
                <button
                  onClick={clearKey}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  data-testid="nav-button-sign-out"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out
                </button>
              </div>
            ) : (
              <span
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                data-testid="nav-auth-status"
              >
                <KeyRound className="h-3 w-3" />
                Not authenticated
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
