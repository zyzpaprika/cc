import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURATION ---
// 1. Check your Render Dashboard for the exact URL. 
// It usually looks like: https://SERVICE-NAME.onrender.com
const API_BASE = "https://codeconnect-api-cfxt.onrender.com"; 
// ---------------------

interface Stats {
  leetcode: number;
  codeforces: number;
  github: number;
}

interface HistoryItem {
  date: string;
  leetcode_count: number;
  codeforces_rating: number;
  github_repos: number;
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching from:", API_BASE); // Debug log

        // 1. Fetch Current Stats (Using Full URL)
        const statsRes = await fetch(`${API_BASE}/stats`);
        if (!statsRes.ok) throw new Error(`Stats API Error: ${statsRes.statusText}`);
        const statsData = await statsRes.json();
        setStats(statsData);

        // 2. Fetch History (Using Full URL)
        const histRes = await fetch(`${API_BASE}/history`);
        if (!histRes.ok) throw new Error(`History API Error: ${histRes.statusText}`);
        const histData = await histRes.json();
        
        // CRITICAL SAFETY CHECK
        if (Array.isArray(histData)) {
           const formatted = histData.map((item: any) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }));
          setHistory(formatted);
        } else {
          console.warn("History data is not an array:", histData);
          setHistory([]);
        }

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="bg-gray-950 min-h-screen text-white flex items-center justify-center text-xl">Loading your legacy...</div>;
  
  if (error) return (
    <div className="bg-gray-950 min-h-screen text-red-400 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
      <p>{error}</p>
      <p className="text-xs text-gray-500 mt-4">Trying to connect to: {API_BASE}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Dev Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="LeetCode" value={stats?.leetcode || 0} color="text-yellow-500" label="Solved" />
          <StatCard title="Codeforces" value={stats?.codeforces || 0} color="text-blue-500" label="Rating" />
          <StatCard title="GitHub" value={stats?.github || 0} color="text-white" label="Repos" />
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg h-96">
          <h2 className="text-xl font-bold mb-4 text-gray-300">Daily Progress</h2>
          
          {history.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} 
                  />
                  <Line type="monotone" dataKey="leetcode_count" stroke="#fbbf24" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
              No history data found yet. (It will appear tomorrow!)
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, color, label }: any) {
  return (
    <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
      <h2 className="text-gray-400 text-sm uppercase tracking-wider">{title}</h2>
      <p className={`text-5xl font-mono mt-2 ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-2">{label}</p>
    </div>
  )
}

export default App