import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Registration from "@/lib/db/models/Registration";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'admin' && session.user.role !== 'super-admin')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { registrationId, eventId, userId } = await req.json();

        if (!registrationId) {
            return NextResponse.json({ message: "Invalid QR Code Data" }, { status: 400 });
        }

        await dbConnect();

        const registration = await Registration.findById(registrationId);

        if (!registration) {
            return NextResponse.json({ message: "Registration not found" }, { status: 404 });
        }

        if (registration.status === 'attended') {
            return NextResponse.json({ message: "Already checked in at " + new Date(registration.attendedAt!).toLocaleTimeString() }, { status: 200 });
        }

        // Update status
        registration.status = 'attended';
        registration.attendedAt = new Date();
        await registration.save();

        return NextResponse.json({
            message: "Check-in successful!",
            user: userId, // In real app, fetch user name to display
            timestamp: registration.attendedAt
        }, { status: 200 });

    } catch (error) {
        console.error("Attendance error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
