"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { getUploadUrl, uploadProduct } from "./actions";
import { productSchema, ProductType } from "./schema";

export default function AddProduct() {
    const [preview, setPreview] = useState("");
    const [uploadUrl, setUploadUrl] = useState("");

    const [file, setFile] = useState<File | null>(null);
    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
    } = useForm<ProductType>({
        resolver: zodResolver(productSchema),
    });

    // 이미지만 업로드 했는지 확인 필요
    // 파일 최대 사이즈 제한 필요(3 ~ 4mb)
    const onImageChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {
            target: { files },
        } = event;
        if (!files) {
            return;
        }
        const file = files[0];
        const url = URL.createObjectURL(file);
        setPreview(url);
        setFile(file);
        const { success, result } = await getUploadUrl();
        if (success) {
            const { id, uploadURL } = result;
            setUploadUrl(uploadURL);
            setValue(
                "photo",
                `https://imagedelivery.net/zAwkQO6bEReNpmM7QzHHXA/${id}`
            );
        }
    };

    const onSubmit = handleSubmit(async (data: ProductType) => {
        if (!file) {
            return;
        }
        const cloudflareForm = new FormData();
        cloudflareForm.append("file", file);
        const response = await fetch(uploadUrl, {
            method: "POST",
            body: cloudflareForm,
        });
        if (response.status !== 200) {
            return;
        }
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("price", data.price + "");
        formData.append("description", data.description);
        formData.append("photo", data.photo);

        const errors = await uploadProduct(formData);
        // 에러는 프론트에서 이미 처리하고있기 때문에, 백엔드에서 에러가 return될 경우가 극히 적음.
        if (errors) {
            // setError("title", { message: errors.fieldErrors.title });
        }
    });

    const onValid = async () => {
        await onSubmit();
    };

    return (
        <div>
            <form action={onValid} className="p-5 flex flex-col gap-5">
                <label
                    htmlFor="photo"
                    className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
                    style={{
                        backgroundImage: `url(${preview})`,
                    }}
                >
                    {preview === "" ? (
                        <>
                            <div className="size-20 bg-neutral-500 rounded-full" />
                            <div className="text-neural-400 text-sm">
                                사진을 추가해주세요.
                                {errors.photo?.message}
                            </div>
                        </>
                    ) : null}
                </label>
                <input
                    onChange={onImageChange}
                    type="file"
                    id="photo"
                    name="photo"
                    className="hidden"
                />
                <Input
                    required
                    placeholder="제목"
                    type="text"
                    {...register("title")}
                    errors={[errors.title?.message ?? ""]}
                />
                <Input
                    required
                    placeholder="가격"
                    type="number"
                    {...register("price")}
                    errors={[errors.price?.message ?? ""]}
                />
                <Input
                    required
                    placeholder="자세한 설명"
                    type="text"
                    {...register("description")}
                    errors={[errors.description?.message ?? ""]}
                />
                <Button text="작성완료" />
            </form>
        </div>
    );
}
