import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from 'bcryptjs';
import { randomUUID } from "crypto";
import nodemailer from 'nodemailer';

interface UserResetData {
    email: string;
}
export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { token, password } = reqBody;
        const passwordResetToken = await db.reset.findUnique({
            where: {
              token,
              createdAt: { gt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
              resetAt: null,
            },
          })

          if (!passwordResetToken) {
                return NextResponse.json({ message:'Invalid token reset request. Please try resetting your password again.',
                });
        }
        const salt  = await bcrypt.genSalt(10)
        const hashedPassword  = await bcrypt.hash(password, salt)
            
        const updateUser = db.user.update({
            where: { id: passwordResetToken.userId },
            data: {
              password: hashedPassword,
            },
          })
          const updateToken = db.reset.update({
            where: {
              id: passwordResetToken.id,
            },
            data: {
              resetAt: new Date(),
            },
          })
        
          try {
            await db.$transaction([updateUser, updateToken])
          } catch (err) {
            console.error(err)
            return {
              error: `An unexpected error occured. Please try again and if the problem persists, contact support.`,
            }
          }
        
        
        
        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
