import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    // 다량의 request -> response 구문을 함수로 분리 필요
    // ex) getAccessToken
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
        return new Response(null, { status: 400 });
    }
    const accessTokenParams = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
    }).toString();
    const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
    const accessTokenResponse = await fetch(accessTokenURL, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    });
    const { error, access_token } = await accessTokenResponse.json();
    if (error) {
        return new Response(null, { status: 400 });
    }

    // ex) getGithubProfile로 분리 필요
    const userProfileResponse = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        cache: "no-cache",
    });
    const { id, avatar_url, login } = await userProfileResponse.json();

    const user = await db.user.findUnique({
        where: { github_id: id + "" },
        select: { id: true },
    });
    if (user) {
        // session -> id -> save가 너무 반복돼 따로 login 이라는 함수 만들어서 빼기
        const session = await getSession();
        session.id = user.id;
        await session.save();
        return redirect("/profile");
    }

    // 아래처럼 하면 github username과 일반 로그인 username이 겹칠 수 있음. 수정 필요. github 닉네임은 git_ 붙이기 추가
    const newUser = await db.user.create({
        data: {
            username: login,
            github_id: id + "",
            avatar: avatar_url,
        },
        select: { id: true },
    });
    // session -> id -> save가 너무 반복돼 따로 login 이라는 함수 만들어서 빼기
    const session = await getSession();
    session.id = newUser.id;
    await session.save();
    return redirect("/profile");
}
