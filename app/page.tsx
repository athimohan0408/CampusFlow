"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super-admin';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden relative">

      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Navbar - Minimal */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <div className="p-2 bg-primary/10 rounded-lg backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Campus Flow
          </span>
        </div>
        <div className="flex gap-4">
          {/* Shortcuts if needed */}
        </div>
      </header>

      {/* Hero Section - Centered & Focused */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <FadeIn className="text-center max-w-3xl mx-auto space-y-8">

          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              The Next Gen Campus OS
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
              Flow through <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 animate-gradient-x">
                Campus Life.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
              Your gateway to events, communities, and real-time campus updates. Everything you need, one tap away.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href={isAdmin ? "/admin" : (session ? "/feed" : "/login")}>
              <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_60px_-15px_hsl(var(--primary)/0.6)] hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 border-0">
                {session ? (isAdmin ? "Go to Admin Dashboard" : "Go to Feed") : "Login to Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="pt-12 flex items-center justify-center gap-8 text-muted-foreground/50 text-sm font-medium">
            <span>Events</span> • <span>Attendance</span> • <span>Community</span> • <span>Profile</span>
          </div>

        </FadeIn>
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-6 text-center text-sm text-muted-foreground/60 relative z-10">
        <p>© 2026 Campus Flow. Elevating the student experience.</p>
      </footer>
    </div>
  );
}
