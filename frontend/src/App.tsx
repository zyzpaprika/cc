import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [history, setHistory] = useState<HistoryItem[]>([]); // New State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Current Stats
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));

    // 2. Fetch History
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        // Format date to look nice (e.g., "Jan 27")
        const formatted = data.map((item: any) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
        setHistory(formatted);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="bg-gray-950 min-h-screen text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            CodeConnect
          </h1>
          <p className="text-gray-400">Tracking daily consistency</p>
        </div>

        {/* The Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="LeetCode" value={stats?.leetcode} color="text-yellow-500" label="Solved" />
          <StatCard title="Codeforces" value={stats?.codeforces} color="text-blue-500" label="Rating" />
          <StatCard title="GitHub" value={stats?.github} color="text-white" label="Repos" />
        </div>

        {/* The History Graph */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-300">LeetCode Progress</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} 
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Line type="monotone" dataKey="leetcode_count" stroke="#fbbf24" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}

// Simple Helper Component to clean up code
function StatCard({ title, value, color, label }: any) {
  return (
    <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all">
      <h2 className="text-gray-400 text-sm uppercase tracking-wider">{title}</h2>
      <p className={`text-5xl font-mono mt-2 ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-2">{label}</p>
    </div>
  )
}

export default App