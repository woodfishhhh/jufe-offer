"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_VALUES } from "@/data/categories";
import type { ResourceDto } from "@/lib/resources";
import type { ResourceInput } from "@/schemas/resource";

type Props = {
  open: boolean;
  resource?: ResourceDto | null;
  submitting: boolean;
  error: string;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (input: ResourceInput) => Promise<void>;
};

const emptyForm = {
  title: "",
  description: "",
  url: "",
  category: CATEGORY_VALUES[0],
  tags: "",
  isFeatured: false,
};

export function ResourceFormDialog({
  open,
  resource,
  submitting,
  error,
  fieldErrors,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(() =>
    resource
      ? {
          title: resource.title,
          description: resource.description,
          url: resource.url,
          category: resource.category as (typeof CATEGORY_VALUES)[number],
          tags: resource.tags.join("，"),
          isFeatured: resource.isFeatured,
        }
      : emptyForm,
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const tags = form.tags
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    await onSubmit({
      title: form.title,
      description: form.description,
      url: form.url,
      category: form.category,
      tags,
      isFeatured: form.isFeatured,
    });
  }

  return (
    <Modal open={open} title={resource ? "编辑资源" : "新增资源"} onClose={onClose} wide>
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <Field id="resource-title" label="资源名称" error={fieldErrors?.title}>
          <Input
            id="resource-title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="例如：国家大学生就业服务平台"
            aria-invalid={Boolean(fieldErrors?.title)}
          />
        </Field>

        <Field
          id="resource-description"
          label="资源简介"
          error={fieldErrors?.description}
        >
          <Textarea
            id="resource-description"
            rows={4}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="一句话说明用途与亮点"
            aria-invalid={Boolean(fieldErrors?.description)}
          />
        </Field>

        <Field id="resource-url" label="资源链接" error={fieldErrors?.url}>
          <Input
            id="resource-url"
            type="url"
            value={form.url}
            onChange={(event) =>
              setForm((current) => ({ ...current, url: event.target.value }))
            }
            placeholder="https://"
            aria-invalid={Boolean(fieldErrors?.url)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="resource-category" label="分类" error={fieldErrors?.category}>
            <NativeSelect
              id="resource-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as (typeof CATEGORY_VALUES)[number],
                }))
              }
              aria-invalid={Boolean(fieldErrors?.category)}
            >
              {CATEGORY_VALUES.map((category) => (
                <NativeSelectOption key={category} value={category}>
                  {category}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field id="resource-tags" label="标签" error={fieldErrors?.tags}>
            <Input
              id="resource-tags"
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({ ...current, tags: event.target.value }))
              }
              placeholder="例如：算法，面试"
              aria-invalid={Boolean(fieldErrors?.tags)}
            />
          </Field>
        </div>

        <Label className="group/field-label border-border bg-muted/60 flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4">
          <Checkbox
            checked={form.isFeatured}
            onCheckedChange={(checked) =>
              setForm((current) => ({ ...current, isFeatured: Boolean(checked) }))
            }
          />
          <span>标记为精选资源</span>
        </Label>

        {error ? (
          <p className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "保存中…" : "保存"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-muted-foreground text-xs tracking-[0.12em] uppercase"
      >
        {label}
      </Label>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
