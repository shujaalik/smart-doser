import { Button } from "@/components/ui/button"
import { IoSettingsOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen";
import { deviceAtom } from "@/components/others/jotai";
import useSub from "@/components/others/jotai/hooks";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { get } from "@/components/others/firebase/api/db";
import { transaction } from "@/components/others/functions/bluetooth";
import { toast } from "sonner";

const RunProgram = ({
    refreshPrograms
}: {
    refreshPrograms: boolean;
}) => {
    const device = useSub(deviceAtom);
    const [loading, setLoading] = useState<null | string>(null);
    const [programs, setPrograms] = useState<{
        name: string;
        dose: number;
        interval: "hour" | "minute";
        intervalValue: number;
    }[] | null>(null);

    const getData = async () => {
        const resp = await get("programs");
        const data = resp.val();
        if (data) {
            const programsList = Object.keys(data).map(key => ({
                name: key,
                dose: data[key].dose,
                interval: data[key].interval,
                intervalValue: data[key].intervalValue
            }));
            setPrograms(programsList);
        }
    }

    useEffect(() => {
        getData();
    }, [refreshPrograms]);

    const act = async (index: number) => {
        if (!device.isConnected || device.isBusy) return;
        setLoading("Running Program");
        const program = programs?.[index];
        if (!program) return;
        const resp = await transaction({
            action: "RUN_PROGRAM",
            data: {
                name: program.name,
                dose: program.dose,
                interval: program.interval,
                intervalValue: program.intervalValue
            }
        });
        if (resp === "ACK") {
            toast.success("Program started successfully");
        } else {
            toast.error("Failed to start the program. Please try again.");
        }
        setLoading(null);
    }

    return <div className="h-full flex flex-col w-full gap-4">
        {loading && <FullScreenLoader text={loading} />}
        <p className="underline flex items-center gap-1 text-xl text-accent-foreground/90 font-medium font-teko">Run Program <IoSettingsOutline /></p>
        <ScrollArea className="h-50 w-full flex flex-col gap-2">
            <div className="flex flex-col gap-2">
                {programs !== null ? programs.map((program, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-md">
                        <div>
                            <p className="text-sm font-medium underline">{program.name}</p>
                            <p className="text-xs">Dose: <strong>{program.dose}ml</strong> every <strong>{program.intervalValue} {program.interval}s</strong></p>
                        </div>
                        <Button size="sm" disabled={!device.isConnected || device.isBusy} onClick={() => act(index)}>Run</Button>
                    </div>
                )) : <Spinner />}
            </div>
        </ScrollArea>
    </div>
}

export default RunProgram