import React from 'react'

export const Logo = () => (
  <svg width="140" height="52" viewBox="0 0 280 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="104" rx="14" fill="#111111"/>
    <polygon points="0,0 40,0 0,40" fill="#F5C518"/>
    {/* hexagon ring */}
    <polygon points="36,52 51,43 51,61" fill="none" stroke="#F5C518" strokeWidth="2"/>
    <polygon points="22,52 36,43 36,61 22,61 22,43" fill="none" stroke="#F5C518" strokeWidth="2"/>
    {/* bolt */}
    <polygon points="36,38 28,54 33,54 27,68 40,52 35,52 43,38" fill="#F5C518"/>
    {/* wordmark */}
    <text x="62" y="48" fontFamily="'Inter','Arial Black',sans-serif" fontWeight="700" fontSize="22" fill="#ffffff" letterSpacing="-0.5">Lowkey</text>
    <text x="64" y="72" fontFamily="'Inter','Arial Black',sans-serif" fontWeight="700" fontSize="14" fill="#F5C518" letterSpacing="4">SMS</text>
  </svg>
)
