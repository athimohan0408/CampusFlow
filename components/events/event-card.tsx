import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IEvent } from "@/lib/db/models/Event";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventCardProps {
    event: Partial<IEvent> & { _id: string };
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <Card className="overflow-hidden flex flex-col h-full border-border/40 hover:border-primary/50 transition-colors group">
            {/* Poster Image Area */}
            <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
                {event.posterUrl ? (
                    <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-secondary/20 text-muted-foreground">
                        No Poster
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm">
                        {event.category}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {event.date ? format(new Date(event.date), "PPP p") : "TBD"}
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {event.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        <span>{event.registrationLimit ? `${event.registrationLimit} spots` : "Open"}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                <div className="flex -space-x-2">
                    {/* Placeholder for attendees avatars - functionality later */}
                </div>
                <Button size="sm" asChild className="w-full md:w-auto">
                    <Link href={`/events/${event._id}`}>
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
