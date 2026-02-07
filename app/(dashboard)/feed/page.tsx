"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";

export default function FeedPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <FadeIn>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campus Feed</h1>
                    <p className="text-muted-foreground mt-2">Discover what&apos;s happening around you.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
                    <h3 className="text-xl font-medium">No events found</h3>
                    <p className="text-muted-foreground mt-2">Check back later or create one!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event, index) => (
                        <FadeIn key={event._id} className={`delay-[${index * 100}ms]`}>
                            <Card className="h-full flex flex-col overflow-hidden hover:border-primary/50 transition-colors group">
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    {/* Placeholder for Poster Image */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center text-primary/20 font-bold text-4xl group-hover:scale-105 transition-transform duration-500">
                                        CF
                                    </div>
                                    <Badge className="absolute top-2 right-2" variant="secondary">
                                        {event.category}
                                    </Badge>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(event.date), "PPP p")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="text-sm text-muted-foreground flex items-start gap-2 mb-4">
                                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{event.venue}</span>
                                    </div>
                                    <p className="text-sm line-clamp-3 text-foreground/80">
                                        {event.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button asChild className="w-full">
                                        <Link href={`/events/${event._id}`}>
                                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </FadeIn>
                    ))}
                </div>
            )}
        </FadeIn>
    );
}
