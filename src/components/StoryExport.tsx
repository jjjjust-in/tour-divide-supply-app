import { useState } from 'react';
import type { JournalEntry, Town, Note } from '../types';

interface StoryExportProps {
  towns: Town[];
  journalEntries: JournalEntry[];
  notes: Note[];
  onClose: () => void;
}

type ExportFormat = 'markdown' | 'text' | 'json';

export default function StoryExport({ towns, journalEntries, notes, onClose }: StoryExportProps) {
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [copied, setCopied] = useState(false);

  const getTownName = (townId: string) => {
    const town = towns.find(t => t.id === townId);
    return town ? `${town.name}, ${town.state}` : townId;
  };

  const sortedEntries = [...journalEntries].sort((a, b) => a.timestamp - b.timestamp);

  const generateMarkdown = () => {
    const lines: string[] = [
      '# My Tour Divide Journal',
      '',
      `*${sortedEntries.length} journal entries · ${notes.length} route notes*`,
      '',
      '---',
      '',
    ];

    // Group entries by town
    const entriesByTown = sortedEntries.reduce((acc, entry) => {
      const key = entry.townId || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {} as Record<string, JournalEntry[]>);

    Object.entries(entriesByTown).forEach(([townId, townEntries]) => {
      lines.push(`## ${getTownName(townId)}`);
      lines.push('');
      townEntries.forEach(entry => {
        lines.push(`### ${new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`);
        lines.push('');
        lines.push(entry.content);
        lines.push('');
      });

      // Add notes for this town
      const townNotes = notes.filter(n => n.townId === townId);
      if (townNotes.length > 0) {
        lines.push('**Route Notes:**');
        townNotes.forEach(note => {
          lines.push(`- ${note.content}`);
        });
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  };

  const generateText = () => {
    const lines: string[] = [
      'MY TOUR DIVIDE JOURNAL',
      '======================',
      '',
      `${sortedEntries.length} journal entries · ${notes.length} route notes`,
      '',
    ];

    sortedEntries.forEach(entry => {
      lines.push(`[${getTownName(entry.townId || 'unknown')}]`);
      lines.push(new Date(entry.timestamp).toLocaleDateString());
      lines.push('');
      lines.push(entry.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  };

  const generateJson = () => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalEntries: journalEntries.length,
      totalNotes: notes.length,
      journalEntries: sortedEntries.map(e => ({
        ...e,
        townName: getTownName(e.townId || 'unknown'),
        date: new Date(e.timestamp).toISOString(),
      })),
      routeNotes: notes.map(n => ({
        ...n,
        townName: getTownName(n.townId),
        date: new Date(n.timestamp).toISOString(),
      })),
    }, null, 2);
  };

  const getContent = () => {
    switch (format) {
      case 'markdown': return generateMarkdown();
      case 'text': return generateText();
      case 'json': return generateJson();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const content = getContent();
  const lineCount = content.split('\n').length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#febc12]">
        <div>
          <h2 className="font-bold text-base text-[#231F20]">Export Story</h2>
          <p className="text-xs text-[#231F20]/70 mt-0.5">
            {wordCount.toLocaleString()} words · {lineCount} lines
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#231F20]/70 hover:text-[#231F20] text-lg font-light"
        >
          ✕
        </button>
      </div>

      {/* Format selector */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-100">
        {(['markdown', 'text', 'json'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              format === f
                ? 'bg-[#231F20] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button
          onClick={handleCopy}
          className={`ml-auto px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-[#febc12] text-[#231F20] hover:bg-amber-400'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy All'}
        </button>
      </div>

      {/* Content preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
          {content}
        </pre>
      </div>

      {/* Bottom close */}
      <div className="px-4 pb-6 pt-3 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
