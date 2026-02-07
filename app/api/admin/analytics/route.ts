import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Event from "@/lib/db/models/Event";
import User from "@/lib/db/models/User";
import Registration from "@/lib/db/models/Registration";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'admin' && session.user.role !== 'super-admin')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const [totalEvents, totalStudents, totalRegistrations] = await Promise.all([
            Event.countDocuments({ status: { $ne: 'archived' } }),
            User.countDocuments({ role: 'student' }),
            Registration.countDocuments({ status: 'registered' }),
        ]);

        // Data for chart: Top 5 events by registration count
        const topEvents = await Registration.aggregate([
            { $match: { status: 'registered' } },
            { $group: { _id: '$event', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'eventDetails' } },
            { $unwind: '$eventDetails' },
            { $project: { name: '$eventDetails.title', count: '$count' } }
        ]);

        return NextResponse.json({
            totalEvents,
            totalStudents,
            totalRegistrations,
            topEvents
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
