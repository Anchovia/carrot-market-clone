import db from "@/lib/db";
import getSession from "@/lib/session";
import formatToTimeAgo from "@/lib/utils";
import { revalidateTag, unstable_cache } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getPost(id: number) {
    try {
        const post = db.post.update({
            where: {
                id,
            },
            // update는 data가 필수
            data: {
                views: {
                    // 1씩 증가시키기
                    increment: 1,
                },
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });
        return post;
    } catch (e) {
        return null;
    }
}

const getCachedPost = unstable_cache(getPost, ["post-detail"], {
    tags: [`post-detail`],
    revalidate: 60,
});

async function getLikeStatus(postId: number, userId: number) {
    const isLiked = await db.like.findUnique({
        where: {
            id: {
                postId,
                userId,
            },
        },
    });
    const likeCount = await db.like.count({
        where: {
            postId,
        },
    });
    return {
        likeCount,
        isLike: Boolean(isLiked),
    };
}

function getCachedLikeStatus(postId: number, userId: number) {
    const cachedOperation = unstable_cache(
        getLikeStatus,
        ["product-like-status"],
        {
            tags: [`like-status-${postId}`],
        }
    );
    return cachedOperation(postId, userId);
}

export default async function PostDetail({
    params,
}: {
    params: { id: string };
}) {
    const id = Number(params.id);
    if (isNaN(id)) {
        return notFound();
    }
    const post = await getCachedPost(id);
    if (!post) {
        return notFound();
    }
    const likePost = async () => {
        "use server";
        const session = await getSession();
        try {
            await db.like.create({
                data: {
                    postId: id,
                    userId: session.id!,
                },
            });
            revalidateTag(`like-status-${id}`);
        } catch (e) {}
    };
    const dislikePost = async () => {
        "use server";
        const session = await getSession();
        try {
            await db.like.delete({
                where: {
                    id: {
                        postId: id,
                        userId: session.id!,
                    },
                },
            });
            revalidateTag(`like-status-${id}`);
        } catch (e) {
            console.error("Dislike post error:", e);
        }
    };
    const session = await getSession();

    if (!session.id) {
        return notFound(); // 또는 로그인 페이지로 리다이렉트
    }

    const { likeCount, isLike } = await getCachedLikeStatus(id, session.id);
    return (
        <div className="p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
                <Image
                    width={28}
                    height={28}
                    className="size-7 rounded-full"
                    src={post.user.avatar ? post.user.avatar : ""}
                    alt={post.user.username}
                />
                <div>
                    <span className="text-sm font-semibold">
                        {post.user.username}
                    </span>
                    <div className="text-xs">
                        <span>
                            {formatToTimeAgo(post.created_at.toString())}
                        </span>
                    </div>
                </div>
            </div>
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="mb-5">{post.description}</p>
            <div className="flex flex-col gap-5 items-start">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <div className="size-5 bg-neutral-500 rounded-full" />
                    <span>조회 {post.views}</span>
                </div>
                <form action={isLike ? dislikePost : likePost}>
                    <button
                        className={`flex items-center gap-2  text-sm border border-neutral-400 rounded-full p-2   transition-colors ${
                            isLike
                                ? "bg-orange-500 text-white border-orange-500"
                                : "text-neutral-400 hover:bg-neutral-800"
                        }`}
                    >
                        {isLike ? (
                            <div className="size-5 rounded-full bg-neutral-100" />
                        ) : (
                            <div className="size-5 rounded-full bg-neutral-500" />
                        )}
                        {isLike ? (
                            <span>{likeCount}</span>
                        ) : (
                            <span>공감하기 ({likeCount})</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
