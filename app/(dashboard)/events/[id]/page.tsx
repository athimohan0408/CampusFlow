"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Assuming you have SessionProvider wrapping app or passing session
import { format } from "date-fns";
import { Calendar, MapPin, Users, Share2, Ticket, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IEvent } from "@/lib/db/models/Event";
import { IRegistration } from "@/lib/db/models/Registration";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const eventId = params.id as string;

    const [event, setEvent] = useState<IEvent | null>(null);
    const [registration, setRegistration] = useState<IRegistration | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Event
                const eventRes = await fetch(`/api/events/${eventId}`);
                if (!eventRes.ok) {
                    if (eventRes.status === 404) router.push('/404');
                    return;
                }
                const eventData = await eventRes.json();
                setEvent(eventData);

                // Fetch Registration Status (if logged in)
                if (session) {
                    const regRes = await fetch(`/api/events/${eventId}/register`);
                    if (regRes.ok) {
                        const regData = await regRes.json();
                        setRegistration(regData.registration);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        }

        if (status !== 'loading') {
            fetchData();
        }
    }, [eventId, session, status, router]);

    const handleRegister = async () => {
        if (!session) {
            router.push(`/login?callbackUrl=/events/${eventId}`);
            return;
        }

        setRegistering(true);
        try {
            const res = await fetch(`/api/events/${eventId}/register`, {
                method: 'POST'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            setRegistration(data);
            toast.success("Successfully registered!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!event) return <div>Event not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section with Poster */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
                {event.posterUrl ? (
                    <img src={event.posterUrl} alt={event.title} className="object-cover w-full h-full" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <span className="text-muted-foreground text-lg">No Poster Image</span>
                    </div>
                )}
                <Badge className="absolute top-4 right-4 text-base px-3 py-1 bg-background/90 backdrop-blur text-foreground">
                    {event.category}
                </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">{event.title}</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {event.description}
                        </p>
                    </div>
                </div>

                {/* Sidebar / Action Card */}
                <div className="md:col-span-1">
                    <Card className="sticky top-24 border-primary/20 shadow-lg shadow-primary/5">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Date & Time</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(event.date), "EEEE, MMMM do, yyyy")}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(event.date), "h:mm a")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Venue</p>
                                        <p className="text-sm text-muted-foreground">{event.venue}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Registration</p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.registrationLimit ?
                                                event.registrationLimit > 0 ? `${event.registrationLimit} spots total` : "Unavailable"
                                                : "Unlimited spots"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                {registration ? (
                                    <Button className="w-full" variant="outline" disabled>
                                        <Ticket className="mr-2 h-4 w-4" />
                                        Registered
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full text-lg py-6 font-bold shadow-md hover:shadow-lg transition-all"
                                        onClick={handleRegister}
                                        disabled={registering || !event.modules.registration || session?.user?.role === 'admin' || session?.user?.role === 'super-admin'}
                                    >
                                        {registering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {session?.user?.role === 'admin' || session?.user?.role === 'super-admin'
                                            ? "Admins cannot register"
                                            : event.modules.registration ? "Register Now" : "Registration Closed"}
                                    </Button>
                                )}
                                {registration && (
                                    <div className="mt-2 text-center">
                                        <p className="text-green-500 text-sm font-medium">You are going!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
