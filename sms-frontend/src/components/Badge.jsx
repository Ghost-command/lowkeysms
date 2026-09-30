import { getStatusColor } from '../utils/helpers'

export default function Badge({ status, children, className = '' }) {
  const colorClass = status ? getStatusColor(status) : ''
  return (
    <span className={`badge ${colorClass} ${className}`}>
      {children || status}
    </span>
  )
}
