"use server";

import { redirect } from "next/navigation";
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
const tokenSchema = z.coerce.number().min(100000).max(999999);

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
            return { token: true };
        }
    } else {
        const result = tokenSchema.safeParse(token);
        if (!result.success) {
            return { token: true, error: result.error.flatten() };
        } else {
            redirect("/");
        }
    }
}
