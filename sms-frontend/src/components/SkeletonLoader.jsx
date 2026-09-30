import React from 'react'

export function SkeletonStatCard() {
  return (
    <div className="bg-surface-container-lowest border border-border p-6 rounded-xl animate-pulse space-y-3">
      <div className="h-3 bg-gray-850 rounded w-1/3" />
      <div className="h-8 bg-gray-800 rounded w-1/2" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest border border-border p-6 rounded-xl animate-pulse space-y-4">
      <div className="h-4 bg-gray-850 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
      </div>
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <tr className="animate-pulse border-b border-gray-900">
      <td className="p-4"><div className="h-4 bg-gray-850 rounded w-2/3" /></td>
      <td className="p-4"><div className="h-4 bg-gray-800 rounded w-1/2" /></td>
      <td className="p-4"><div className="h-4 bg-gray-800 rounded w-1/3" /></td>
      <td className="p-4"><div className="h-3 bg-gray-850 rounded w-12" /></td>
      <td className="p-4"><div className="h-4 bg-gray-800 rounded w-10" /></td>
      <td className="p-4"><div className="h-4 bg-gray-850 rounded w-24" /></td>
    </tr>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-surface-container-high/50">
            <th className="p-4"><div className="h-4 bg-gray-800 rounded w-12" /></th>
            <th className="p-4"><div className="h-4 bg-gray-800 rounded w-12" /></th>
            <th className="p-4"><div className="h-4 bg-gray-800 rounded w-12" /></th>
            <th className="p-4"><div className="h-4 bg-gray-800 rounded w-12" /></th>
            <th className="p-4"><div className="h-4 bg-gray-800 rounded w-12" /></th>
            <th className="p-4"><div className="h-4 bg-gray-800 rounded w-12" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <SkeletonTableRow key={idx} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
