import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Event from "@/lib/db/models/Event";
import User from "@/lib/db/models/User";

export async function GET(req: Request) {
    try {
        await dbConnect();
        // Simple fetch all published events sorted by date
        // TODO: Add filters based on query params
        const events = await Event.find({ status: { $ne: 'archived' } })
            .sort({ date: 1 })
            .populate('organizer', 'name email');

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin' && session.user.role !== 'super-admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        const event = await Event.create({
            ...body,
            organizer: session.user.id,
            status: 'published', // Default to published for MVP simplicity
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
