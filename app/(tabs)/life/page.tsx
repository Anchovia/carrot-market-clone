import db from "@/lib/db";
import formatToTimeAgo from "@/lib/utils";
import Link from "next/link";

async function getPost() {
    const posts = await db.post.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            views: true,
            created_at: true,
            _count: {
                select: {
                    comments: true,
                    likes: true,
                },
            },
        },
    });
    return posts;
}

export const metadata = {
    title: "동네생활",
};

export default async function Life() {
    const posts = await getPost();
    return (
        <div className="p-5 flex flex-col">
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="pb-5 mb-5 border-b border-neutral-500 text-neutral-400 flex flex-col last:pb-0 last:border-b-0 gap-2"
                >
                    <h2 className="text-white text-lg font-semibold">
                        {post.title}
                    </h2>
                    <p>{post.description}</p>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4 items-center">
                            <span>
                                {formatToTimeAgo(post.created_at.toString())}
                            </span>
                            <span>.</span>
                            <span>조회 {post.views}</span>
                        </div>
                        <div className="flex gap-4 items-center *:flex *:gap-1 *:items-center">
                            <span>
                                <div className="bg-neutral-500 rounded-full size-4" />
                                {post._count.likes}
                            </span>
                            <span>
                                <div className="bg-neutral-500 rounded-full size-4" />
                                {post._count.comments}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
