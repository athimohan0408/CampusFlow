import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const user = await User.findById(session.user.id);
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { course, department, year, interests } = body;

        await dbConnect();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                course,
                department,
                year,
                interests,
                isProfileComplete: true
            },
            { new: true }
        );

        return NextResponse.json(user);
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ message: "Error updating profile" }, { status: 500 });
    }
}
