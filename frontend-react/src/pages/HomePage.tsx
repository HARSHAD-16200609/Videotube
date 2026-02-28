import { useState, useEffect } from 'react';
import { Search, Menu, Video, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoCard } from '@/components/VideoCard';
import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/services/api.config';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

export function HomePage() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Upload state
    const [videoTitle, setVideoTitle] = useState('');
    const [videoDesc, setVideoDesc] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const { user, isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async (query = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: '1',
                limit: '12',
                sortBy: 'createdAt',
                sortType: 'desc',
                ...(query && { query }),
            });

            const response: any = await apiService.get(`${API_ENDPOINTS.GET_VIDEOS}?${params}`);
            // Handle different response structures gracefully
            const videosList = response.data?.docs || response.docs || response.data || [];
            if (Array.isArray(videosList)) {
                setVideos(videosList);
            } else {
                setVideos([]);
            }
        } catch (error: any) {
            console.error('Failed to load videos:', error);
            if (error?.response?.status === 401) {
                setVideos([]);
            } else {
                setVideos([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadVideos(searchQuery);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile || !thumbnailFile || !videoTitle) {
            alert("Please fill all required fields");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('title', videoTitle);
            formData.append('description', videoDesc);
            formData.append('videoFile', videoFile);
            formData.append('thumbnail', thumbnailFile);

            await apiService.post(API_ENDPOINTS.PUBLISH_VIDEO, formData);

            setShowUploadModal(false);
            setVideoTitle('');
            setVideoDesc('');
            setVideoFile(null);
            setThumbnailFile(null);
            alert('Video uploaded successfully!');
            loadVideos(); // Refresh list
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setShowProfileMenu(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                    placeholder="Video title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={videoDesc}
                                    onChange={(e) => setVideoDesc(e.target.value)}
                                    placeholder="Video description"
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Video File</label>
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Thumbnail</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Publish Video'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
                <div className="flex items-center justify-between px-4 py-2">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                                <Video className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold hidden sm:inline">StreamVision</span>
                        </Link>
                    </div>

                    {/* Center Section - Search */}
                    <div className="flex-1 max-w-2xl mx-4">
                        <div className="flex items-center">
                            <Input
                                type="text"
                                placeholder="Search videos, creators, or topics"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="rounded-r-none border-r-0"
                            />
                            <Button
                                onClick={handleSearch}
                                variant="secondary"
                                className="rounded-l-none"
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => isAuthenticated ? setShowUploadModal(true) : alert("Please login to upload")}
                        >
                            <Video className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Bell className="h-6 w-6" />
                        </Button>

                        {isAuthenticated && user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="focus:outline-none"
                                >
                                    <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary transition-all">
                                        <AvatarImage src={user.avatar} alt={user.username} />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                                            {user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 top-10 w-64 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                                        <div className="px-4 py-3 border-b border-border">
                                            <p className="text-sm font-semibold">{user.fullName}</p>
                                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                                                <User className="h-4 w-4" /> Your Channel
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                                                <Settings className="h-4 w-4" /> Settings
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50/10 flex items-center gap-2"
                                            >
                                                <LogOut className="h-4 w-4" /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button variant="default" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Container */}
            <div className="flex pt-14">
                {/* Sidebar */}
                {sidebarOpen && (
                    <aside className="fixed left-0 top-14 bottom-0 w-64 bg-background border-r border-border overflow-y-auto z-40">
                        <div className="py-2 px-3">
                            <Link to="/">
                                <Button variant="secondary" className="w-full justify-start mb-2">
                                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                    </svg>
                                    Home
                                </Button>
                            </Link>
                            <Link to="/subscriptions">
                                <Button variant="ghost" className="w-full justify-start mb-2">
                                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 7H4V6h16v1zm2 2v12H2V9h20zm-2 10V11H4v8h16zm-9-7v6l5-3-5-3z" />
                                    </svg>
                                    Subscriptions
                                </Button>
                            </Link>
                            <div className="border-t border-border my-2"></div>
                            <div className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Library
                            </div>
                            <Link to="/history">
                                <Button variant="ghost" className="w-full justify-start mb-2">
                                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                    </svg>
                                    History
                                </Button>
                            </Link>
                            <Link to="/liked">
                                <Button variant="ghost" className="w-full justify-start mb-2">
                                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                                    </svg>
                                    Liked Videos
                                </Button>
                            </Link>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
                    {/* Filter Chips */}
                    <div className="sticky top-14 bg-background border-b border-border px-6 py-3 overflow-x-auto z-30">
                        <div className="flex gap-3 min-w-max">
                            <Button variant="secondary" size="sm">All</Button>
                            <Button variant="ghost" size="sm">Music</Button>
                            <Button variant="ghost" size="sm">Gaming</Button>
                            <Button variant="ghost" size="sm">News</Button>
                            <Button variant="ghost" size="sm">Live</Button>
                            <Button variant="ghost" size="sm">Sports</Button>
                            <Button variant="ghost" size="sm">Learning</Button>
                        </div>
                    </div>

                    {/* Video Grid */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : videos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {videos.map((video) => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Video className="w-24 h-24 mb-4" />
                                <p className="text-xl">No videos found</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
