import { Button } from "@/components/ui/button"
// import { Slider } from "@/components/ui/slider";
import { FaRegSave } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen";
import { set } from "@/components/others/firebase/api/db";
import { toast } from "sonner";
import { MonitorCog } from "lucide-react";
import dayjs from "dayjs";
import dayjsDuration from "dayjs/plugin/duration";
import useSub from "@/components/others/jotai/hooks";
import { deviceAtom } from "@/components/others/jotai";
dayjs.extend(dayjsDuration);

const AddProgram = ({
    setRefreshPrograms
}: {
    setRefreshPrograms: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const device = useSub(deviceAtom);
    const [loading, setLoading] = useState<null | string>(null);
    const [params, setParams] = useState<{
        name: string;
        vtbi: number;
        flow_rate: number;
    }>({
        name: "",
        vtbi: 0,
        flow_rate: 1
    });

    const seconds = useMemo(() => {
        if (!params.vtbi || !params.flow_rate || params.flow_rate <= 0) return 0;
        return dayjs.duration(params.vtbi / params.flow_rate, "hours").asSeconds();
    }, [params.vtbi, params.flow_rate]);

    const handleSave = async () => {
        setLoading("Saving Program");
        try {
            if (!params.name || params.vtbi <= 0 || params.flow_rate <= 0) {
                toast.error("Please fill all fields correctly.");
                setLoading(null);
                return;
            }
            if (!device.isConnected) {
                return;
            }
            await set(`devices/${device.macAddress}/programs/${params.name}`, {
                name: params.name,
                vtbi: params.vtbi,
                flow_rate: params.flow_rate
            });
            setParams({
                name: "",
                vtbi: 0,
                flow_rate: 1
            });
            setRefreshPrograms(prev => !prev);
            toast.success("Program saved successfully!");
        } catch (error) {
            console.error("Error saving program:", error);
            toast.error("Failed to save the program. Please try again.");
        } finally {
            setLoading(null);
        }
    }

    return <div className="h-full flex flex-col justify-between w-full">
        {loading && <FullScreenLoader text={loading} />}
        <p className="underline flex items-center gap-1 text-xl text-accent-foreground/90 font-medium font-teko">Create Program <MonitorCog /></p>
        <div className="flex flex-col gap-2 mt-5">
            <div className="grid grid-cols-3 gap-5 items-center">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                <div className="flex items-center gap-3 col-span-2">
                    <Input id="name" placeholder="Program Name" className="w-full" onChange={(e) => setParams(prev => ({
                        ...prev,
                        name: e.target.value
                    }))} value={params.name} />
                </div>
                <label htmlFor="vtbi" className="text-sm font-medium text-gray-700">VTBI</label>
                <div className="flex items-center gap-3 col-span-2">
                    <Input className="text-sm h-8" placeholder="VTBI ml" type="number" step={1} min={1} value={params.vtbi || ""} onChange={e => setParams(prev => ({
                        ...prev,
                        vtbi: parseInt(e.target.value) || 0
                    }))} />
                </div>
                <label htmlFor="flow_rate" className="text-sm font-medium text-gray-700">Flow Rate ml/h</label>
                <div className="flex items-center gap-3 col-span-2">
                    <Input className="text-sm h-8" placeholder="ml/h" type="number" step={.1} min={1} value={params.flow_rate || ""} onChange={e => setParams(prev => ({
                        ...prev,
                        flow_rate: parseFloat(e.target.value) || 0
                    }))} />
                </div>
                <label htmlFor="rotation" className="text-sm font-medium text-gray-700">Duration</label>
                <div className="flex items-center gap-3 col-span-2">
                    <p className="text-sm">{dayjs.duration(seconds, "seconds").format("HH:mm:ss")}</p>
                </div>
            </div>
        </div>
        <Button onClick={handleSave} size="sm" className="mt-5">Save<FaRegSave /></Button>
    </div>
}

export default AddProgram//