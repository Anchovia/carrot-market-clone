"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import z from "zod";

const productSchema = z.object({
    photo: z.string({
        required_error: "사진은 필수입니다.",
    }),
    title: z.string({
        required_error: "제목은 필수입니다.",
    }),
    description: z.string({
        required_error: "설명은 필수입니다.",
    }),
    price: z.coerce.number({
        required_error: "가격은 필수입니다.",
    }),
});

export async function uploadProduct(_: any, formdata: FormData) {
    const data = {
        title: formdata.get("title"),
        photo: formdata.get("photo"),
        price: formdata.get("price"),
        description: formdata.get("description"),
    };

    const result = productSchema.safeParse(data);
    if (!result.success) {
        return result.error.flatten();
    } else {
        const session = await getSession();
        if (session.id) {
            const products = await db.product.create({
                data: {
                    title: result.data.title,
                    photo: result.data.photo,
                    description: result.data.description,
                    price: result.data.price,
                    user: {
                        connect: {
                            id: session.id,
                        },
                    },
                },
                select: {
                    id: true,
                },
            });
            redirect(`/products/${products.id}`);
        }
    }
}

export async function getUploadUrl() {
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFARE_ACCOUNT_ID}/images/v2/direct_upload`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.CLOUDFARE_API_KEY}`,
            },
        }
    );
    const data = await response.json();
    return data;
}
