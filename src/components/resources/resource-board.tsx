"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { MasonryGrid } from "@egjs/react-grid";
import { Columns3, List, Menu, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Canvas as CanvasEffect } from "@/components/canvasui/Canvas";
import { ResourceCard, type ResourceView } from "@/components/resources/resource-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_VALUES } from "@/data/categories";
import {
  getCachedResourceList,
  invalidateResourceListCache,
  requestResourceList,
} from "@/lib/client-resources";
import type { ResourceDto } from "@/lib/resources";
import type { ResourceInput } from "@/schemas/resource";
import { cn, readApiError } from "@/lib/utils";

const DeleteResourceDialog = dynamic(
  () =>
    import("@/components/resources/delete-resource-dialog").then(
      (module) => module.DeleteResourceDialog,
    ),
  { ssr: false },
);
const ResourceFormDialog = dynamic(
  () =>
    import("@/components/resources/resource-form-dialog").then(
      (module) => module.ResourceFormDialog,
    ),
  { ssr: false },
);

type SortValue = "newest" | "title";
type DirectoryStats = {
  total: number;
  featured: number;
  categories: Record<string, number>;
  automatedCategories: Record<string, number>;
};

const EMPTY_DIRECTORY_STATS: DirectoryStats = {
  total: 0,
  featured: 0,
  categories: {},
  automatedCategories: {},
};

function directoryStatsFrom(resources: ResourceDto[]): DirectoryStats {
  const categories: Record<string, number> = {};
  const automatedCategories: Record<string, number> = {};
  let featured = 0;
  for (const resource of resources) {
    categories[resource.category] = (categories[resource.category] ?? 0) + 1;
    if (resource.origin === "OPENCLAW") {
      automatedCategories[resource.category] =
        (automatedCategories[resource.category] ?? 0) + 1;
    }
    if (resource.isFeatured) featured += 1;
  }
  return { total: resources.length, featured, categories, automatedCategories };
}

const VIEW_OPTIONS: {
  value: ResourceView;
  label: string;
  icon: typeof Columns3;
}[] = [
  { value: "masonry", label: "瀑布流", icon: Columns3 },
  { value: "feed", label: "消息流", icon: List },
];

function isResourceView(value: string | null): value is ResourceView {
  return value === "feed" || value === "masonry";
}

const THREE_COLUMN_QUERY = "(min-width: 768px)";

