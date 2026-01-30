import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ------------------------------------------------------------------
// 🚨 UPDATE THIS URL TO MATCH YOUR RENDER BACKEND EXACTLY 🚨
// It should look like: "https://codeconnect-api.onrender.com"
// Do NOT include a trailing slash (/)
const API_BASE = "https://codeconnect-api-cfxt.onrender.com"; 
// ------------------------------------------------------------------

interface Stats { leetcode: number; codeforces: number; github: number; }
interface HistoryItem { date: string; leetcode_count: number; }

function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Attempting to fetch from:", API_BASE);
        
        // 1. Fetch Current Stats (Direct URL)
        const statsRes = await fetch(`${API_BASE}/stats`);
        if (!statsRes.ok) throw new Error(`Stats Failed: ${statsRes.statusText}`);
        const statsData = await statsRes.json();
        setStats(statsData);

        // 2. Fetch History (Direct URL)
        const histRes = await fetch(`${API_BASE}/history`);
        if (!histRes.ok) throw new Error(`History Failed: ${histRes.statusText}`);
        const histData = await histRes.json();
        
        // Safety Check
        if (Array.isArray(histData)) {
           const formatted = histData.map((item: any) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }));
          setHistory(formatted);
        } else {
          setHistory([]); 
        }

      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="bg-gray-950 min-h-screen text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="bg-gray-950 min-h-screen text-red-400 flex flex-col items-center justify-center"><p>Error: {error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Dev Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="LeetCode" value={stats?.leetcode || 0} color="text-yellow-500" />
          <StatCard title="Codeforces" value={stats?.codeforces || 0} color="text-blue-500" />
          <StatCard title="GitHub" value={stats?.github || 0} color="text-white" />
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-96">
            <h2 className="text-xl font-bold mb-4 text-gray-300">History</h2>
            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={history}>
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827' }} />
                    <Line type="monotone" dataKey="leetcode_count" stroke="#fbbf24" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
      <h2 className="text-gray-400 text-sm uppercase">{title}</h2>
      <p className={`text-5xl font-mono mt-2 ${color}`}>{value}</p>
    </div>
  )
}

export default App