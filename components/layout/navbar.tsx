"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Home, User, Calendar, PlusCircle, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();

    const userInitials = session?.user?.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "U";

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <Link href="/feed" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <GraduationCap className="h-6 w-6" />
                    <span>Campus Flow</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/feed" className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Home className="h-4 w-4" />
                        Feed
                    </Link>
                    <Link href="/events" className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Calendar className="h-4 w-4" />
                        My Events
                    </Link>
                    {session?.user?.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Settings className="h-4 w-4" />
                            Admin
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {session?.user?.role === "admin" && (
                        <Button size="sm" variant="outline" className="hidden md:flex" onClick={() => router.push("/events/create")}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Event
                        </Button>
                    )}

                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || ""} />
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/profile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                {session?.user?.role === "admin" && (
                                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Admin Dashboard</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button>Login</Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
