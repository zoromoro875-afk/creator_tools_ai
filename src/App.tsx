import React, { useState } from 'react';
import { analyzeTranscriptWithGemini, AnalysisResult } from './geminiService';
import { Video, Sparkles, Clock, Flame, Copy, Check } from 'lucide-react';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setError('Please enter or paste the video transcript with timestamps.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await analyzeTranscriptWithGemini(transcript, apiKey);
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze transcript. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (caption: string, hashtags: string[], index: number) => {
    const fullText = `${caption}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" /> AI Long-to-Shorts Converter
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Turn Videos into Viral Shorts
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Extract high-retention clips, timestamps, captions, and viral scores in seconds using Gemini AI.
          </p>
        </header>

        {/* Form Box */}
        <form onSubmit={handleAnalyze} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Gemini API Key <span className="text-slate-500">(Optional if set in environment)</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Video Transcript & Timestamps *
            </label>
            <textarea
              rows={6}
              placeholder="Paste transcript here... Example:
00:10 Welcome to the video!
01:15 Here is the secret strategy to scaling your app...
02:30 Conclusion and final thoughts."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Transcript...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Extract Viral Clips
              </>
            )}
          </button>
        </form>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
              <Video className="w-6 h-6 text-indigo-400" /> Detected Clips ({results.clips.length})
            </h2>

            <div className="grid gap-6">
              {results.clips.map((clip, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="font-semibold text-lg text-indigo-300">{clip.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {clip.startTime} - {clip.endTime} ({clip.durationSeconds}s)
                      </span>
                      <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md font-semibold">
                        <Flame className="w-3.5 h-3.5" /> {clip.viralityScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    <strong className="text-slate-300">Why it works:</strong> {clip.reasoning}
                  </p>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-300 space-y-2">
                    <p className="font-mono text-xs text-slate-500">Suggested Caption & Hashtags:</p>
                    <p>{clip.suggestedCaption}</p>
                    <div className="text-indigo-400 text-xs font-mono">{clip.hashtags.join(' ')}</div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => copyCaption(clip.suggestedCaption, clip.hashtags, index)}
                      className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy Caption
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
