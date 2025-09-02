"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import React, { useState } from "react";
import { useFormState } from "react-dom";
import { getUploadUrl, uploadProduct } from "./actions";

export default function AddProduct() {
    const [preview, setPreview] = useState("");
    const [uploadUrl, setUploadUrl] = useState("");
    const [photoId, setPhotoId] = useState("");

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

        const { success, result } = await getUploadUrl();
        if (success) {
            const { id, uploadURL } = result;
            setUploadUrl(uploadURL);
            setPhotoId(id);
        }
    };

    const interceptAction = async (_: any, formData: FormData) => {
        const file = formData.get("photo");
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
        const photoUrl = `https://imagedelivery.net/zAwkQO6bEReNpmM7QzHHXA/${photoId}`;
        formData.set("photo", photoUrl);

        return uploadProduct(_, formData);
    };

    const [state, action] = useFormState(interceptAction, null);

    return (
        <div>
            <form action={action} className="p-5 flex flex-col gap-5">
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
                                {state?.fieldErrors.photo}
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
                    name="title"
                    required
                    placeholder="제목"
                    type="text"
                    errors={state?.fieldErrors.title}
                />
                <Input
                    name="price"
                    required
                    placeholder="가격"
                    type="number"
                    errors={state?.fieldErrors.price}
                />
                <Input
                    name="description"
                    required
                    placeholder="자세한 설명"
                    type="text"
                    errors={state?.fieldErrors.description}
                />
                <Button text="작성완료" />
            </form>
        </div>
    );
}
