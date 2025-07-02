import { Button } from "@/components/ui/button"
// import { Slider } from "@/components/ui/slider";
import { FaRegSave } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen";
import { set } from "@/components/others/firebase/api/db";
import { toast } from "sonner";
import { MonitorCog } from "lucide-react";

const AddProgram = ({
    setRefreshPrograms
}: {
    setRefreshPrograms: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const [loading, setLoading] = useState<null | string>(null);
    const [params, setParams] = useState<{
        name: string;
        dose: number;
        interval: "hour" | "minute";
        intervalValue: number;
    }>({
        name: "",
        dose: 0,
        interval: "hour",
        intervalValue: 1
    });

    const handleSave = async () => {
        setLoading("Saving Program");
        try {
            await set(`programs/${params.name}`, {
                name: params.name,
                dose: params.dose,
                interval: params.interval,
                intervalValue: params.intervalValue
            });
            setParams({
                name: "",
                dose: 0,
                interval: "hour",
                intervalValue: 1
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
                <label htmlFor="dose" className="text-sm font-medium text-gray-700">Dose</label>
                <div className="flex items-center gap-3 col-span-2">
                    <Input className="text-sm h-8" placeholder="Dosage ml" type="number" step={1} min={1} value={params.dose || ""} onChange={e => setParams(prev => ({
                        ...prev,
                        dose: parseInt(e.target.value) || 0
                    }))} />
                    {/* <Slider id="dose" value={[params.dose]} defaultValue={[params.dose]} onValueChange={e => setParams(prev => ({
                        ...prev,
                        dose: e[0]
                    }))} max={20} step={.1} />
                    <span className="text-sm text-gray-500 font-semibold">{params.dose}ml</span> */}
                </div>
                <label htmlFor="rotation" className="text-sm font-medium text-gray-700">Interval</label>
                <div className="grid col-span-2 gap-2 grid-cols-3 items-center">
                    <Select value={params.interval} onValueChange={(value) => setParams(prev => ({
                        ...prev,
                        interval: value as "hour" | "minute"
                    }))}>
                        <SelectTrigger size="sm" id="interval" className="w-full col-span-2">
                            <SelectValue placeholder="eg: (inject, eject)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hour">Hours</SelectItem>
                            <SelectItem value="minute">Minutes</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input id="name" type="number" placeholder="Program Name" className="w-full" onChange={(e) => setParams(prev => ({
                        ...prev,
                        intervalValue: parseInt(e.target.value) || 1
                    }))} value={params.intervalValue} />
                </div>
            </div>
        </div>
        <Button onClick={handleSave} size="sm" className="mt-5">Save<FaRegSave /></Button>
    </div>
}

export default AddProgram//