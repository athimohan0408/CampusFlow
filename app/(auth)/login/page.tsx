"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid credentials", {
                    description: "Please check your email and password.",
                });
            } else {
                toast.success("Login successful", {
                    description: "Welcome back!",
                });
                router.refresh(); // Refresh to update session
                router.push("/feed"); // Redirect to feed
            }
        } catch (error) {
            toast.error("Something went wrong", {
                description: "Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md border-primary/20 bg-card shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Campus Flow</CardTitle>
                <CardDescription>
                    Enter your university credentials to access the platform
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="student@university.edu" required disabled={loading} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required disabled={loading} />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full text-base font-semibold" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                            Register here
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
