import React, { useState } from 'react';

interface SourceCardProps {
  sources: Array<{
    url: string;
    title: string;
    relevance: number;
  }>;
}

export function SourceCards({ sources }: SourceCardProps) {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Add state for custom URL and its checkbox ---
  const [customUrl, setCustomUrl] = useState('');
  const [customUrlChecked, setCustomUrlChecked] = useState(false);

  const handleCheckboxChange = async (url: string, checked: boolean) => {
    if (checked) {
      setSelectedUrls(prev => [...prev, url]);
    } else {
      setSelectedUrls(prev => prev.filter(u => u !== url));
    }
  };

  const handleCardClick = (url: string, event: React.MouseEvent) => {
    // Prevent opening URL when clicking on checkbox
    if ((event.target as HTMLElement).tagName !== 'INPUT') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/get-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: selectedUrls }),
      });
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // --- Add handler for custom URL checkbox ---
  const handleCustomUrlCheckbox = (checked: boolean) => {
    setCustomUrlChecked(checked);
    if (checked && customUrl && !selectedUrls.includes(customUrl)) {
      setSelectedUrls(prev => [...prev, customUrl]);
    } else if (!checked) {
      setSelectedUrls(prev => prev.filter(u => u !== customUrl));
    }
  };

  // --- Add handler for custom URL input change ---
  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If the custom URL was checked, update selectedUrls accordingly
    setCustomUrl(value);
    if (customUrlChecked) {
      setSelectedUrls(prev => {
        // Remove old customUrl, add new one if not present
        const filtered = prev.filter(u => u !== customUrl);
        return value ? [...filtered, value] : filtered;
      });
    }
  };

  return (
    <>
      {/* --- Custom URL input and checkbox --- */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="custom-url-checkbox"
          checked={customUrlChecked}
          onChange={e => handleCustomUrlCheckbox(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={!customUrl}
        />
        <input
          type="text"
          placeholder="Enter custom URL"
          value={customUrl}
          onChange={handleCustomUrlChange}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {customUrlChecked && !/^https?:\/\/.+\..+/.test(customUrl) && (
          <span className="text-xs text-red-500 ml-2">Enter a valid URL</span>
        )}
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {sources.map((source, index) => (
          <div 
            key={`${source.url}-${index}`} 
            className="w-full border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={(e) => handleCardClick(source.url, e)}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id={`source-${index}`}
                checked={selectedUrls.includes(source.url)}
                onChange={(e) => handleCheckboxChange(source.url, e.target.checked)}
                className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <label 
                  htmlFor={`source-${index}`}
                  className="block font-medium text-gray-900 cursor-pointer break-words"
                  title={source.title || new URL(source.url).hostname}
                >
                  {source.title || new URL(source.url).hostname}
                </label>
                <p 
                  className="mt-1 text-sm text-gray-500 break-all"
                  title={source.url}
                >
                  {source.url}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-gray-500">Relevance:</span>
                  <div className="ml-2 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ width: `${Math.min(source.relevance * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
          onClick={handleGenerateReport}
          disabled={selectedUrls.length === 0 || loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {error && <span className="text-red-600">{error}</span>}
      </div>
      {reportData && (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Overall Summaries</h2>
            <div className="space-y-4">
              {Object.entries(reportData).map(([url, entry]: any) => (
                <div
                  key={url}
                  className="border rounded-md p-4 bg-gray-50 shadow w-full"
                >
                  <div className="font-medium text-blue-700 break-words mb-1">{url}</div>
                  <div className="text-gray-800 whitespace-pre-line">
                    {entry.overall_summary || <span className="text-gray-400">No summary available.</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Summary Tables</h2>
            <div className="space-y-4">
              {Object.entries(reportData).map(([url, entry]: any) => (
                <div
                  key={url}
                  className="border rounded-md p-4 bg-gray-50 shadow w-full"
                >
                  <div className="font-medium text-blue-700 break-words mb-1">{url}</div>
                  {entry.summary_table ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: entry.summary_table }}
                    />
                  ) : (
                    <span className="text-gray-400">No summary table available.</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 