function subscribeToThreeColumns(onChange: () => void) {
  const query = window.matchMedia(THREE_COLUMN_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getThreeColumnSnapshot() {
  return window.matchMedia(THREE_COLUMN_QUERY).matches;
}

function SkeletonResults({ view }: { view: ResourceView }) {
  if (view === "feed") {
    return (
      <div
        className="border-border my-5 overflow-hidden rounded-2xl border"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="border-border flex items-center gap-4 border-b px-5 py-5 last:border-b-0"
          >
            <Skeleton className="hidden size-11 shrink-0 rounded-full sm:block" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-6 w-3/5 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
            <Skeleton className="size-8 shrink-0 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 py-5 min-[768px]:grid-cols-3"
      aria-hidden="true"
    >
      {[260, 340, 290, 380, 310, 270].map((height, index) => (
        <Skeleton
          key={index}
          className="border-border mb-4 w-full break-inside-avoid rounded-2xl border"
          style={{ height }}
        />
      ))}
    </div>
  );
}

function MasonryResults({
  resources,
  authenticated,
  columns,
  onEdit,
  onDelete,
}: {
  resources: ResourceDto[];
  authenticated: boolean;
  columns: 1 | 3;
  onEdit: (resource: ResourceDto) => void;
  onDelete: (resource: ResourceDto) => void;
}) {
  const [ready, setReady] = useState(false);

  return (
    <MasonryGrid
      className="py-5"
      style={{ visibility: ready ? "visible" : "hidden" }}
      column={columns}
      gap={16}
      align="stretch"
      useResizeObserver
      observeChildren
      onRenderComplete={() => setReady(true)}
    >
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          view="masonry"
          authenticated={authenticated}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </MasonryGrid>
  );
}

function DirectoryNavigation({
  category,
  featured,
  stats,
  onSelect,
}: {
  category: string;
  featured: boolean;
  stats: DirectoryStats;
  onSelect: (selection: { category: string | null; featured: boolean }) => void;
}) {
  const itemClass =
    "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors";

  return (
    <nav aria-label="资源分类目录" className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-2 px-3 font-mono text-[10px] tracking-[0.16em] uppercase">
          浏览
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelect({ category: null, featured: false })}
            aria-current={!category && !featured ? "page" : undefined}
            className={cn(
              itemClass,
              !category && !featured
                ? "bg-foreground text-background font-semibold"
                : "hover:bg-muted",
            )}
          >
            <span>全部资源</span>
            <span className="bg-background/15 min-w-7 rounded-full px-2 py-0.5 text-center font-mono text-xs font-bold tabular-nums">
              {stats.total}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelect({ category: null, featured: true })}
            aria-current={featured ? "page" : undefined}
            className={cn(
              itemClass,
              featured ? "bg-foreground text-background font-semibold" : "hover:bg-muted",
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Star className="size-3.5" aria-hidden="true" />
              精选资源
            </span>
            <span
              className={cn(
                "min-w-7 rounded-full px-2 py-0.5 text-center font-mono text-xs font-bold tabular-nums",
                featured ? "bg-background/15" : "bg-muted text-foreground/75",
              )}
            >
              {stats.featured}
            </span>
          </button>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 px-3 font-mono text-[10px] tracking-[0.16em] uppercase">
          分类目录
        </p>
        <div className="space-y-1">
          {CATEGORY_VALUES.map((item) => {
            const active = !featured && category === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect({ category: item, featured: false })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  itemClass,
                  active
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground/78 hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{item}</span>
                <span className="flex items-center gap-1.5">
                  {(stats.automatedCategories[item] ?? 0) > 0 ? (
                    <span
                      className={cn(
                        "relative inline-flex h-5 shrink-0 self-center items-center gap-1.5 overflow-hidden rounded-full border px-2 text-[10px] font-semibold tracking-[0.02em] shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] transition-colors",
                        active
                          ? "border-background/20 bg-background/12 text-background"
                          : "border-emerald-500/20 bg-gradient-to-r from-emerald-500/14 via-teal-500/10 to-cyan-500/8 text-emerald-800 dark:border-emerald-400/20 dark:text-emerald-200",
                      )}
                      title="由 OpenClaw 自动采集并直接发布"
                      aria-label={`自动采集并发布 ${stats.automatedCategories[item]} 条`}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full shadow-[0_0_0_3px_rgb(16_185_129/0.12)]",
                          active ? "bg-background" : "bg-emerald-500 dark:bg-emerald-300",
                        )}
                      />
                      <span>自动</span>
                      <span className="font-mono tabular-nums opacity-75">
                        {stats.automatedCategories[item]}
                      </span>
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "min-w-7 rounded-full px-2 py-0.5 text-center font-mono text-xs font-bold tabular-nums",
                      active
                        ? "bg-background/15 text-background"
                        : "bg-muted text-foreground/75",
                    )}
                  >
                    {stats.categories[item] ?? 0}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function ResourceBoard() {
  const { authenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [directoryStats, setDirectoryStats] =
    useState<DirectoryStats>(EMPTY_DIRECTORY_STATS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceDto | null>(null);
  const [deleting, setDeleting] = useState<ResourceDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();
  const [deleteError, setDeleteError] = useState("");

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const featured = searchParams.get("featured") === "1";
  const sort: SortValue = searchParams.get("sort") === "title" ? "title" : "newest";
  const rawView = searchParams.get("view");
  const view: ResourceView = isResourceView(rawView) ? rawView : "masonry";
  const useThreeMasonryColumns = useSyncExternalStore(
    subscribeToThreeColumns,
    getThreeColumnSnapshot,
    () => false,
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (featured) params.set("featured", "1");
    if (sort !== "newest") params.set("sort", sort);
    return params.toString();
  }, [q, category, featured, sort]);

  const loadDirectoryStats = useCallback(async () => {
    try {
      setDirectoryStats(directoryStatsFrom(await requestResourceList("")));
    } catch {
      // The resource list keeps its own error state; stale counts are safer than flicker.
    }
  }, []);

  const loadResources = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setLoadError("");
      try {
        const data = await requestResourceList(queryString);
        startTransition(() => {
          setResources(data);
          setLoading(false);
        });
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "资源列表暂时无法加载，请稍后重试。",
        );
        setResources([]);
        setLoading(false);
      }
    },
    [queryString],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const cached = getCachedResourceList(queryString);
      if (cached) {
        startTransition(() => {
          setResources(cached);
          setLoading(false);
        });
      } else {
        setLoading(true);
      }
      setLoadError("");
      try {
        const data = await requestResourceList(queryString);
        if (cancelled) return;
        startTransition(() => {
          setResources(data);
          setLoading(false);
        });
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "资源列表暂时无法加载，请稍后重试。",
          );
          setResources([]);
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      await loadDirectoryStats();
    }
    if (!cancelled) void loadStats();
    return () => {
      cancelled = true;
    };
  }, [loadDirectoryStats]);

  function navigateParams(params: URLSearchParams) {
    const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.pushState(null, "", href);
  }

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    navigateParams(params);
  }

  function selectDirectory(selection: { category: string | null; featured: boolean }) {
    updateParams({
      category: selection.category,
      featured: selection.featured ? "1" : null,
    });
    setDirectoryOpen(false);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    if (view !== "masonry") params.set("view", view);
    navigateParams(params);
  }

  const editResource = useCallback((item: ResourceDto) => {
    setEditing(item);
    setFormError("");
    setFieldErrors(undefined);
    setFormOpen(true);
  }, []);

  async function submitResource(input: ResourceInput) {
    setSubmitting(true);
    setFormError("");
    setFieldErrors(undefined);
    try {
      const response = await fetch(
        editing ? `/api/resources/${editing.id}` : "/api/resources",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) {
        const apiError = await readApiError(response);
        setFormError(apiError.message);
        setFieldErrors(apiError.fields);
        return;
      }
      toast.success(editing ? "资源已更新。" : "资源已新增。");
      setFormOpen(false);
      setEditing(null);
      invalidateResourceListCache();
      await Promise.all([loadResources(), loadDirectoryStats()]);
    } catch {
      setFormError("保存失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSubmitting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/resources/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) {
        const apiError = await readApiError(response);
        setDeleteError(apiError.message);
        return;
      }
      toast.success(`已删除「${deleting.title}」。`);
      setDeleting(null);
      invalidateResourceListCache();
      await Promise.all([loadResources(), loadDirectoryStats()]);
    } catch {
      setDeleteError("删除失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  const hasActiveFilters = Boolean(q || category || featured || sort !== "newest");
  const directoryLabel = featured ? "精选资源" : category || "全部资源";

  return (
    <CanvasEffect className="bg-background h-dvh min-h-0 overflow-hidden">
      <div className="bg-background h-full w-full">
        <div className="relative h-full w-full overflow-hidden px-5 min-[640px]:px-8 min-[1024px]:pr-0">
          <div className="grid h-full items-start min-[1024px]:grid-cols-[220px_minmax(0,1fr)] min-[1024px]:gap-8">
            <aside className="border-border hidden h-full border-r pt-[calc(var(--nav-float-inset)+var(--nav-island-height)+0.15rem)] min-[1024px]:block">
              <div className="h-full overflow-y-auto pr-5">
                <DirectoryNavigation
                  category={category}
                  featured={featured}
                  stats={directoryStats}
                  onSelect={selectDirectory}
                />
              </div>
            </aside>

            <main className="h-full min-w-0 overflow-y-auto">
              <div
                data-testid="resource-toolbar"
                className="border-border -mx-5 border-b px-5 pt-[calc(var(--nav-float-inset)+var(--nav-island-height)+0.15rem)] pb-4 min-[1024px]:mx-0 min-[1024px]:pr-8 min-[1024px]:pl-0 sm:-mx-8 sm:px-8"
              >
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDirectoryOpen(true)}
                    className="shrink-0 min-[1024px]:hidden"
                    aria-label={`打开分类目录，当前为${directoryLabel}`}
                  >
                    <Menu className="size-4" />
                    <span className="hidden sm:inline">分类</span>
                  </Button>

                  <form
                    className="flex min-w-0 flex-1 items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      updateParams({ q: String(formData.get("q") || "").trim() || null });
                    }}
                  >
                    <div className="relative min-w-0 flex-1">
                      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2" />
                      <Input
                        type="search"
                        name="q"
                        key={q}
                        defaultValue={q}
                        placeholder="搜索标题、简介、分类或标签"
                        aria-label="搜索资源"
                        className="h-10 pl-10"
                      />
                    </div>
                    <Button
                      type="submit"
                      aria-label="搜索"
                      className="shrink-0 px-4 sm:px-5"
                    >
                      <Search className="size-4 sm:hidden" />
                      <span className="hidden sm:inline">搜索</span>
                    </Button>
                  </form>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="mr-auto min-w-0">
                    <p className="truncate text-sm font-medium">{directoryLabel}</p>
                    <p
                      className="text-muted-foreground mt-0.5 text-xs"
                      aria-live="polite"
                    >
                      {loading
                        ? "正在整理资源"
                        : loadError
                          ? "加载失败"
                          : `共 ${resources.length} 项`}
                      {q ? ` · 关键词 “${q}”` : ""}
                    </p>
                  </div>

                  <NativeSelect
                    value={sort}
                    onChange={(event) =>
                      updateParams({
                        sort: event.target.value === "newest" ? null : event.target.value,
                      })
                    }
                    aria-label="排序方式"
                    className="w-[132px] sm:w-[150px]"
                  >
                    <NativeSelectOption value="newest">最新添加</NativeSelectOption>
                    <NativeSelectOption value="title">按名称排序</NativeSelectOption>
                  </NativeSelect>

                  <div
                    className="border-border bg-muted/50 flex items-center rounded-xl border p-1"
                    role="group"
                    aria-label="资源展示方式"
                  >
                    {VIEW_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const active = view === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={active ? "default" : "ghost"}
                          size="icon-sm"
                          onClick={() =>
                            updateParams({
                              view: option.value === "masonry" ? null : option.value,
                            })
                          }
                          aria-pressed={active}
                          aria-label={option.label}
                          title={option.label}
                        >
                          <Icon />
                        </Button>
                      );
                    })}
                  </div>

                  {hasActiveFilters ? (
                    <Button
                      type="button"
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="size-3.5" />
                      清除筛选
                    </Button>
                  ) : null}

                  {authenticated ? (
                    <div className="border-border flex flex-wrap items-center gap-2 border-l pl-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setEditing(null);
                          setFormError("");
                          setFieldErrors(undefined);
                          setFormOpen(true);
                        }}
                        size="lg"
                      >
                        新增资源
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="min-[1024px]:pr-8">
                {loading ? (
                  <div aria-live="polite" className="sr-only">
                    正在加载资源
                  </div>
                ) : null}

                {loading ? (
                  <SkeletonResults view={view} />
                ) : loadError ? (
                  <div className="py-24 text-center">
                    <p className="font-display text-xl font-semibold tracking-tight">
                      加载失败
                    </p>
                    <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
                      {loadError}
                    </p>
                    <Button
                      type="button"
                      onClick={() => void loadResources(true)}
                      variant="outline"
                      size="lg"
                      className="mt-6"
                    >
                      重新加载
                    </Button>
                  </div>
                ) : resources.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="font-display text-2xl font-bold tracking-tight">
                      没有结果
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm">
                      试试其他关键词，或清除筛选查看全部资源。
                    </p>
                    {hasActiveFilters ? (
                      <Button
                        type="button"
                        onClick={clearFilters}
                        size="lg"
                        className="mt-6"
                      >
                        清除筛选
                      </Button>
                    ) : null}
                  </div>
                ) : view === "feed" ? (
                  <div className="border-border bg-card my-5 overflow-hidden rounded-2xl border">
                    {resources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        view={view}
                        authenticated={authenticated}
                        onEdit={editResource}
                        onDelete={setDeleting}
                      />
                    ))}
                  </div>
                ) : (
                  <MasonryResults
                    key={`${queryString}:${useThreeMasonryColumns ? "three" : "one"}`}
                    resources={resources}
                    authenticated={authenticated}
                    columns={useThreeMasonryColumns ? 3 : 1}
                    onEdit={editResource}
                    onDelete={setDeleting}
                  />
                )}
              </div>
            </main>
          </div>

          <Sheet open={directoryOpen} onOpenChange={setDirectoryOpen}>
            <SheetContent side="left" className="max-w-[360px] gap-0">
              <SheetHeader className="border-border border-b px-5 py-5">
                <SheetTitle className="font-display text-xl font-semibold">
                  资源目录
                </SheetTitle>
                <SheetDescription>选择分类后将更新右侧资源列表。</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
                <DirectoryNavigation
                  category={category}
                  featured={featured}
                  stats={directoryStats}
                  onSelect={selectDirectory}
                />
              </div>
            </SheetContent>
          </Sheet>

          {formOpen ? (
            <ResourceFormDialog
              key={editing?.id ?? "new"}
              open={formOpen}
              resource={editing}
              submitting={submitting}
              error={formError}
              fieldErrors={fieldErrors}
              onClose={() => {
                setFormOpen(false);
                setEditing(null);
              }}
              onSubmit={submitResource}
            />
          ) : null}
          {deleting ? (
            <DeleteResourceDialog
              resource={deleting}
              submitting={submitting}
              error={deleteError}
              onClose={() => setDeleting(null)}
              onConfirm={confirmDelete}
            />
          ) : null}
        </div>
      </div>
    </CanvasEffect>
  );
}
