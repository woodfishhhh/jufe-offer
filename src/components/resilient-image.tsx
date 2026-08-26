"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ResilientImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function ResilientImage({
  src,
  fallbackSrc,
  onError,
  alt,
  ...props
}: ResilientImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === src && fallbackSrc ? fallbackSrc : src;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (fallbackSrc && currentSrc !== fallbackSrc) setFailedSrc(src);
      }}
    />
  );
}
