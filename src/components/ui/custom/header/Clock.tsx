import dayjs from "dayjs";
import { useEffect, useState } from "react";

const Clock = () => {
    const [time, setTime] = useState(dayjs().format("HH:mm:ss"));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(dayjs().format("HH:mm:ss"));
        }, 500);

        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <h4 className="scroll-m-20 text-xl font-medium tracking-tight font-teko">
            {time}
        </h4>
    )
}

export default Clock