import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AdminShell } from "@/components/admin-shell";
import { PanelErrorCard, PanelSkeleton } from "@/components/admin-dashboard-utils";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  Info,
  FileText,
  Globe,
  Eye,
  MousePointer,
} from "lucide-react";

interface GscPageItem {
  url: string;
  status: string;
  reason: string;
  nextStep: string;
  clicks: number;
  impressions: number;
  inSitemap: boolean;
}

interface GscSummary {
  indexed: GscPageItem[];
  discoveredNotIndexed: GscPageItem[];
  errors: GscPageItem[];
  notInSitemap: GscPageItem[];
  totalSitemapUrls: number;
  totalIndexed: number;
  totalNeedingAttention: number;
  setup_required?: boolean;
  apiWarnings?: string[];
}

const GLOSSARY_TERMS = [
  {
    term: "Indexed",
    definition:
      "A page that Google has visited, read, and included in its search results. When someone searches for something related to your site, only indexed pages can appear.",
  },
  {
    term: "Crawled",
    definition:
      "When Google's automated program (called a 'crawler' or 'Googlebot') visits and reads a page on your site. Crawling is the first step before indexing.",
  },
  {
    term: "Canonical",
    definition:
      "When you have very similar pages, you can tell Google which one is the 'main' version using a canonical tag. Google will then focus on that page for search results.",
  },
  {
    term: "Sitemap",
    definition:
      "A file (sitemap.xml) that lists all the pages on your site you want Google to find and index. Think of it as a table of contents for your website.",
  },
  {
    term: "robots.txt",
    definition:
      "A file on your website that tells search engines which pages they are or aren't allowed to visit. If a page is blocked in robots.txt, Google won't index it.",
  },
  {
    term: "noindex",
    definition:
      "A tag you can add to a web page to tell Google 'please don't include this in search results.' Useful for pages like admin areas that shouldn't appear in Google.",
  },
];

function gscInspectUrl(url: string): string {
  return `https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fodigosauto.com%2F&id=${encodeURIComponent(url)}`;
}

function urlPath(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

function StatusBadge({ status }: { status: string }) {
  const indexed = status === "INDEXED";
  const error = [
    "NOT_FOUND", "SERVER_ERROR", "REDIRECT_ERROR",
    "BLOCKED_BY_ROBOTS_TXT", "BLOCKED_BY_META_TAG",
    "BLOCKED_BY_HTTP_HEADER", "SOFT_404", "EXCLUDED_BY_NOINDEX",
  ].includes(status);
  const notInSitemap = status === "NOT_IN_SITEMAP";

  if (indexed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="h-3 w-3" /> Indexed
      </span>
    );
  }
  if (error) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="h-3 w-3" /> Problem
      </span>
    );
  }
  if (notInSitemap) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        <Globe className="h-3 w-3" /> Not in sitemap
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      <AlertTriangle className="h-3 w-3" /> Not indexed yet
    </span>
  );
}

