"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { FlowingWaves } from "@/components/flowing-waves";
import { DeleteResourceDialog } from "@/components/resources/delete-resource-dialog";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFormDialog } from "@/components/resources/resource-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_VALUES } from "@/data/categories";
import type { ResourceDto } from "@/lib/resources";
import type { ResourceInput } from "@/schemas/resource";
import { cn, readApiError } from "@/lib/utils";

type SortValue = "newest" | "title";

function SkeletonGrid() {
  return (
    <div className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Skeleton key={index} className="border-border h-[230px] rounded-2xl border" />
      ))}
    </div>
  );
}

export function ResourceBoard() {
  const { authenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const sort = (searchParams.get("sort") as SortValue | null) ?? "newest";

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (featured) params.set("featured", "1");
    if (sort && sort !== "newest") params.set("sort", sort);
    return params.toString();
  }, [q, category, featured, sort]);

  const loadResources = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setLoadError("");
      try {
        const response = await fetch(
          `/api/resources${queryString ? `?${queryString}` : ""}`,
          {
            cache: "no-store",
          },
        );
        if (!response.ok) {
          const apiError = await readApiError(response);
          setLoadError(apiError.message);
          setResources([]);
          return;
        }
        const payload = (await response.json()) as { data: ResourceDto[] };
        setResources(payload.data);
      } catch {
        setLoadError("资源列表暂时无法加载，请稍后重试。");
        setResources([]);
      } finally {
        setLoading(false);
      }
    },
    [queryString],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError("");
      try {
        const response = await fetch(
          `/api/resources${queryString ? `?${queryString}` : ""}`,
          {
            cache: "no-store",
          },
        );
        if (cancelled) return;
        if (!response.ok) {
          const apiError = await readApiError(response);
          setLoadError(apiError.message);
          setResources([]);
          return;
        }
        const payload = (await response.json()) as { data: ResourceDto[] };
        setResources(payload.data);
      } catch {
        if (!cancelled) {
          setLoadError("资源列表暂时无法加载，请稍后重试。");
          setResources([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(href, { scroll: false });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

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
      await loadResources();
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
      await loadResources();
    } catch {
      setDeleteError("删除失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  const hasActiveFilters = Boolean(q || category || featured || sort !== "newest");

  return (
    <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
      <div className="absolute inset-x-0 top-0 h-56 overflow-hidden" aria-hidden="true">
        <FlowingWaves className="opacity-60" />
      </div>
      <div className="border-foreground relative flex items-end justify-between gap-4 border-b pt-16 pb-7 sm:pt-24">
        <div className="flex items-end gap-3">
          <div>
            <p className="text-muted-foreground font-mono text-xs tracking-[0.16em] uppercase">
              Resource index
            </p>
            <h1 className="font-display mt-4 text-6xl font-bold tracking-[-0.065em] sm:text-8xl">
              资源<small className="text-5xl">（持续更新）</small>
            </h1>
          </div>
          {!loading && !loadError ? (
            <span className="text-muted-foreground pb-1 text-sm">{resources.length}</span>
          ) : null}
        </div>

        {authenticated ? (
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
        ) : null}
      </div>

      <div className="border-border bg-background/88 sticky top-0 z-20 -mx-5 border-b px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateParams({ q: String(formData.get("q") || "").trim() || null });
          }}
        >
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2" />
            <Input
              type="search"
              name="q"
              key={q}
              defaultValue={q}
              placeholder="搜索资源"
              aria-label="搜索资源"
              className="h-10 pl-10"
            />
          </div>

          <Button type="submit" aria-label="搜索" className="shrink-0 px-5">
            <Search className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">搜索</span>
          </Button>

          <Button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
            aria-controls="resource-filters"
            variant={filtersOpen ? "default" : "outline"}
            className="shrink-0 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            筛选
          </Button>
        </form>

        <div
          id="resource-filters"
          className={cn(
            "mt-3 flex-col gap-2.5 lg:flex lg:flex-row lg:items-center lg:gap-2",
            filtersOpen ? "flex" : "hidden",
          )}
        >
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => updateParams({ featured: null })}
              variant={!featured ? "default" : "outline"}
              className="flex-1 lg:flex-none"
            >
              全部资源
            </Button>
            <Button
              type="button"
              onClick={() => updateParams({ featured: "1" })}
              variant={featured ? "default" : "outline"}
              className="flex-1 lg:flex-none"
            >
              精选资源
            </Button>
          </div>

          <NativeSelect
            value={category}
            onChange={(event) => updateParams({ category: event.target.value || null })}
            aria-label="按分类筛选"
            className="lg:ml-auto lg:w-[220px]"
          >
            <NativeSelectOption value="">全部分类</NativeSelectOption>
            {CATEGORY_VALUES.map((item) => (
              <NativeSelectOption key={item} value={item}>
                {item}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <NativeSelect
            value={sort}
            onChange={(event) =>
              updateParams({
                sort: event.target.value === "newest" ? null : event.target.value,
              })
            }
            aria-label="排序方式"
            className="lg:w-[160px]"
          >
            <NativeSelectOption value="newest">最新添加</NativeSelectOption>
            <NativeSelectOption value="title">按名称排序</NativeSelectOption>
          </NativeSelect>

          {hasActiveFilters ? (
            <Button
              type="button"
              onClick={clearFilters}
              variant="outline"
              className="shrink-0"
            >
              <X className="size-3.5" />
              清除筛选
            </Button>
          ) : null}
        </div>

        {q || category ? (
          <p className="text-muted-foreground mt-2 text-xs lg:mt-1.5">
            {q ? `关键词 “${q}”` : ""}
            {q && category ? " · " : ""}
            {category ? `分类 ${category}` : ""}
          </p>
        ) : null}
      </div>

      <div className="min-h-[320px]">
        {loading ? (
          <div aria-live="polite" className="sr-only">
            正在加载资源
          </div>
        ) : null}

        {loading ? (
          <SkeletonGrid />
        ) : loadError ? (
          <div className="py-20 text-center">
            <p className="font-display text-lg font-semibold tracking-tight">加载失败</p>
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
          <div className="py-20 text-center">
            <p className="font-display text-2xl font-bold tracking-tight">没有结果</p>
            <p className="text-muted-foreground mt-2 text-sm">
              试试其他关键词，或清除筛选查看全部资源。
            </p>
            {hasActiveFilters ? (
              <Button type="button" onClick={clearFilters} size="lg" className="mt-6">
                清除筛选
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                authenticated={authenticated}
                onEdit={(item) => {
                  setEditing(item);
                  setFormError("");
                  setFieldErrors(undefined);
                  setFormOpen(true);
                }}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

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
      <DeleteResourceDialog
        resource={deleting}
        submitting={submitting}
        error={deleteError}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
