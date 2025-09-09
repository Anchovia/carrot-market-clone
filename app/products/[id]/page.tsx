import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getIsOwner(userId: number) {
    const session = await getSession();
    if (session.id) {
        return session.id === userId;
    }
}

async function getProduct(id: number) {
    const product = await db.product.findUnique({
        where: {
            id,
        },
        include: {
            user: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
        },
    });
    return product;
}

export async function generateMetadata() {
    return {
        title: "Product Detail",
    };
}

export default async function ProductDetail({
    params,
}: {
    params: { id: string };
}) {
    const id = Number(params.id);
    if (isNaN(id)) {
        return notFound();
    }
    const product = await getProduct(id);
    if (!product) {
        return notFound();
    }

    const isOwner = await getIsOwner(product.userId);

    return (
        <div>
            <div className="relative aspect-square ">
                <Image
                    fill
                    src={`${product.photo}/public`}
                    alt={product.title}
                    className="object-cover"
                />
            </div>
            <div className="p-5 flex items-center gap-3 border-b border-neutral-600">
                <div className="size-10 rounded-full overflow-hidden">
                    {product.user.avatar !== null ? (
                        <Image
                            src={product.user.avatar}
                            alt={product.user.username}
                            width={40}
                            height={40}
                        />
                    ) : (
                        <div className="size-10 bg-neutral-500 rounded-full" />
                    )}
                </div>
                <div>
                    <h3>{product.user.username}</h3>
                </div>
            </div>
            <div className="p-5">
                <h1 className="text-2xl font-semibold">{product.title}</h1>
                <p>{product.description}</p>
            </div>
            <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-xl">
                    {formatToWon(product.price)}
                </span>
                {/* delete 버튼 제작 */}
                {isOwner ? (
                    <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
                        Delete Product
                    </button>
                ) : null}
                <Link
                    href={``}
                    className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold"
                >
                    채팅하기
                </Link>
            </div>
        </div>
    );
}
