"use client";

import { getMoreProducts } from "@/app/(tabs)/products/actions";
import { useState } from "react";
import ListProduct from "./list-product";

interface productListProps {
    initialProducts: {
        id: number;
        title: string;
        price: number;
        photo: string;
        created_at: Date;
    }[];
}

interface productListProps {}

export default function ProductList({ initialProducts }: productListProps) {
    const [products, setProducts] = useState(initialProducts);
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const onLoadMoreClick = async () => {
        setIsLoading(true);
        const newProducts = await getMoreProducts(page + 1);
        if (newProducts.length !== 0) {
            setPage((prev) => prev + 1);
            setProducts((prev) => [...prev, ...newProducts]); // ... 사용 : [[prev], [newProducts]] -> [prev, newProducts] 각 array의 element들을 풀어줌(js)
        } else {
            setIsLastPage(true);
        }

        setIsLoading(false);
    };

    return (
        <div className="p-5 flex flex-col gap-5">
            {products.map((product) => (
                <ListProduct key={product.id} {...product} />
            ))}
            {isLastPage ? null : (
                <button
                    onClick={onLoadMoreClick}
                    disabled={isLoading}
                    className="text-sm font-semibold bg-orange-500 w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95"
                >
                    {isLoading ? "로딩 중..." : "더 가져오기"}
                </button>
            )}
        </div>
    );
}
