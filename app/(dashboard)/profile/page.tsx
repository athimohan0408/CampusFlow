"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { QrCode, Calendar, MapPin, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeGenerator from "@/components/events/qr-code";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            Promise.all([
                fetch('/api/users/me/registrations').then(res => res.json()),
                fetch('/api/users/me').then(res => res.json())
            ])
                .then(([regsData, profileData]) => {
                    setRegistrations(regsData);
                    setProfile(profileData);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [status]);

    if (status === 'loading' || loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!session) return <div>Please login</div>;

    const userInitials = session.user?.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "U";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <Card>
                <CardContent className="flex flex-col md:flex-row items-start gap-6 p-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={session.user.image || undefined} />
                        <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold">{session.user.name}</h1>
                            <p className="text-muted-foreground">{session.user.email}</p>
                            <Badge variant="outline" className="capitalize mt-2">{session.user.role}</Badge>
                        </div>

                        {profile && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Course</p>
                                    <p className="font-medium">{profile.course || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Dept</p>
                                    <p className="font-medium">{profile.department || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Year</p>
                                    <p className="font-medium">{profile.year ? `${profile.year} Year` : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Interests</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {profile.interests?.map((i: string) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">{i}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="registrations" className="w-full">
                <TabsList>
                    <TabsTrigger value="registrations">My Registrations</TabsTrigger>
                    <TabsTrigger value="history">Participation History</TabsTrigger>
                </TabsList>

                <TabsContent value="registrations" className="space-y-4 mt-6">
                    <h2 className="text-xl font-semibold">Upcoming Events</h2>
                    {registrations.length === 0 ? (
                        <p className="text-muted-foreground">No upcoming registrations.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {registrations.map((reg) => (
                                <Card key={reg._id} className="flex flex-col">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{reg.event.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(reg.event.date), "PPP p")}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3" />
                                                {reg.event.venue}
                                            </div>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full">
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    View Ticket
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Event Ticket</DialogTitle>
                                                    <DialogDescription>
                                                        Show this QR code at the venue entrance.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex flex-col items-center justify-center p-4">
                                                    <QRCodeGenerator data={JSON.stringify({
                                                        registrationId: reg._id,
                                                        userId: session.user.id,
                                                        eventId: reg.event._id
                                                    })} />
                                                    <p className="mt-4 text-sm font-mono text-muted-foreground">ID: {reg._id}</p>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <div className="p-8 text-center text-muted-foreground">
                        Participation history will be shown here.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
