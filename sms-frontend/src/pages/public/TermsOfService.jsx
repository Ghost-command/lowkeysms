import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileTextIcon, ArrowLeftIcon } from 'lucide-react'
import PublicLayout from '../../layouts/PublicLayout'

const sections = [
  {
    title: '1. Acceptance & Eligibility',
    content: `By using Lowkey SMS, you agree to these terms. You must be at least 18 years old to use the Service.`,
  },
  {
    title: '2. Service Description',
    content: `Lowkey SMS provides virtual phone numbers for SMS verification on a prepaid wallet basis. Numbers are temporary and provided on an as-available, rotating basis. We do not guarantee the receipt of specific SMS codes.`,
  },
  {
    title: '3. Account & Payments',
    content: `You must provide accurate registration information and keep your credentials confidential.

Payments are handled via a prepaid wallet system.

Deposits are non-refundable unless required by law. Prices are in Nigerian Naira (₦).

We reserve the right to reverse transactions in cases of fraud or system error.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree NOT to use Lowkey SMS for fraud, scams, phishing, spam, harassment, illegal activities, or violating the terms of third-party platforms. Violation may result in immediate termination and forfeiture of your wallet balance.`,
  },
  {
    title: '5. Legal & Liability',
    content: `Intellectual Property: All content and branding are the property of Lowkey SMS.

Disclaimer: The Service is provided "as is" without warranties of any kind.

Limitation of Liability: Our total liability shall not exceed the amount you paid us in the 30 days preceding a claim.

Governing Law: These terms are governed by the laws of the Federal Republic of Nigeria.`,
  },
  {
    title: '6. Termination & Changes',
    content: `We reserve the right to terminate accounts for violations. We may modify these terms at any time by updating the "Last updated" date. For questions, contact legal@lowkeysms.com or https://lowkeysms.com/contact.`,
  },
]

export default function TermsOfService() {
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
                <FileTextIcon size={20} color="#f5c518" />
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
              Terms of <span style={{ color: '#f5c518' }}>Service</span>
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
              Please read these Terms carefully before using Lowkey SMS. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, please do not use our services.
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
              to="/privacy"
              style={{ fontSize: 14, color: '#f5c518', fontWeight: 600, textDecoration: 'none' }}
            >
              Privacy Policy →
            </Link>
          </motion.div>

        </div>
      </div>
    </PublicLayout>
  )
}
