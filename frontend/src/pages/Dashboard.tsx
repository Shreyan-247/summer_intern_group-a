import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, PlayCircle, Loader2 } from "lucide-react";
import API from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { token } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, playlistsRes] = await Promise.all([
          API.get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } }),
          API.get("/api/playlists", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUser(userRes.data);
        setPlaylists(playlistsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const xpForNextLevel = user.current_level * 500;
  const progressPercent = (user.total_xp / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-10">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Welcome back!
            </h1>
            <p className="text-zinc-400 text-lg mt-1">Select a course to continue leveling up.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 shadow-xl hover:border-zinc-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total XP</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-500 drop-shadow-md" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{user.total_xp}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 shadow-xl hover:border-zinc-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Current Level</CardTitle>
              <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">Lvl {user.current_level}</div>
              <Progress value={progressPercent} className="h-2 mt-4 bg-zinc-800" />
              <p className="text-xs text-zinc-500 mt-2 font-medium">{xpForNextLevel - user.total_xp} XP to Level {user.current_level + 1}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 backdrop-blur-md border-zinc-800 shadow-xl hover:border-zinc-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Learning Streak</CardTitle>
              <Flame className="h-5 w-5 text-orange-500 drop-shadow-md" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{user.current_streak} Days</div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6">
          <h2 className="text-2xl font-bold mb-6 text-zinc-100 flex items-center gap-2">
            Available Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {playlists.length === 0 ? (
              <p className="text-zinc-500 col-span-2">No playlists available. Please ingest one first.</p>
            ) : playlists.map((playlist) => (
              <Card key={playlist.id} className="bg-zinc-900/60 border-zinc-800 flex flex-col hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="bg-zinc-800/80 text-blue-400 font-semibold border-none">
                      {playlist.video_count} Videos
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-zinc-100 group-hover:text-blue-400 transition-colors">{playlist.title}</CardTitle>
                  <CardDescription className="text-zinc-400 mt-2 line-clamp-2">{playlist.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <Link to={`/playlist/${playlist.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all">
                      <PlayCircle className="mr-2 h-5 w-5" /> Start Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}