import ProductList from "@/components/product-list";
import db from "@/lib/db";
import { unstable_cache as nextCache, revalidatePath } from "next/cache";
import Link from "next/link";

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

export default async function Products() {
    const initialProducts = await getCachedProducts();
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
