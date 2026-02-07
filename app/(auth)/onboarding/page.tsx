"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Loader2, ArrowRight, BookOpen, User, Calendar as CalendarIcon, Hash } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/fade-in";

interface OnboardingDefaultValues {
    course: string;
    department: string;
    year: string;
    interests: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const { update } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OnboardingDefaultValues>();

    const onSubmit = async (data: OnboardingDefaultValues) => {
        setIsLoading(true);
        try {
            const interestsArray = data.interests.split(",").map(i => i.trim()).filter(i => i);

            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    course: data.course,
                    department: data.department,
                    year: parseInt(data.year),
                    interests: interestsArray
                })
            });

            if (!res.ok) throw new Error("Failed to update profile");

            await update({ isProfileComplete: true });
            toast.success("Profile completed successfully!");
            router.push("/");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
            </div>

            <FadeIn>
                <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">

                    {/* Left Side: Welcome Text */}
                    <div className="hidden md:block space-y-6">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            One last step
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                            Tailor your <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                                Campus Experience.
                            </span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            We'll use these details to recommend events, workshops, and communities that align with your academic journey.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[
                                { icon: BookOpen, label: "Smart Feed" },
                                { icon: User, label: "Networking" },
                                { icon: CalendarIcon, label: "Reminders" },
                                { icon: Hash, label: "Discovery" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm"
                                >
                                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                                        <item.icon size={18} />
                                    </div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <Card className="w-full shadow-2xl border-primary/10 backdrop-blur-md bg-card/80">
                        <CardHeader>
                            <CardTitle>Student Details</CardTitle>
                            <CardDescription>
                                Tell us about your academic background.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course / Degree</Label>
                                    <Select onValueChange={(val) => setValue("course", val)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MCA">MCA</SelectItem>
                                            <SelectItem value="BTech">B.Tech</SelectItem>
                                            <SelectItem value="MTech">M.Tech</SelectItem>
                                            <SelectItem value="BCA">BCA</SelectItem>
                                            <SelectItem value="MBA">MBA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department / Branch</Label>
                                    <Select onValueChange={(val) => setValue("department", val)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                                            <SelectItem value="ISE">Information Science (ISE)</SelectItem>
                                            <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                                            <SelectItem value="ME">Mechanical (ME)</SelectItem>
                                            <SelectItem value="CV">Civil (CV)</SelectItem>
                                            <SelectItem value="AIML">AI & ML</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="year">Current Year</Label>
                                    <Select onValueChange={(val) => setValue("year", val)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st Year</SelectItem>
                                            <SelectItem value="2">2nd Year</SelectItem>
                                            <SelectItem value="3">3rd Year</SelectItem>
                                            <SelectItem value="4">4th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="interests">Interests (comma separated)</Label>
                                    <Input
                                        id="interests"
                                        placeholder="Coding, Dance, Sports, AI..."
                                        {...register("interests")}
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] transition-transform" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </FadeIn>
        </div>
    );
}
