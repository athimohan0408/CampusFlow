"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PlusCircle, Calendar, MapPin, Users, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            // in a real app, we might want a specific endpoint for admin that includes drafts etc.
            // for MVP, /api/events returns all published events. 
            // We might want to update the API to return all for admins? 
            // Let's assume /api/events returns what we need for now, or we can filter client side.
            .then(data => setEvents(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEvents(events.filter(e => e._id !== id));
                toast.success("Event deleted");
            } else {
                toast.error("Failed to delete event");
            }
        } catch (error) {
            toast.error("Error deleting event");
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
                    <p className="text-muted-foreground">View and manage all campus events.</p>
                </div>
                <Button asChild>
                    <Link href="/events/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {events.length === 0 ? (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>No events found</CardTitle>
                            <CardDescription>Create your first event to get started.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    events.map((event) => (
                        <Card key={event._id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-6 flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                                                {event.status}
                                            </Badge>
                                            <Badge variant="outline">{event.category}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(event.date), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl">{event.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {event.venue}
                                        </div>
                                        {/* Placeholder for registration count if we had it in this payload */}
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 md:w-48 flex md:flex-col gap-2 justify-center border-l">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/events/${event._id}`}>View</Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(event._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
