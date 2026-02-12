import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../shared/context/AuthContext";
import logo from "../../../assets/logo.png";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});

  // Get redirect path from location state
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    if (!loginData.email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!loginData.password) {
      setErrors({ password: "Password is required" });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(loginData.email, loginData.password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ general: error.message || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!signupData.name) newErrors.name = "Name is required";
    if (!signupData.email) newErrors.email = "Email is required";
    if (!signupData.password) newErrors.password = "Password is required";
    if (signupData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await register(signupData.name, signupData.email, signupData.password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ general: error.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f0f12] via-[#111114] to-[#0a0a0c] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="SyncIDE" className="w-10 h-10" />
          <span className="text-2xl font-bold text-white">SyncIDE</span>
        </Link>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Code Together,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Build Faster
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/60 mb-8"
          >
            Real-time collaborative coding with video calls, AI assistance, and seamless workspace management.
          </motion.p>

          {/* Feature List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {[
              { icon: "⚡", text: "Real-time collaboration with multiple cursors" },
              { icon: "🎥", text: "Integrated video calls for pair programming" },
              { icon: "🤖", text: "AI-powered code suggestions" },
              { icon: "📁", text: "Organize projects with workspaces" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-white/70">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-white/40">
          © 2026 SyncIDE. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={logo} alt="SyncIDE" className="w-10 h-10" />
            <span className="text-2xl font-bold text-white">SyncIDE</span>
          </Link>

          {/* Auth Card */}
          <div className="bg-[#111114] border border-[#1e1e24] rounded-3xl p-8 shadow-2xl">
            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-[#0a0a0c] rounded-2xl mb-8">
              <button
                onClick={() => { setIsLogin(true); setErrors({}); }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isLogin 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setErrors({}); }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  !isLogin 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-white/50 mb-6">
                  {isLogin 
                    ? "Enter your credentials to access your workspaces" 
                    : "Start collaborating with your team today"}
                </p>

                {/* General Error Message */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4"
                  >
                    <p className="text-red-400 text-sm text-center">{errors.general}</p>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                  {/* Name Field (Signup only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        className={`w-full px-4 py-3 bg-[#0a0a0c] border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                          errors.name ? "border-red-500" : "border-[#1e1e24]"
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                    <input
                      type="email"
                      value={isLogin ? loginData.email : signupData.email}
                      onChange={(e) => isLogin 
                        ? setLoginData({ ...loginData, email: e.target.value })
                        : setSignupData({ ...signupData, email: e.target.value })
                      }
                      className={`w-full px-4 py-3 bg-[#0a0a0c] border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                        errors.email ? "border-red-500" : "border-[#1e1e24]"
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white/70">Password</label>
                      {isLogin && (
                        <button type="button" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={isLogin ? loginData.password : signupData.password}
                      onChange={(e) => isLogin 
                        ? setLoginData({ ...loginData, password: e.target.value })
                        : setSignupData({ ...signupData, password: e.target.value })
                      }
                      className={`w-full px-4 py-3 bg-[#0a0a0c] border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                        errors.password ? "border-red-500" : "border-[#1e1e24]"
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password (Signup only) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 bg-[#0a0a0c] border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                          errors.confirmPassword ? "border-red-500" : "border-[#1e1e24]"
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                      </>
                    ) : (
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-[#1e1e24]" />
                  <span className="text-sm text-white/30">or continue with</span>
                  <div className="flex-1 h-px bg-[#1e1e24]" />
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#0a0a0c] border border-[#1e1e24] rounded-xl text-white/70 hover:text-white hover:border-white/20 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#0a0a0c] border border-[#1e1e24] rounded-xl text-white/70 hover:text-white hover:border-white/20 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Terms */}
          {!isLogin && (
            <p className="text-center text-sm text-white/40 mt-6">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-emerald-400 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-emerald-400 hover:underline">Privacy Policy</a>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
