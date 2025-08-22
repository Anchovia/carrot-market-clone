import Link from "next/link";

export default function SocialLogin() {
    return (
        <>
            <div className="w-full h-px bg-neutral-500" />
            <div className="flex flex-col gap-3">
                <Link
                    href="/github/start"
                    className="primary-btn flex h-10 items-center justify-center gap-2"
                >
                    <div className="size-6 bg-neutral-500 rounded-full" />
                    <span>Continue with Github</span>
                </Link>
                <Link
                    href="/sms"
                    className="primary-btn flex h-10 items-center justify-center gap-2"
                >
                    <div className="size-6 bg-neutral-500 rounded-full" />
                    <span>Continue with SMS</span>
                </Link>
            </div>
        </>
    );
}
