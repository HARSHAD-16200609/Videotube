import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, Share2, Menu, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/services/api.config';
import { useAuthStore } from '@/store/authStore';
import { formatViews, formatTimeAgo } from '@/lib/utils';

export function VideoPlayerPage() {
    const { id } = useParams();
    const [video, setVideo] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (id) {
            loadVideo();
            loadComments();
        }
    }, [id]);

    const loadVideo = async () => {
        try {
            const response: any = await apiService.get(API_ENDPOINTS.GET_VIDEO(id!));
            if (response.data && response.data.length > 0) {
                setVideo(response.data[0]);
            }
        } catch (error) {
            console.error('Failed to load video:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const response: any = await apiService.get(API_ENDPOINTS.GET_COMMENTS(id!));
            setComments(response.data || []);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !isAuthenticated) return;

        try {
            await apiService.post(API_ENDPOINTS.ADD_COMMENT(id!), { content: commentText });
            setCommentText('');
            loadComments();
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) return;
        try {
            await apiService.post(API_ENDPOINTS.TOGGLE_VIDEO_LIKE(id!));
        } catch (error) {
            console.error('Failed to like video:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Video not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                                <VideoIcon className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">StreamVision</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthenticated && user ? (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.username} />
                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <Link to="/login">
                                <Button variant="default" size="sm">Sign In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <div className="pt-14">
                <div className="max-w-[1920px] mx-auto p-6">
                    <div className="lg:flex gap-6">
                        {/* Video Player Section */}
                        <div className="flex-1">
                            {/* Video Player */}
                            <div className="rounded-xl overflow-hidden bg-black mb-4">
                                <video
                                    src={video.videoFile}
                                    controls
                                    className="w-full aspect-video"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Video Info */}
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold mb-3">{video.title}</h1>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={video.avatar} alt={video.username} />
                                                <AvatarFallback>{video.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold">{video.username}</div>
                                                <div className="text-sm text-muted-foreground">Subscribers</div>
                                            </div>
                                        </div>
                                        <Button variant="default">Subscribe</Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" onClick={handleLike}>
                                            <ThumbsUp className="h-5 w-5 mr-2" />
                                            Like
                                        </Button>
                                        <Button variant="secondary">
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Video Description */}
                            <Card className="p-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <span>{formatViews(video.views)}</span>
                                    <span>•</span>
                                    <span>{formatTimeAgo(video.createdAt)}</span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap">{video.description || 'No description'}</div>
                            </Card>

                            {/* Comments Section */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4">{comments.length} Comments</h2>

                                {/* Add Comment */}
                                {isAuthenticated && (
                                    <div className="flex gap-3 mb-6">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user?.avatar} alt={user?.username} />
                                            <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Add a comment..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button variant="ghost" size="sm" onClick={() => setCommentText('')}>
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={handleAddComment}>
                                                    Comment
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment._id} className="flex gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={comment.Commenter?.avatar} alt={comment.Commenter?.username} />
                                                <AvatarFallback>{comment.Commenter?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm">{comment.Commenter?.username}</span>
                                                    <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                                                </div>
                                                <p className="text-sm">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
