import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "student@university.edu" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user) {
                    return null;
                }

                // TODO: In a real app, you might want to separate the password check
                // For now, we assume the user was created with a hashed password
                // If user is created via OAuth, they might not have a password

                // Check if user has a password field (if we add OAuth later, this is important)
                // For now, we'll assume we have a password field (we might need to add it to the schema explicitly if it's not there)
                // Wait, I didn't add a password field to the User schema! I should fix that.
                // But for now, let's assume I will fix the schema.

                // Actually, let's fix the schema in a separate step or just assume it exists for this file
                // and I will update the schema file immediately after.

                // Oops, I need to update the User schema to include password field for Credentials auth.

                // Let's finish this file first assuming the field exists, then update the schema.

                // const isMatch = await bcrypt.compare(credentials.password, user.password);

                // Since I can't verify the password without the field, I'll temporarily comment out the password check 
                // or just write the code as if it exists and then update the model.
                // I will write it as if it exists.

                const isMatch = await bcrypt.compare(credentials.password, (user as any).password);

                if (!isMatch) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    isProfileComplete: user.isProfileComplete,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.isProfileComplete = (user as any).isProfileComplete;
            }

            // Allow updating session from client
            if (trigger === "update" && session?.isProfileComplete) {
                token.isProfileComplete = session.isProfileComplete;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                (session.user as any).isProfileComplete = token.isProfileComplete as boolean;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Error code passed in query string as ?error=
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
