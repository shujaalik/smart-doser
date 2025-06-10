import dayjs from "dayjs";
import { useEffect, useState } from "react";

const Clock = () => {
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(dayjs());
        }, 500);

        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <h1 className="flex gap-3 items-center justify-center uppercase font-teko scroll-m-20 text-4xl font-semibold tracking-tight lg:text-6xl opacity-50">
            <span className="flex gap-2 items-start justify-center">
                <span>
                    {time.format("HH:mm")}
                </span>
                <span className="text-xl font-medium tracking-wide mt-[0.5]">
                    {time.format("A")}
                </span>
            </span>
            <span className="flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-normal">
                    {time.format("ddd")}
                </span>
                <span className="text-2xl font-normal tracking-normal mt-[-0.6rem]">
                    {time.format("MMM DD")}
                </span>
            </span>
        </h1>
    )
}

export default Clock