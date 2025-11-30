"use client";

import { ComputerDesktopIcon } from "@heroicons/react/24/outline";

export default function MobileBlocker() {
  return (
    // VISIBILITY LOGIC:
    // block     = Visible by default (Mobile/Tablet)
    // lg:hidden = Hidden on Large screens (Laptops/Desktops 1024px+)
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center p-6 text-center block lg:hidden">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ComputerDesktopIcon className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Desktop Only</h2>

        <p className="text-gray-500 mb-6 leading-relaxed">
          TaskGlyph is designed for focused, deep work and requires a larger
          screen.
          <br />
          <br />
          Please open this link on your <strong>Laptop or Desktop</strong> for
          the best experience.
        </p>

        <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">
          Mobile & Tablet Not Supported
        </div>
      </div>
    </div>
  );
}
