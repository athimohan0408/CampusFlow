import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Event from "@/lib/db/models/Event";
import User from "@/lib/db/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Fetch full user profile to get course, department, interests
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Build query for recommendations
        const query: any = {
            status: 'published',
            date: { $gte: new Date() } // Only future events
        };

        const orConditions = [];

        // 1. Match allowed fields (Course, Dept, Year)
        // If event has restriction, user MUST match. If empty, it's open for all.
        // Actually, recommendation usually means "Prioritize these".
        // But user said "recommend ONLY necessary events". This implies strict filtering or at least strong ranking.

        // Let's implement strict filtering for "Recommended" tab:
        // Events that explicitly target the user's course/dept OR have no restrictions AND match interests.

        // Condition A: Explicitly targeted
        if (user.course) {
            orConditions.push({ allowedCourses: user.course });
        }
        if (user.department) {
            orConditions.push({ allowedDepartments: user.department });
        }
        if (user.year) {
            orConditions.push({ allowedYears: user.year });
        }

        // Condition B: Open to all (empty arrays)
        orConditions.push({
            allowedCourses: { $size: 0 },
            allowedDepartments: { $size: 0 },
            allowedYears: { $size: 0 }
        });

        // Apply demographic filter
        // We want events that match demographic criteria
        // (allowedCourses contains user.course OR allowedCourses is empty) AND ...

        // Actually, simplify:
        // Match events where:
        // (allowedCourses is empty OR includes user.course)
        // AND (allowedDepartments is empty OR includes user.department)
        // AND (allowedYears is empty OR includes user.year)

        const demographicQuery = {
            $and: [
                { $or: [{ allowedCourses: { $size: 0 } }, { allowedCourses: user.course }] },
                { $or: [{ allowedDepartments: { $size: 0 } }, { allowedDepartments: user.department }] },
                { $or: [{ allowedYears: { $size: 0 } }, { allowedYears: user.year }] }
            ]
        };

        // Condition C: Interest Matching (Boost or Filter?)
        // Let's just return demographics matching events first.
        // Frontend can highlight "Based on your interest in X".

        // Combine
        Object.assign(query, demographicQuery);

        const events = await Event.find(query).sort({ date: 1 });

        return NextResponse.json(events);
    } catch (error) {
        console.error("Recommended events error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
