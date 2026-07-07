import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, PlayCircle, ArrowLeft, Loader2 } from "lucide-react";
import API from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function CoursePlayer() {
  const { id } = useParams();
  const { token } = useAuth();
  
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await API.get(`/api/playlists/${id}/videos`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const data = res.data;
        setVideos(data);
        if (data.length > 0) {
          setActiveVideo(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch videos", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchVideos();
  }, [id, token]);

  const handleMarkComplete = async () => {
    if (!activeVideo) return;
    setCompleting(true);
    try {
      await API.post(`/api/progress/complete-video/${activeVideo.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state to reflect completion
      setVideos(videos.map(v => v.id === activeVideo.id ? { ...v, is_completed: true } : v));
      setActiveVideo({ ...activeVideo, is_completed: true });
    } catch (err) {
      console.error("Failed to mark video as complete", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!videos.length || !activeVideo) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <p className="mb-4 text-lg">No videos found for this playlist.</p>
        <Link to="/dashboard">
          <Button variant="outline" className="border-zinc-700 text-zinc-300">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto p-4 md:p-6 h-full md:h-[calc(100vh-2rem)] flex flex-col">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 p-2 -ml-2 rounded-lg transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
          <div className="flex-1 flex flex-col gap-6">
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800/50 ring-1 ring-white/10">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeVideo.yt_video_id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/60 backdrop-blur-md p-6 rounded-xl border border-zinc-800 shadow-xl">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">{activeVideo.title}</h2>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-semibold">
                  +{activeVideo.xp_reward} XP
                </Badge>
              </div>
              <Button 
                onClick={handleMarkComplete}
                disabled={activeVideo.is_completed || completing}
                className={`transition-all duration-300 shadow-lg ${
                  activeVideo.is_completed 
                    ? "bg-green-500/10 text-green-500 border border-green-500/20 opacity-100" 
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {completing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className={`mr-2 h-5 w-5 ${activeVideo.is_completed ? "text-green-500" : ""}`} /> 
                )}
                {activeVideo.is_completed ? "Completed" : "Mark as Complete"}
              </Button>
            </div>
          </div>

          <Card className="w-full lg:w-96 bg-zinc-900/60 backdrop-blur-md border-zinc-800 shadow-2xl flex flex-col overflow-hidden rounded-xl">
            <div className="p-5 border-b border-zinc-800 bg-zinc-950/80">
              <h3 className="text-lg font-bold text-zinc-100">Course Contents</h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">{videos.length} videos</p>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`w-full text-left p-3 rounded-lg flex gap-4 transition-all duration-200 border ${
                    activeVideo.id === video.id 
                      ? "bg-blue-600/10 border-blue-500/30 text-blue-50" 
                      : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {video.is_completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    ) : (
                      <PlayCircle className={`h-5 w-5 ${activeVideo.id === video.id ? "text-blue-400" : "opacity-50"}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold text-sm line-clamp-2 leading-tight ${activeVideo.id === video.id ? "text-blue-100" : ""}`}>
                      {index + 1}. {video.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}