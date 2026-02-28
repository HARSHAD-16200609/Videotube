import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAuthStore();

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register form state
    const [registerData, setRegisterData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(loginEmail, loginPassword);
            navigate('/');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!avatar || !coverImage) {
            alert('Please upload avatar and cover image');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('fullName', registerData.fullName);
            formData.append('username', registerData.username);
            formData.append('email', registerData.email);
            formData.append('password', registerData.password);
            formData.append('avatar', avatar);
            formData.append('coverImage', coverImage);

            await register(formData);
            alert('Registration successful! Please login.');
            setIsLogin(true);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center">
                            <Video className="w-7 h-7" />
                        </div>
                        <span className="text-3xl font-bold">StreamVision</span>
                    </div>
                    <p className="text-muted-foreground">
                        {isLogin ? 'Sign in to continue' : 'Create your account'}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
                        <CardDescription>
                            {isLogin ? 'Enter your credentials to access your account' : 'Fill in your details to get started'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLogin ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name</label>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={registerData.fullName}
                                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Username</label>
                                    <Input
                                        type="text"
                                        placeholder="johndoe"
                                        value={registerData.username}
                                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Avatar</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cover Image</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>
                        )}

                        <p className="text-center text-muted-foreground mt-6">
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-primary hover:underline font-semibold"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                        Continue as Guest →
                    </Link>
                </div>
            </div>
        </div>
    );
}
