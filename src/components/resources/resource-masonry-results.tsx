"use client";

import { useState } from "react";
import { MasonryGrid } from "@egjs/react-grid";
import { ResourceCard } from "@/components/resources/resource-card";
import type { ResourceDto } from "@/lib/resources";

export function ResourceMasonryResults({
  resources,
  authenticated,
  columns,
  onReady,
  onEdit,
  onDelete,
}: {
  resources: ResourceDto[];
  authenticated: boolean;
  columns: 1 | 3;
  onReady: () => void;
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
      onRenderComplete={() => {
        setReady(true);
        onReady();
      }}
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
