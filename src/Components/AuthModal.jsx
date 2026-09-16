import { useState } from "react";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";
import { API, cn } from "../lib/utils";
import { pushToast } from "../lib/toast";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let url = `${API}/api/auth/login`;
            let body;
            let headers = {};

            if (isLogin) {
                // FastAPI Login butuh format URL Encoded (Form Data)
                body = new URLSearchParams();
                body.append("username", formData.username);
                body.append("password", formData.password);
                headers = { "Content-Type": "application/x-www-form-urlencoded" };
            } else {
                // Register butuh format JSON biasa
                url = `${API}/api/auth/register`;
                body = JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                });
                headers = { "Content-Type": "application/json" };
            }

            const res = await fetch(url, { method: "POST", headers, body });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Terjadi kesalahan!");
            }

            // Jika berhasil, simpan token ke LocalStorage
            localStorage.setItem("algmusic_token", data.access_token);
            pushToast(isLogin ? "Welcome back!" : "Account created successfully!", { type: "success" });
            onSuccess(data.access_token);
            onClose();
        } catch (err) {
            pushToast(err.message, { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
            <div className="glass relative w-full max-w-md animate-scale-in overflow-hidden rounded-[32px] p-8 shadow-2xl">

                {/* Dekorasi Background */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--accent-2)]/20 blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                    <X size={18} />
                </button>

                <h2 className="font-display text-3xl font-extrabold text-[var(--text)]">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="mt-2 text-sm text-white/60">
                    {isLogin ? "Log in to sync your premium sound space." : "Sign up to start saving your favorite music."}
                </p>

                <form onSubmit={handleSubmit} className="relative z-10 mt-8 space-y-4">
                    <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            required
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full rounded-2xl border border-[var(--border)] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[var(--accent)]/60 focus:bg-white/[0.07]"
                        />
                    </div>

                    {!isLogin && (
                        <div className="relative animate-fade-in">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                required
                                type="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-2xl border border-[var(--border)] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[var(--accent)]/60 focus:bg-white/[0.07]"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            required
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full rounded-2xl border border-[var(--border)] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[var(--accent)]/60 focus:bg-white/[0.07]"
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="btn-accent mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-xl"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {isLogin ? "Log In" : "Sign Up"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/60">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-bold text-[var(--accent)] hover:underline"
                    >
                        {isLogin ? "Sign up" : "Log in"}
                    </button>
                </p>
            </div>
        </div>
    );
}