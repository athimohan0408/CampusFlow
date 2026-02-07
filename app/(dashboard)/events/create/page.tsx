"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Save } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateEventPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>();
    const [category, setCategory] = useState<string>("");

    // If not admin, show unauthorized or redirect
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'super-admin') {
        if (session) {
            return <div className="p-8 text-center text-red-500">Access Denied. Admin access required.</div>;
        }
        return null;
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const details: Record<string, any> = {};

        // Extract dynamic fields based on category
        if (category === 'technical') {
            details.guestSpeaker = formData.get('guestSpeaker');
            details.prerequisites = formData.get('prerequisites');
        } else if (category === 'cultural') {
            details.performer = formData.get('performer');
            details.equipment = formData.get('equipment');
        } else if (category === 'sports') {
            details.teamSize = formData.get('teamSize');
            details.equipmentProvided = formData.get('equipmentProvided');
        } else if (category === 'placement') {
            details.companyName = formData.get('companyName');
            details.roles = formData.get('roles');
            details.eligibility = formData.get('eligibility');
        }

        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            venue: formData.get('venue'),
            registrationLimit: Number(formData.get('registrationLimit')) || 0,
            posterUrl: formData.get('posterUrl'),
            date: date,
            details: details,
            modules: {
                registration: formData.get('enableRegistration') === 'on',
                attendance: formData.get('enableAttendance') === 'on',
                teamFormation: formData.get('enableTeamFormation') === 'on',
            }
        };

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to create event');

            toast.success('Event created successfully');
            router.push('/feed');
            router.refresh();
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Event</CardTitle>
                    <CardDescription>Fill in the details to publish a new campus event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Event Title</label>
                                <Input name="title" placeholder="e.g. Annual Hackathon" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select name="category" onValueChange={setCategory} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="cultural">Cultural</SelectItem>
                                        <SelectItem value="sports">Sports</SelectItem>
                                        <SelectItem value="placement">Placement</SelectItem>
                                        <SelectItem value="workshop">Workshop</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        {category === 'technical' && (
                            <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Guest Speaker / Resource Person</label>
                                    <Input name="guestSpeaker" placeholder="e.g. John Doe, Google" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prerequisites</label>
                                    <Input name="prerequisites" placeholder="e.g. Laptop, Python basics" />
                                </div>
                            </div>
                        )}

                        {category === 'cultural' && (
                            <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Performer / Guest</label>
                                    <Input name="performer" placeholder="e.g. The Band" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Equipment Requirements</label>
                                    <Input name="equipment" placeholder="e.g. Mics, Speakers" />
                                </div>
                            </div>
                        )}

                        {category === 'sports' && (
                            <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Team Size</label>
                                    <Input name="teamSize" placeholder="e.g. 11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Equipment Provided</label>
                                    <Input name="equipmentProvided" placeholder="e.g. Balls, Bats" />
                                </div>
                            </div>
                        )}

                        {category === 'placement' && (
                            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Company Name</label>
                                        <Input name="companyName" placeholder="e.g. Microsoft" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Roles</label>
                                        <Input name="roles" placeholder="e.g. SDE, Analyst" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Eligibility Criteria</label>
                                    <Input name="eligibility" placeholder="e.g. CGPA > 8.0, CSE/ECE only" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea name="description" placeholder="Describe the event..." required className="min-h-[100px]" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 flex flex-col">
                                <label className="text-sm font-medium mb-1">Date & Time</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <input type="hidden" name="date" value={date?.toISOString() || ''} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Venue</label>
                                <Input name="venue" placeholder="e.g. Auditorium" required />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Registration Limit (0 for unlimited)</label>
                                <Input type="number" name="registrationLimit" placeholder="0" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Poster URL</label>
                                <Input name="posterUrl" placeholder="https://..." />
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-medium text-sm">Event Modules</h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Registration System</label>
                                    <p className="text-xs text-muted-foreground">Allow students to register for this event</p>
                                </div>
                                <Switch name="enableRegistration" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Attendance Tracking</label>
                                    <p className="text-xs text-muted-foreground">Generate QR codes for check-in</p>
                                </div>
                                <Switch name="enableAttendance" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Team Formation</label>
                                    <p className="text-xs text-muted-foreground">Allow students to form teams</p>
                                </div>
                                <Switch name="enableTeamFormation" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading || !date}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Create Event
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
