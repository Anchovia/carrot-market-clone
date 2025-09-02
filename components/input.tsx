import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";

interface FormInputProps {
    errors?: string[];
    name: string;
}

const _Input = (
    {
        errors = [],
        name,
        ...rest
    }: FormInputProps & InputHTMLAttributes<HTMLInputElement>,
    ref: ForwardedRef<HTMLInputElement>
) => {
    return (
        <div className="flex flex-col gap-2">
            <input
                ref={ref}
                className="bg-transparent rounded-md w-full h-10 focus:outline-none ring-2 focus:ring-4 ring-neutral-200 focus:ring-orange-500 border-none placeholder:text-neutral-400 px-3 transition"
                name={name}
                {...rest}
            />
            {errors.map((error, index) => (
                <span key={index} className="text-red-500 font-medium">
                    {error}
                </span>
            ))}
        </div>
    );
};

// react에서 ref를 받았을떄 props의 ref가 아닌 진짜 reference의 ref로 받는법임 !!
// ref를 사용해서 DOM node를 부모 컴퓨넌트에게 노출하게 해줌.
// 즉, ref를 보내는 부모 컴포넌트에 의해 input이 제어될 수 있도록 허용해주는것임.
// 단, react 19 이상의 최신 리액트 버전에서는 fowardRef를 안써도 ref를 인식하여 사용할 수 있음.
export default forwardRef(_Input);
