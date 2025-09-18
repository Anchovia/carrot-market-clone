import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

async function getUser() {
    const session = await getSession();
    if (session.id) {
        const user = await db.user.findUnique({
            where: {
                id: session.id,
            },
        });
        if (user) {
            return user;
        }
    }
    notFound();
}

async function Username() {
    const user = await getUser();
    return <h1>welcome! {user?.username}</h1>;
}

export default async function Profile() {
    const logOut = async () => {
        "use server";
        const session = await getSession();
        session.destroy();
        redirect("/");
    };

    // 너무 static으로 만들지 않아도, 로딩이 좀 있으면 suspence를 쓰면 됨. 다양한 스켈레톤으로 표현 ㄱㄱ

    return (
        <div>
            <Suspense fallback={"hello!"}>
                <Username />
            </Suspense>
            <form action={logOut}>
                <button>Logout</button>
            </form>
        </div>
    );
}
