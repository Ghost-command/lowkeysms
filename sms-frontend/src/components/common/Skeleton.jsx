import React from 'react'

export function Skeleton({ width = '100%', height = '20px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card flex flex-col gap-3">
      <Skeleton height="24px" width="40%" />
      <Skeleton height="36px" width="70%" />
      <Skeleton height="16px" width="90%" />
    </div>
  )
}

export function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <Skeleton height="20px" width={i === 0 ? '80%' : '50%'} />
        </td>
      ))}
    </tr>
  )
}
