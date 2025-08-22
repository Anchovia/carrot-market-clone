"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useFormState } from "react-dom";
import smsLogin from "./action";

const initialState = {
    token: false,
    error: undefined,
};

export default function SMS() {
    const [state, dispatch] = useFormState(smsLogin, initialState);

    return (
        <div className="flex flex-col gap-10 py-8 px-6">
            <div className="flex flex-col gap-2 *:font-medium">
                <h1 className="text-2xl">안녕하세요!</h1>
                <h2 className="text-xl">Verify your phone number.</h2>
            </div>
            <form action={dispatch} className="flex flex-col gap-3">
                {state.token ? (
                    <Input
                        key="token"
                        name="token"
                        type="number"
                        placeholder="Verification Code"
                        required={true}
                        min={100000}
                        max={999999}
                        errors={state.error?.formErrors}
                    />
                ) : (
                    <Input
                        key="phone"
                        name="phone"
                        type="text"
                        placeholder="Phone Number"
                        required={true}
                        errors={state.error?.formErrors}
                    />
                )}
                <Button
                    text={
                        state.token ? "Verify Token" : "Send Verification SNS"
                    }
                />
            </form>
        </div>
    );
}
