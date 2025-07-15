import * as React from "react"

export function Skeleton({
  className,
  style,
  ...props
}: {
  className?: string
  style?: React.CSSProperties
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={"animate-pulse bg-muted rounded-xl " + (className || "")}
      style={{ borderRadius: "0.75rem", ...style }}
      {...props}
    />
  )
}
