export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
    // Auth
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refaccessToken',
    CURRENT_USER: '/users/getCurrentUser',

    // Videos
    GET_VIDEOS: '/videos',
    GET_VIDEO: (id: string) => `/videos/${id}`,
    PUBLISH_VIDEO: '/videos',
    UPDATE_VIDEO: (id: string) => `/videos/${id}`,
    DELETE_VIDEO: (id: string) => `/videos/${id}`,

    // Comments
    GET_COMMENTS: (videoId: string) => `/comments/${videoId}`,
    ADD_COMMENT: (videoId: string) => `/comments/${videoId}`,
    UPDATE_COMMENT: (commentId: string) => `/comments/c/${commentId}`,
    DELETE_COMMENT: (commentId: string) => `/comments/c/${commentId}`,

    // Likes
    TOGGLE_VIDEO_LIKE: (videoId: string) => `/likes/toggle/v/${videoId}`,
    TOGGLE_COMMENT_LIKE: (commentId: string) => `/likes/toggle/c/${commentId}`,
    GET_LIKED_VIDEOS: '/likes/videos',

    // Subscriptions
    TOGGLE_SUBSCRIPTION: (channelId: string) => `/subscriptions/c/${channelId}`,
    GET_SUBSCRIBERS: (channelId: string) => `/subscriptions/c/${channelId}`,
    GET_SUBSCRIBED_CHANNELS: (subscriberId: string) => `/subscriptions/u/${subscriberId}`,

    // Playlists
    CREATE_PLAYLIST: '/playlist',
    GET_USER_PLAYLISTS: (userId: string) => `/playlist/user/${userId}`,
    GET_PLAYLIST: (playlistId: string) => `/playlist/${playlistId}`,
    ADD_TO_PLAYLIST: (videoId: string, playlistId: string) => `/playlist/add/${videoId}/${playlistId}`,
    REMOVE_FROM_PLAYLIST: (videoId: string, playlistId: string) => `/playlist/remove/${videoId}/${playlistId}`,

    // User
    GET_CHANNEL: (username: string) => `/users/c/${username}`,
    WATCH_HISTORY: '/users/getWatchHistory',
};
