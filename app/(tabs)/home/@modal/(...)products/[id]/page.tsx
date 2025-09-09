import CloseButton from "@/components/close-button";

// codeChallenge1: CloseButton 컴포넌트를 별도의 파일로 분리하고, 이 컴포넌트는 클라이언트 컴포넌트로 유지하면서, 모달 페이지는 서버 컴포넌트로 유지하기
// codeChallenge2: 모달에 상품 전체 정보 보여주기 및 스켈레톤 만들기

export default async function Modal({ params }: { params: { id: string } }) {
    return (
        <div className="absolute w-full h-full bg-black bg-opacity-60 left-0 top-0 z-50 flex justify-center items-center">
            <div className="max-w-screen-sm w-full flex justify-center h-1/2">
                <CloseButton />
                <div className="aspect-square h-1/2 bg-neutral-700 text-neutral-200 rounded-md flex justify-center items-center">
                    <div className="size-28 bg-neutral-300 rounded-md" />
                </div>
            </div>
        </div>
    );
}
