import LandingNavbar from '@/components/LandingNavbar';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-ruby-500/30">
            <LandingNavbar />

            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>

                <div className="space-y-8 text-gray-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl text-white font-medium mb-4">1. General</h2>
                        <p>
                            By placing an order with BalkanSMM, you automatically accept all the below-listed terms of service whether you read them or not.
                            We reserve the right to change these terms of service without notice. You are expected to read all terms of service before placing any order to insure you are up to date with any changes or written future changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-medium mb-4">2. Service</h2>
                        <p>
                            BalkanSMM is not affiliated with Instagram, Facebook, Twitter, YouTube or any Instagram third-party partners in any way.
                            It is your sole responsibility to comply with Instagram rules and any legislation that you are subject to. You use BalkanSMM at your own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-medium mb-4">3. Refund Policy</h2>
                        <p>
                            No refunds will be made to your payment method. After a deposit has been completed, there is no way to reverse it. You must use your balance on orders from BalkanSMM.
                            If you file a dispute or charge-back against us after a deposit, we reserve the right to terminate all future orders, ban you from our site.
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
