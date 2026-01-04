import LandingNavbar from '@/components/LandingNavbar';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-ruby-500/30">
            <LandingNavbar />

            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>

                <div className="space-y-8 text-gray-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl text-white font-medium mb-4">1. Data Collection</h2>
                        <p>
                            We only collect the personal information you voluntarily provide to us, which includes:
                            Email address, Username, and Password (hashed). We do not store credit card details; all payments are processed through secure third-party gateways.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-medium mb-4">2. Use of Information</h2>
                        <p>
                            We use your information to:
                            Processing your orders.
                            Sending you order updates.
                            Providing customer support.
                            Analyzing usage to improve our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-medium mb-4">3. Cookies</h2>
                        <p>
                            We use cookies only to store your session information for your convenience (keeping you logged in).
                        </p>
                    </section>
                </div>
            </div>

            <footer className="border-t border-white/5 py-12 px-6 bg-black text-center text-gray-600 text-xs">
                © 2026 BalkanSMM. All Rights Reserved.
            </footer>
        </main>
    );
}
