"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { ComponentProps } from "react";

/**
 * Links that record a Vercel Analytics event when clicked.
 *
 * Pageviews say which pages open. These say what a reader does next: writes
 * the email, leaves for LinkedIn or GitHub, or opens a case study from a
 * highlight. Two events, named where they are used:
 *
 *   outbound        { to: "email" | "linkedin" | "github" }
 *   case_study_open { slug, from }
 *
 * track() is a no-op when analytics is off, so nothing here can break a page.
 */
type EventProps = {
  event: string;
  data?: Record<string, string>;
};

export function TrackedAnchor({
  event,
  data,
  onClick,
  ...props
}: ComponentProps<"a"> & EventProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, data);
        onClick?.(e);
      }}
    />
  );
}

export function TrackedLink({
  event,
  data,
  onClick,
  ...props
}: ComponentProps<typeof Link> & EventProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, data);
        onClick?.(e);
      }}
    />
  );
}
