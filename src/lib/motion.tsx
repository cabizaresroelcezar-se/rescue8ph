"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type MotionProps = React.HTMLAttributes<HTMLDivElement> & {
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  style,
  ...rest
}: MotionProps) {
  const MotionTag = Tag as React.ElementType;
  return (
    <MotionTag
      className={cn("animate-fade-up", className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export function FadeInOnly({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  style,
  ...rest
}: MotionProps) {
  const MotionTag = Tag as React.ElementType;
  return (
    <MotionTag
      className={cn("animate-fade-in", className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  style,
  ...rest
}: MotionProps) {
  const MotionTag = Tag as React.ElementType;
  return (
    <MotionTag
      className={cn("animate-scale-in", className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export function Stagger({
  children,
  className,
  as: Tag = "div",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const MotionTag = Tag as React.ElementType;
  return (
    <MotionTag className={cn("stagger", className)} {...rest}>
      {children}
    </MotionTag>
  );
}

export function Pressable({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("hover-lift press-shrink", className)} {...rest}>
      {children}
    </div>
  );
}
