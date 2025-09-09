"use client";

import { useRouter } from "next/navigation";

export default function CloseButton() {
    const router = useRouter();
    const onCloseClick = () => {
        router.back();
    };
    return (
        <button onClick={onCloseClick} className="absolute right-5 top-5">
            <div className="size-10 bg-neutral-300 rounded-full" />
        </button>
    );
}
