import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Event from "@/lib/db/models/Event";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const event = await Event.findById(id).populate('organizer', 'name email');

        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
