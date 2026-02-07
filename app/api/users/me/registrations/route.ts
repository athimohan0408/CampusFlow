import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Registration from "@/lib/db/models/Registration";
import Event from "@/lib/db/models/Event"; // Ensure Event model is registered

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        // Ensure models are registered
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = Event;

        const registrations = await Registration.find({ user: session.user.id })
            .populate('event')
            .sort({ createdAt: -1 });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error("Error fetching registrations:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
