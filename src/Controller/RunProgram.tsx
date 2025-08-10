import { Button } from "@/components/ui/button"
import { IoSettingsOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen";
import { deviceAtom, refreshLogsAtom } from "@/components/others/jotai";
import useSub from "@/components/others/jotai/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { get, push, set } from "@/components/others/firebase/api/db";
import { transaction } from "@/components/others/functions/bluetooth";
import { toast } from "sonner";
import { LuDownload, LuSend, LuTrash } from "react-icons/lu";
import { auth } from "@/components/others/firebase";
import { serverTimestamp } from "firebase/database";
import { useSetAtom } from "jotai";

const RunProgram = ({
    refreshPrograms
}: {
    refreshPrograms: boolean;
}) => {
    const device = useSub(deviceAtom);
    const [loading, setLoading] = useState<null | string>(null);
    const [programs, setPrograms] = useState<{
        name: string;
        vtbi: number;
        flow_rate: number;
    }[] | null>(null);
    const setlogsRefresh = useSetAtom(refreshLogsAtom);

    const makeLog = async (program: {
        name: string;
        vtbi: number;
        flow_rate: number;
    }) => {
        const { uid } = auth.currentUser || {};
        if (!uid) return;
        await push(`users/${uid}/logs`, {
            action: "RUN_PROGRAM",
            device: device.macAddress,
            timestamp: serverTimestamp(),
            data: program
        });
        setlogsRefresh(prev => !prev);
    }

    const getData = async () => {
        if (!device.isConnected) {
            setPrograms(null);
            return;
        }
        const resp = await get(`devices/${device.macAddress}/programs`);
        const data = resp.val();
        const programsList = Object.keys(data || {}).map(key => ({
            name: key,
            vtbi: data[key].vtbi,
            flow_rate: data[key].flow_rate
        }));
        setPrograms(programsList);
    }

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshPrograms, device]);

    const act = async (index: number) => {
        if (!device.isConnected || device.isBusy) return;
        setLoading("Running Program");
        const program = programs?.[index];
        if (!program) return;
        const resp = await transaction({
            action: "RUN_PROGRAM",
            data: {
                name: program.name,
                vtbi: program.vtbi,
                flow_rate: program.flow_rate
            }
        });
        if (resp === "ACK") {
            toast.success("Program started successfully");
            await makeLog(program);
        } else {
            toast.error("Failed to start the program. Please try again.");
        }
        setLoading(null);
    }

    const save = async (index: number) => {
        if (!device.isConnected || device.isBusy) return;
        setLoading("Saving Program");
        const program = programs?.[index];
        if (!program) return;
        const resp = await transaction({
            action: "SAVE_PROGRAM",
            data: {
                name: program.name,
                vtbi: program.vtbi,
                flow_rate: program.flow_rate
            }
        });
        if (resp === "ACK") {
            toast.success("Program saved successfully");
        } else {
            toast.error("Failed to save the program. Please try again.");
        }
        setLoading(null);
    }

    const del = async (index: number) => {
        setLoading("Deleting Program");
        const program = programs?.[index];
        if (!program) return;
        try {
            await set(`devices/${device.macAddress}/programs/${program.name}`, null);
            toast.success("Program deleted successfully");
            setPrograms((prev) => prev?.filter((_, i) => i !== index) || null);
        } catch (error) {
            console.error("Error deleting program:", error);
            toast.error("Failed to delete the program. Please try again.");
        } finally {
            setLoading(null);
        }
    }


    return <div className="h-full flex flex-col w-full gap-4">
        {loading && <FullScreenLoader text={loading} />}
        <p className="underline flex items-center gap-1 text-xl text-accent-foreground/90 font-medium font-teko">Run Program <IoSettingsOutline /></p>
        <ScrollArea className="h-50 w-full flex flex-col gap-2">
            <div className="flex flex-col gap-2">
                {programs !== null && programs.length !== 0 ? programs.map((program, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-md">
                        <div>
                            <p className="text-sm font-medium underline">{program.name}</p>
                            <p className="text-xs">VTBI: <strong>{program.vtbi}ml</strong>
                                <br />
                                Rate: <strong>{program.flow_rate} ml/h</strong></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" disabled={!device.isConnected || device.isBusy} onClick={() => save(index)}><LuDownload /></Button>
                            <Button size="sm" disabled={!device.isConnected || device.isBusy} onClick={() => act(index)}><LuSend /></Button>
                            <Button size="sm" variant="destructive" className="text-white" onClick={() => del(index)}><LuTrash /></Button>
                        </div>
                    </div>
                )) : "Not Found"}
            </div>
        </ScrollArea>
    </div>
}

export default RunProgram