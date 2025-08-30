"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import crypto from "crypto";
import { redirect } from "next/navigation";
import twilio from "twilio";
import validator from "validator";
import { z } from "zod";

interface ActionState {
    token: boolean;
}

const phoneSchema = z
    .string()
    .trim()
    .refine(
        (phone) => validator.isMobilePhone(phone, "ko-KR"),
        "잘못된 전화번호 형식입니다."
    );

async function tokenExists(token: number) {
    const exists = await db.sMSToken.findUnique({
        where: {
            token: token.toString(),
        },
        select: {
            id: true,
        },
    });
    return Boolean(exists);
}

const tokenSchema = z.coerce
    .number()
    .min(100000)
    .max(999999)
    .refine(tokenExists, "토큰이 존재하지 않습니다.");

async function getToken() {
    const token = crypto.randomInt(100000, 999999).toString();
    const exists = await db.sMSToken.findUnique({
        where: {
            token,
        },
        select: {
            id: true,
        },
    });
    if (exists) {
        return getToken();
    } else {
        return token;
    }
}

export default async function smsLogin(
    prevState: ActionState,
    formData: FormData
) {
    const phone = formData.get("phone");
    const token = formData.get("token");

    if (!prevState.token) {
        const result = phoneSchema.safeParse(phone);
        if (!result.success) {
            return { token: false, error: result.error.flatten() };
        } else {
            await db.sMSToken.deleteMany({
                where: {
                    user: {
                        phone: result.data,
                    },
                },
            });
            const token = await getToken();
            await db.sMSToken.create({
                data: {
                    token,
                    user: {
                        connectOrCreate: {
                            where: {
                                phone: result.data,
                            },
                            create: {
                                username: crypto
                                    .randomBytes(10)
                                    .toString("hex"),
                                phone: result.data,
                            },
                        },
                    },
                },
            });
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            await client.messages.create({
                body: `당신의 Karrot 인증 인증 코드는 ${token}입니다.`,
                from: process.env.TWILIO_PHONE_NUMBER!,
                to: process.env.MY_PHONE_NUMBER!,
            }); // 원래 to는 result.data 여야함.
            return { token: true };
        }
    } else {
        const result = await tokenSchema.spa(token);
        if (!result.success) {
            return { token: true, error: result.error.flatten() };
        } else {
            const token = await db.sMSToken.findUnique({
                where: {
                    token: result.data.toString(),
                },
                select: {
                    id: true,
                    userId: true,
                },
            });
            const session = await getSession();
            session.id = token!.userId;
            await session.save();
            await db.sMSToken.deleteMany({
                where: {
                    id: token!.id,
                },
            });
            redirect("/profile");
        }
    }
}
