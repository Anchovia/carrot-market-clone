"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar() {
    const pathname = usePathname();
    return (
        <div className="fixed bottom-0 w-full mx-auto max-w-screen-md grid grid-cols-5 border-neutral-600 border-t px-5 py-3 *:text-white bg-neutral-800">
            <Link
                href="/products"
                className="flex flex-col items-center gap-px"
            >
                {pathname === "/products" ? (
                    <div className="size-7 bg-neutral-500 rounded-full" />
                ) : (
                    <div className="size-7 bg-neutral-400 rounded-full" />
                )}
                <span>홈</span>
            </Link>
            <Link href="/life" className="flex flex-col items-center gap-px">
                {pathname === "/life" ? (
                    <div className="size-7 bg-neutral-500 rounded-full" />
                ) : (
                    <div className="size-7 bg-neutral-400 rounded-full" />
                )}
                <span>동네생활</span>
            </Link>
            <Link href="/chat" className="flex flex-col items-center gap-px">
                {pathname === "/chat" ? (
                    <div className="size-7 bg-neutral-500 rounded-full" />
                ) : (
                    <div className="size-7 bg-neutral-400 rounded-full" />
                )}
                <span>채팅</span>
            </Link>
            <Link href="/live" className="flex flex-col items-center gap-px">
                {pathname === "/live" ? (
                    <div className="size-7 bg-neutral-500 rounded-full" />
                ) : (
                    <div className="size-7 bg-neutral-400 rounded-full" />
                )}
                <span>쇼핑</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-px">
                {pathname === "/profile" ? (
                    <div className="size-7 bg-neutral-500 rounded-full" />
                ) : (
                    <div className="size-7 bg-neutral-400 rounded-full" />
                )}
                <span>프로필</span>
            </Link>
        </div>
    );
}
