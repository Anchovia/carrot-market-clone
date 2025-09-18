import ProductList from "@/components/product-list";
import db from "@/lib/db";
import { unstable_cache as nextCache, revalidatePath } from "next/cache";
import Link from "next/link";

// NextJs가 static 페이지로 설정한경우, 새로고침해도 revalidate가 자동으로 진행되지 않음.
// cookie를 사용허지 않는(즉, 유저마다 다르게 보이지 않는 페이지) 페이지의 경우 static으로 설정됨.
// static이면 결국 최초 1회 db 호출만 하고 그 데이터로 html을 생성 후 더이상 refresh 하지 않음.
// 이런 static에서 refresh 하는 방법중 하나가 revalidatePath("/url")임
// /product/[id]는 id로 어떤 데이터가 들어가느냐에 따라 바뀌기때문에 dynamic임.(next는 [id]에 어떤 데이터가 들어가는지 확정적으로 알 방법이 없기 때문.)
// revalidatePath("/home")은 새로운 /home 페이지를 만들어달라는것과 같은 뜻.
// cookies를 볼때, headers를 볼때, URL을 볼때 등 <- 이럴때 dynamic이 됨.

const getCachedProducts = nextCache(getInitialProducts, ["home-products"]);

async function getInitialProducts() {
    console.log(1243);
    const products = await db.product.findMany({
        select: {
            title: true,
            price: true,
            created_at: true,
            photo: true,
            id: true,
        },
        //take: 1,
        orderBy: {
            id: "desc",
        },
    });
    return products;
}

/*
export const dynamic = "force-dynamic";
// auto는 최대한 cache(static으로 하려고 함)
// force-dynamic는 새로고침할때마다 강제로 리랜더링
// 즉, force-dynamic를 하면 이 홈페이지가 static이 아니라 dynamic이였으면 한다고 말하는걸 의미함.
// force-dynamic을 하면서도 cache를 사용하여 캐싱이 필요한 fetching은 cache 처리 할 수 있음 <- 추천
*/

export const revalidate = 60;
// revalidate를 사용하면 특정한 시간대를 설정하여 revalidate 시킬 수 있음.
// force-dynamic을 사용하지 않고 revalidate를 사용했기 때문에 홈페이지는 static으로 사용됨.
// revalidate = 60을 사용하면 60초 후에 재검증을 진행함.

// 추가로 또다른 route segment 구성들
// export const runtime = 'nodejs' / 'edge
// 이건 nodejs를 사용할건지 약한 기능인 edge를 사용할건지 선택할 수 있음.

// preferredRegion = 'auto' / 'global' / 'home' 등등 지역을 정할 수 있음.

export default async function Products() {
    const initialProducts = await getInitialProducts();
    const revalidate = async () => {
        "use server";
        revalidatePath("/home");
    };
    return (
        <div>
            <ProductList initialProducts={initialProducts} />
            <form action={revalidate}>
                <button>revalidate</button>
            </form>
            <Link
                href="/products/add"
                className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
            >
                <div className="size-10 bg-neutral-500 rounded-full" />
            </Link>
        </div>
    );
}