function PageRow({
  item,
  showNextStep,
}: {
  item: GscPageItem;
  showNextStep: boolean;
}) {
  return (
    <div
      className="border rounded-lg p-4 space-y-2"
      data-testid={`seo-row-${encodeURIComponent(item.url)}`}
    >
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-mono text-sm font-medium truncate text-foreground" data-testid="text-page-path">
            {urlPath(item.url)}
          </p>
          <p className="text-xs text-muted-foreground">{item.reason}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={item.status} />
          {item.clicks > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-clicks">
              <MousePointer className="h-3 w-3" /> {item.clicks.toLocaleString()}
            </span>
          )}
          {item.impressions > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-impressions">
              <Eye className="h-3 w-3" /> {item.impressions.toLocaleString()}
            </span>
          )}
          <a
            href={gscInspectUrl(item.url)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`link-gsc-${encodeURIComponent(item.url)}`}
          >
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
              <ExternalLink className="h-3 w-3" />
              View in GSC
            </Button>
          </a>
        </div>
      </div>
      {showNextStep && item.nextStep && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
            What to do next
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">{item.nextStep}</p>
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  iconColor,
  items,
  showNextStep,
  emptyMessage,
  defaultOpen = false,
}: {
  title: string;
  icon: typeof CheckCircle;
  iconColor: string;
  items: GscPageItem[];
  showNextStep: boolean;
  emptyMessage: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || items.length > 0);

  return (
    <Card data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-3">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setOpen((o) => !o)}
          data-testid={`toggle-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            {title}
            <Badge variant="secondary" className="ml-1">{items.length}</Badge>
          </CardTitle>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
      </CardHeader>
      {open && (
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <PageRow key={item.url} item={item} showNextStep={showNextStep} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function GlossaryAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <Card data-testid="section-glossary">
      <CardHeader className="pb-3">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setOpen((o) => !o)}
          data-testid="toggle-glossary"
        >
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-muted-foreground" />
            Plain-English Glossary
          </CardTitle>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
      </CardHeader>
      {open && (
        <CardContent>
          <dl className="space-y-4">
            {GLOSSARY_TERMS.map((term) => (
              <div key={term.term}>
                <dt className="text-sm font-semibold text-foreground" data-testid={`glossary-term-${term.term.toLowerCase()}`}>{term.term}</dt>
                <dd className="text-sm text-muted-foreground mt-0.5">{term.definition}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}
    </Card>
  );
}

function SetupCard() {
  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20" data-testid="card-setup-required">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
          <Search className="h-5 w-5" />
          Connect to Google Search Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          To show your Google search health data, you need to connect a Google service account. Here's how:
        </p>
        <ol className="space-y-3 text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside">
          <li>
            Go to <strong>console.cloud.google.com</strong> and create a new project (or select an existing one).
          </li>
          <li>
            Enable the <strong>Google Search Console API</strong> for your project under "APIs & Services → Library".
          </li>
          <li>
            Under "APIs & Services → Credentials", click <strong>"Create Credentials → Service Account"</strong>. Give it any name and click through.
          </li>
          <li>
            Click on the new service account, go to the <strong>"Keys"</strong> tab, then "Add Key → Create new key → JSON". A JSON file will download.
          </li>
          <li>
            Copy the email address of the service account (it ends in <code>.iam.gserviceaccount.com</code>).
          </li>
          <li>
            Go to <strong>search.google.com/search-console</strong>, open your property, then "Settings → Users and permissions → Add user". Paste the service account email and give it <strong>"Full"</strong> permission.
          </li>
          <li>
            Open the downloaded JSON file, copy its entire contents, and paste it into a Replit secret called <strong><code>GOOGLE_SERVICE_ACCOUNT_JSON</code></strong>.
          </li>
          <li>Restart the server — this page will then show your real data.</li>
        </ol>
      </CardContent>
    </Card>
  );
}

export default function AdminSeo() {
  return (
    <AdminShell>
      {(adminKey, clearKey) => <AdminSeoInner adminKey={adminKey} clearKey={clearKey} />}
    </AdminShell>
  );
}

function AdminSeoInner({ adminKey, clearKey }: { adminKey: string; clearKey: () => void }) {

  const gscQuery = useQuery<GscSummary>({
    queryKey: ["/api/admin/gsc/summary", adminKey],
    queryFn: async () => {
      const res = await fetch("/api/admin/gsc/summary", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 503 && body?.setup_required) {
          return { ...body, indexed: [], discoveredNotIndexed: [], errors: [], notInSitemap: [], totalSitemapUrls: 0, totalIndexed: 0, totalNeedingAttention: 0 };
        }
        throw new Error(`${res.status}`);
      }
      return res.json();
    },
    enabled: !!adminKey,
    staleTime: 5 * 60 * 1000,
  });

  const data = gscQuery.data;
  const isLoading = gscQuery.isLoading;
  const isError = gscQuery.isError;
  const errMsg = (gscQuery.error as Error)?.message ?? "";
  const setupRequired = data?.setup_required === true;

  return (
    <>
      <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/metrics">
              <Button variant="ghost" size="sm" data-testid="link-back-metrics">
                <ArrowLeft className="h-4 w-4 mr-1" /> Metrics
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">SEO Dashboard</h1>
              <p className="text-sm text-muted-foreground">Google search health in plain English</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => gscQuery.refetch()}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {isError && !setupRequired && <PanelErrorCard error={gscQuery.error} label="SEO data" />}

        {!setupRequired && !isLoading && data?.apiWarnings && data.apiWarnings.length > 0 && (
          <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950/20" data-testid="banner-api-warnings">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {data.apiWarnings.map((w, i) => (
                    <p key={i} className="text-amber-700 dark:text-amber-400 text-sm">{w}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {setupRequired && <SetupCard />}

        {!setupRequired && isLoading && (
          <div className="space-y-4">
            <PanelSkeleton height="h-28" />
            <PanelSkeleton height="h-40" />
            <PanelSkeleton height="h-40" />
          </div>
        )}

        {!setupRequired && !isLoading && data && (
          <>
            <Card data-testid="card-health-summary">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                    <Search className="h-5 w-5 text-green-700 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground" data-testid="text-health-summary">
                      Google knows about {data.totalIndexed} of your {data.totalSitemapUrls} pages.
                      {data.totalNeedingAttention > 0
                        ? ` ${data.totalNeedingAttention} page${data.totalNeedingAttention === 1 ? "" : "s"} need${data.totalNeedingAttention === 1 ? "s" : ""} your attention.`
                        : " Everything looks great!"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Data from the last 28 days via Google Search Console.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SectionCard
              title="Indexed & Working"
              icon={CheckCircle}
              iconColor="text-green-600 dark:text-green-400"
              items={data.indexed}
              showNextStep={false}
              emptyMessage="No pages indexed yet. This may mean Google hasn't visited your site. Try submitting your sitemap in Google Search Console."
              defaultOpen={false}
            />

            <SectionCard
              title="Found But Not Indexed Yet"
              icon={AlertTriangle}
              iconColor="text-yellow-600 dark:text-yellow-400"
              items={data.discoveredNotIndexed}
              showNextStep={true}
              emptyMessage="No pages in this category."
              defaultOpen={true}
            />

            <SectionCard
              title="Pages With Problems"
              icon={XCircle}
              iconColor="text-red-600 dark:text-red-400"
              items={data.errors}
              showNextStep={true}
              emptyMessage="No pages with problems."
              defaultOpen={true}
            />

            <SectionCard
              title="Not In Sitemap"
              icon={FileText}
              iconColor="text-purple-600 dark:text-purple-400"
              items={data.notInSitemap}
              showNextStep={true}
              emptyMessage="No pages found outside your sitemap."
              defaultOpen={data.notInSitemap.length > 0}
            />
          </>
        )}

        <GlossaryAccordion />
      </div>
      </div>
    </>
  );
}
