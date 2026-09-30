import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, ShieldCheckIcon } from 'lucide-react'
import PublicLayout from '../../layouts/PublicLayout'

const sections = [
  {
    title: '1. Introduction',
    content: `Welcome to Lowkey SMS. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services. By using Lowkey SMS, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of our services.`,
  },
  {
    title: '2. Information We Collect',
    content: `Information You Provide: Account registration details (username, email address, password), payment/wallet top-up information, and communications with our support team.

Information Collected Automatically: IP address, device information, browser type, operating system, pages visited, features used, time spent on the platform, and transaction history.

Information from Third Parties: Payment processors may share transaction confirmation data; we do not purchase or receive marketing lists from third parties.`,
  },
  {
    title: '3. How We Use Your Information',
    content: `We use information to create/manage your account, process transactions, provide SMS services, send notifications, detect/prevent fraud, improve user experience, and comply with legal obligations.`,
  },
  {
    title: '4. How We Share Your Information',
    content: `We do not sell, trade, or rent personal information. We may share info only with service providers under strict confidentiality, when required by law, to protect the rights/safety of Lowkey SMS or the public, or in connection with a business transfer.`,
  },
  {
    title: '5. Data Retention & Security',
    content: `We retain data as long as your account is active. You may request account deletion at any time. We use industry-standard encryption and security measures, though no internet transmission is 100% secure.`,
  },
  {
    title: '6. Additional Provisions',
    content: `Cookies: Used to maintain sessions and improve experience; can be disabled in browser settings.

Third-Party Links: We are not responsible for the privacy practices of linked third-party sites.

Children's Privacy: Lowkey SMS is for users 18+; we do not knowingly collect data from minors.

Your Rights: Depending on your location, you may have rights to access, correct, delete, port, or object to the processing of your data by contacting privacy@lowkeysms.com.`,
  },
  {
    title: '7. Changes & Contact',
    content: `We may update this policy periodically by posting changes on our platform. For questions, contact us at privacy@lowkeysms.com or https://lowkeysms.com/contact.`,
  },
]

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                color: '#888888',
                textDecoration: 'none',
                marginBottom: 40,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#f5c518'}
              onMouseLeave={e => e.currentTarget.style.color = '#888888'}
            >
              <ArrowLeftIcon size={14} />
              Back to Home
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: 56 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40,
                height: 40,
                background: 'rgba(245, 197, 24, 0.1)',
                border: '1px solid rgba(245, 197, 24, 0.2)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShieldCheckIcon size={20} color="#f5c518" />
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#f5c518',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Legal
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Privacy <span style={{ color: '#f5c518' }}>Policy</span>
            </h1>
            <p style={{ fontSize: 15, color: '#666666', lineHeight: 1.6 }}>
              Last updated: June 2026
            </p>
            <div style={{
              marginTop: 20,
              padding: '14px 20px',
              background: 'rgba(245, 197, 24, 0.05)',
              border: '1px solid rgba(245, 197, 24, 0.15)',
              borderRadius: 10,
              fontSize: 14,
              color: '#a0a0a0',
              lineHeight: 1.6,
            }}>
              This document describes how Lowkey SMS collects, uses, and protects your personal information. By using our platform, you agree to the practices described in this policy.
            </div>
          </motion.div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
              >
                <h2 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#f5c518',
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: '1px solid rgba(245, 197, 24, 0.1)',
                }}>
                  {section.title}
                </h2>
                <div style={{
                  fontSize: 15,
                  color: '#aaaaaa',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}>
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              marginTop: 64,
              paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <p style={{ fontSize: 13, color: '#555555' }}>
              © {new Date().getFullYear()} Lowkey SMS. All rights reserved.
            </p>
            <Link
              to="/terms"
              style={{ fontSize: 14, color: '#f5c518', fontWeight: 600, textDecoration: 'none' }}
            >
              Terms of Service →
            </Link>
          </motion.div>

        </div>
      </div>
    </PublicLayout>
  )
}
