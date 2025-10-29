// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">TaskGlyph</div>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your Personal OS for Focused Work
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          TaskGlyph works 100% offline — on planes, subways, or during internet
          outages. Tasks, Notes, Diary, and Pomodoro in one resilient dashboard.
        </p>
        <Link
          href="/login"
          className="bg-blue-600 text-white text-lg px-8 py-3 rounded hover:bg-blue-700"
        >
          Get Started — Free Forever
        </Link>
      </main>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded p-6">
            <h2 className="text-2xl font-semibold mb-3">Offline-First</h2>
            <p className="text-gray-600">
              Works without internet. All your data stays on your device until
              you choose to sync.
            </p>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <h2 className="text-2xl font-semibold mb-3">No Distractions</h2>
            <p className="text-gray-600">
              No chat, no teams, no noise. Just your work, your way.
            </p>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <h2 className="text-2xl font-semibold mb-3">
              Your Data, Your Rules
            </h2>
            <p className="text-gray-600">
              Export everything anytime. No lock-in. No surveillance.
            </p>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <h2 className="text-2xl font-semibold mb-3">Free Forever</h2>
            <p className="text-gray-600">
              Free plan includes 21 tasks, 14 notes, and unlimited diary
              entries. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} TaskGlyph. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
