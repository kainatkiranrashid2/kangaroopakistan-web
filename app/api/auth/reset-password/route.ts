import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from 'bcryptjs';
import { randomUUID } from "crypto";
import nodemailer from 'nodemailer';

interface UserResetData {
    email: string;
}
export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email } = reqBody;
        const userExists = await db.user.findUnique({
            where: {
                email: email
            }
        });
        if (!userExists) {
            return NextResponse.json({ error: "This email is not registered" }, { status: 400 });
        }

        const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, '');
        const expiry = new Date(Date.now() + 30 * 60 * 1000); // Token expires in 30 minutes
        console.log("userExists.id")
        console.log(userExists.id)
        const resetToken =await db.reset.create({
            data: {
                userId: userExists.id,
                token: `${randomUUID()}${randomUUID()}`.replace(/-/g, ''),
              },
        });

        const transporter = nodemailer.createTransport({
            host: 'smtpout.secureserver.net',
            port: 465,
            secure: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASS,
            },
        });

        const resetLink = `https://enrollments.kangaroopakistan.org/new-password/${token}`;

        await transporter.sendMail({
            from: 'info@kangaroopakistan.org',
            to: email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 30 minutes.</p>`,
        });

        return NextResponse.json({ message: "If the email is registered, a reset link has been sent." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}