export function formatToWon(price: number): string {
    return price.toLocaleString("ko-KR");
}

export default function formatToTimeAgo(date: string): string {
    const dayInMs = 1000 * 60 * 60 * 24;
    const time = new Date(date).getTime();
    const now = new Date().getTime();
    const diff = Math.round((time - now) / dayInMs);

    const formatter = new Intl.RelativeTimeFormat("ko-KR");

    return formatter.format(diff, "day");
}
