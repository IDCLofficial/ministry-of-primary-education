import type { Metadata } from 'next'
import Image from 'next/image'
import { publicMetadata } from '@/lib/metadata'

export const metadata: Metadata = publicMetadata.privacy

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-green-50 pt-36 pb-20 px-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                        <Image src="/images/IMSG-Logo.svg" alt="Imo State Logo" width={48} height={48} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-3 text-sm text-gray-500">
                        Last updated: 1 June 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 sm:p-12">
                    <Section title="Introduction">
                        <p>
                            The Imo State Ministry of Primary and Secondary Education (&ldquo;Ministry,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting the privacy of all visitors to our website (<strong>education.im.gov.ng</strong>) and users of our student portal, exam portal, and related digital services.
                        </p>
                        <p>
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you access or use our website and services. By using our platform, you agree to the practices described in this policy.
                        </p>
                    </Section>

                    <Section title="Information We Collect">
                        <p>We may collect the following categories of personal information:</p>
                        <ul>
                            <li><strong>Personal Identification Information:</strong> Full name, date of birth, examination number, and school affiliation.</li>
                            <li><strong>Contact Information:</strong> Email address and phone number when provided through contact forms or newsletter subscriptions.</li>
                            <li><strong>Payment Information:</strong> Payment transaction records for result-checking and certificate downloads (we do not store full card numbers or banking credentials).</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage patterns collected through cookies and analytics tools.</li>
                        </ul>
                    </Section>

                    <Section title="How We Use Your Information">
                        <p>Your data is used solely for legitimate educational and administrative purposes, including:</p>
                        <ul>
                            <li>Processing and displaying examination results.</li>
                            <li>Facilitating certificate downloads and verification.</li>
                            <li>Managing payment transactions for result-checking services.</li>
                            <li>Responding to inquiries submitted through our contact forms.</li>
                            <li>Sending newsletter updates (only with your explicit consent).</li>
                            <li>Improving our website and services through aggregated analytics.</li>
                            <li>Complying with legal and regulatory obligations.</li>
                        </ul>
                    </Section>

                    <Section title="Data Sharing and Disclosure">
                        <p>
                            We do not sell, trade, or rent your personal data to third parties. We may share your information only in the following circumstances:
                        </p>
                        <ul>
                            <li><strong>With authorised schools and examination bodies</strong> for the purpose of result verification and academic administration.</li>
                            <li><strong>With payment processors</strong> to facilitate secure transactions (e.g., Paystack, Flutterwave).</li>
                            <li><strong>When required by law</strong> — to comply with a legal obligation, court order, or government request.</li>
                            <li><strong>With your consent</strong> — for any other purpose you have explicitly authorised.</li>
                        </ul>
                    </Section>

                    <Section title="Data Security">
                        <p>
                            We implement industry-standard security measures to protect your personal data, including:
                        </p>
                        <ul>
                            <li>SSL/TLS encryption for all data transmitted between your browser and our servers.</li>
                            <li>Secure, role-based access controls for all systems storing personal data.</li>
                            <li>Regular security audits and vulnerability assessments.</li>
                            <li>Strict internal policies governing data access and processing.</li>
                        </ul>
                        <p>
                            However, no method of electronic storage or transmission is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                        </p>
                    </Section>

                    <Section title="Cookies and Tracking">
                        <p>
                            We use essential cookies to ensure the proper functioning of our website and services. These cookies do not track your activity across third-party sites. We may also use anonymised analytics cookies to understand how visitors interact with our site and improve user experience.
                        </p>
                        <p>
                            You can control or disable cookies through your browser settings. Please note that blocking essential cookies may affect the functionality of certain services, including result checking and payment processing.
                        </p>
                    </Section>

                    <Section title="Data Retention">
                        <p>
                            We retain your personal data only as long as necessary to fulfil the purposes described in this policy, or as required by applicable laws and regulations. Examination records and related data are retained in accordance with the Imo State Ministry of Education&rsquo;s record-keeping policies.
                        </p>
                        <p>
                            When data is no longer required, it is securely deleted or anonymised.
                        </p>
                    </Section>

                    <Section title="Your Rights">
                        <p>Subject to applicable law, you have the right to:</p>
                        <ul>
                            <li><strong>Access</strong> the personal data we hold about you.</li>
                            <li><strong>Correct</strong> any inaccurate or incomplete data.</li>
                            <li><strong>Request deletion</strong> of your personal data, subject to legal retention obligations.</li>
                            <li><strong>Withdraw consent</strong> for newsletter subscriptions or other consent-based processing at any time.</li>
                            <li><strong>Object to</strong> processing of your data for direct marketing purposes.</li>
                        </ul>
                        <p>
                            To exercise any of these rights, please contact us using the details below.
                        </p>
                    </Section>

                    <Section title="Third-Party Links">
                        <p>
                            Our website may contain links to third-party websites, including payment gateways and partner portals. We are not responsible for the privacy practices of those sites. We encourage you to review the privacy policies of any third-party services you use.
                        </p>
                    </Section>

                    <Section title="Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or technological developments. Changes will be posted on this page with an updated revision date. We encourage you to review this page periodically.
                        </p>
                    </Section>

                    <Section title="Contact Us">
                        <p>
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us:
                        </p>
                        <div className="mt-4 rounded-xl bg-green-50 p-5 text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">Imo State Ministry of Primary and Secondary Education</p>
                            <p>Block 3, Second Floor, Imo State Secretariat,</p>
                            <p>Port Harcourt Road, Owerri, Imo State, Nigeria</p>
                            <p className="mt-2">
                                <strong>Phone:</strong> +234 809 547 6304
                            </p>
                            <p>
                                <strong>Email:</strong> privacy@education.im.gov.ng
                            </p>
                        </div>
                    </Section>
                </div>
            </div>
        </main>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {title}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                {children}
            </div>
        </section>
    )
}
