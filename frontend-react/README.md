# StreamVision - React Frontend

A modern, YouTube-like video streaming platform built with **React**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

## 🚀 Features

### Core Functionality
- ✅ **Video Feed** - Browse videos with responsive grid layout
- ✅ **Video Player** - Full-featured HTML5 video player
- ✅ **Authentication** - Login/Register with JWT tokens
- ✅ **Comments** - Add and view comments on videos
- ✅ **Likes** - Like videos and comments
- ✅ **Subscriptions** - Subscribe to channels
- ✅ **Search** - Search videos by query
- ✅ **Responsive Design** - Mobile, tablet, and desktop support

### Tech Stack
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

## 📁 Project Structure

```
frontend-react/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── avatar.tsx
│   │   └── VideoCard.tsx    # Custom video card component
│   ├── pages/
│   │   ├── HomePage.tsx     # Home page with video feed
│   │   ├── VideoPlayerPage.tsx  # Video player page
│   │   └── LoginPage.tsx    # Login/Register page
│   ├── services/
│   │   ├── api.config.ts    # API endpoints configuration
│   │   └── api.service.ts   # Axios instance with interceptors
│   ├── store/
│   │   └── authStore.ts     # Zustand auth state management
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Running backend server

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd frontend-react
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   
   Edit `src/services/api.config.ts` and update the base URL:
   ```typescript
   export const API_BASE_URL = 'http://localhost:8000/api/v1';
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 shadcn/ui Components

This project uses shadcn/ui components which are:
- **Accessible** - Built on Radix UI primitives
- **Customizable** - Full control over styling
- **Copy-paste friendly** - Components are in your codebase
- **Type-safe** - Written in TypeScript

### Installed Components
- Button
- Card
- Input
- Avatar

### Adding More Components

To add more shadcn/ui components, you can copy them from [ui.shadcn.com](https://ui.shadcn.com) and paste into `src/components/ui/`.

## 🔌 API Integration

The app integrates with your backend using Axios with automatic token refresh:

### Authentication Flow
1. User logs in → Receives access & refresh tokens
2. Tokens stored in localStorage
3. Access token sent with every request
4. If token expires (401) → Auto-refresh using refresh token
5. If refresh fails → Redirect to login

### API Service Features
- Automatic token injection
- Token refresh on 401 errors
- Request/response interceptors
- Type-safe API calls

## 🎯 State Management

Using **Zustand** for simple, scalable state management:

```typescript
// Example: Using auth store
import { useAuthStore } from '@/store/authStore';

function Component() {
  const { user, login, logout } = useAuthStore();
  
  // Use state and actions
}
```

## 🎨 Styling

### Tailwind CSS
Utility-first CSS framework with custom configuration:

```javascript
// Dark theme colors
--background: 0 0% 6%
--foreground: 0 0% 98%
--primary: 0 100% 50%  // Red
```

### Custom Classes
- `.video-card` - Video card hover effects
- `.duration-badge` - Video duration badge

## 🔒 Authentication

### Login
```typescript
const { login } = useAuthStore();
await login(email, password);
```

### Register
```typescript
const { register } = useAuthStore();
const formData = new FormData();
// ... append data
await register(formData);
```

### Logout
```typescript
const { logout } = useAuthStore();
await logout();
```

## 📱 Responsive Design

Breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚧 Future Enhancements

- [ ] Video upload functionality
- [ ] Channel pages
- [ ] Playlist management
- [ ] Watch history
- [ ] Liked videos page
- [ ] Subscriptions page
- [ ] Advanced search filters
- [ ] Video quality selector
- [ ] Playback speed control
- [ ] Picture-in-picture mode
- [ ] Dark/Light theme toggle
- [ ] Notifications system

## 🐛 Troubleshooting

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Path alias not working
Make sure `tsconfig.app.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### API requests failing
1. Check backend is running
2. Verify API_BASE_URL in `api.config.ts`
3. Check browser console for CORS errors

## 📄 License

This project is part of a learning exercise for building a YouTube-like platform.

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and shadcn/ui**
