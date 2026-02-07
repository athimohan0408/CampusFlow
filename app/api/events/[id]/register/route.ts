import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Event from "@/lib/db/models/Event";
import Registration from "@/lib/db/models/Registration";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id: eventId } = await params;
        await dbConnect();

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        // Check if event allows registration
        if (!event.modules.registration) {
            return NextResponse.json({ message: "Registration is not enabled for this event" }, { status: 400 });
        }

        // Check if duplicate registration
        const existingRegistration = await Registration.findOne({
            event: eventId,
            user: session.user.id
        });

        if (existingRegistration) {
            return NextResponse.json({ message: "Already registered" }, { status: 409 });
        }

        // Check limit
        if (event.registrationLimit && event.registrationLimit > 0) {
            const count = await Registration.countDocuments({ event: eventId, status: 'registered' });
            if (count >= event.registrationLimit) {
                return NextResponse.json({ message: "Registration full" }, { status: 400 });
            }
        }

        // Create registration
        const registration = await Registration.create({
            event: eventId,
            user: session.user.id,
            status: 'registered'
        });

        return NextResponse.json(registration, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// Check registration status for current user
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ isRegistered: false });
        }

        const { id: eventId } = await params;
        await dbConnect();

        const registration = await Registration.findOne({
            event: eventId,
            user: session.user.id
        });

        return NextResponse.json({
            isRegistered: !!registration,
            registration: registration
        });

    } catch (error) {
        console.error("Error checking registration:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
