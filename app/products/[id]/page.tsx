import db from "@/lib/db";
import { formatToWon } from "@/lib/utils";
import { revalidateTag, unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getIsOwner(userId: number) {
    /*
    const session = await getSession(); // cookie는 페이지를 dynamic으로 만듬.(pre render 불가능)
    if (session.id) {
        return session.id === userId;
    }
    */
    return false;
}

/*
// tags가 동일하거나, revalidate url을 사용해서 revalidate를 하면 일반 fetch도 포함되어 revalidate 캐싱됨.
async function testFetch() {
    fetch("https://test.com", {
        method: "GET", // next_cache 사용하려면 무조건 GET 메소드만 작동함
        next: {
            // 여기는 unstable_cache랑 동일하게 작동
            revalidate: 60,
            tags: ["test"],
        },
    });
}
// cookies나 headers를 사용하는 request도 cache 하지 못 함.(인증 관련 요청이거나 response가 다르기 때문.)
// server actions에 있는 fetch request들도 cache 하지 못 함.
// 그치만 이럴땐 unstable_cache를 쓰면 됨 !!
*/

async function getProduct(id: number) {
    console.log("prod");
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

const getCachedProduct = unstable_cache(getProduct, ["product-detail"], {
    tags: ["product-detail", "xxx"],
});

async function getProductTitle(id: number) {
    console.log("title");
    const product = await db.product.findUnique({
        where: {
            id,
        },

        select: {
            title: true,
        },
    });
    return product;
}

// key는 유일해야함 ! 단, tag는 유일하지 않아도 됨.
const getCachedProductTitle = unstable_cache(
    getProductTitle, // (id:number) => getProductTitle(id) 하는것과 같은 뜻임. next cache가 자동으로 풀어서 넣어줌.
    ["product-title"],
    { tags: ["product-title", "xxx"] } // 여러 태그를 가질 수 있음. tags:["a", "b", "c" ...]
    // 또한, tag들은 애플리케이션 여러 cache에서 공유될 수 있음. ex) "a" 태그를 가진 cache만 revalidate 하기.. 등
);

export async function generateMetadata({ params }: { params: { id: string } }) {
    const product = await getCachedProductTitle(Number(params.id));
    return {
        title: product?.title,
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
    const product = await getCachedProduct(id);
    if (!product) {
        return notFound();
    }

    const isOwner = await getIsOwner(product.userId);
    const revalidate = async () => {
        "use server";
        revalidateTag("xxx");
    };

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
                {true ? (
                    <form action={revalidate}>
                        <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
                            Revalidate title cache
                        </button>
                    </form>
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

// return은 배열을 받는데, [id]에 들어갈 값을 넣어주면 됨
// 이렇게 되면 static이 되어, 제품이 추가될 때 server action을 사용하여 revalidate 해주면 됨.
export async function generateStaticParams() {
    const products = await db.product.findMany({
        select: {
            id: true,
        },
    });
    return products.map((product) => ({
        id: product.id + "",
    })); // number인 array를 string으로 변환
}

// 1, 2, 3, 4가 build로 생성된 상태에서 db에 5가 추가된다 ?
// next가 5 페이지는 dynamic으로 인식하여 db 호출하고 loading이 이뤄짐.
// 그치만, 첫 번째로 방문한 유저에게만 loading이 보이고, 그 다음부터는 static(HTML 페이지)으로 변환됨.
// 즉, 다음 유저에게는 빠르게 보임.
// 이러한 동작을 담당하는건
// export const dynamicParams = true; 임 <- 기본값은 true임.
// 이걸 하면 미리 생성되지 않은 페이지들은 dynamic으로 간주됨.
// false면 ? -> rerender가 일어나지 않고, build 할 때 미리 생성된 페이지만 찾을 수 있게됨.
// 그럼 유저가 404를 보게됨.
