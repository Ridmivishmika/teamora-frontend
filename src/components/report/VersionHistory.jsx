"use client";

import { useEffect, useState } from "react";
import { getReportVersions } from "@/lib/api";

export default function VersionHistory({ reportId }) {
  const [versions, setVersions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadVersions = async () => {
    if (versions.length > 0) {
      setOpen(!open);
      return;
    }
    setLoading(true);
    try {
      const data = await getReportVersions(reportId);
      setVersions(data);
      setOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={loadVersions}
        className="text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-2"
      >
        <span>↺</span>
        Version history {versions.length > 0 ? `(${versions.length})` : ""}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Version History</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-gray-400">No versions yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {versions.map((v) => (
                <div key={v.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">v{v.versionNumber}</span>
                    <span className="text-xs text-gray-400">
                      {v.createdAt ? new Date(v.createdAt).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {v.createdByName || "User"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}