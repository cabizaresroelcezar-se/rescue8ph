"use client";

export function WaybillPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      Print Waybill
    </button>
  );
}