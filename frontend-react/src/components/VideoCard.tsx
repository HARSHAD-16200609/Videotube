import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDuration, formatViews, formatTimeAgo } from '@/lib/utils';

interface VideoCardProps {
    video: {
        _id: string;
        title: string;
        thumbnail: string;
        duration: number;
        views: number;
        createdAt: string;
        username?: string;
        avatar?: string;
    };
}

export function VideoCard({ video }: VideoCardProps) {
    return (
        <Link to={`/video/${video._id}`} className="video-card block">
            <Card className="overflow-hidden border-0 bg-transparent shadow-none">
                <div className="relative mb-3 rounded-xl overflow-hidden bg-muted">
                    <img
                        src={video.thumbnail || 'https://via.placeholder.com/320x180?text=No+Thumbnail'}
                        alt={video.title}
                        className="w-full aspect-video object-cover"
                        onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                        }}
                    />
                    <span className="duration-badge">
                        {formatDuration(video.duration)}
                    </span>
                </div>
                <div className="flex gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={video.avatar} alt={video.username} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                            {video.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-1 hover:text-foreground/80 transition-colors">
                            {video.title}
                        </h3>
                        <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {video.username || 'Unknown Channel'}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>{formatViews(video.views)}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
