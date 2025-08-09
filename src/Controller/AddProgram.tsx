import { Button } from "@/components/ui/button"
// import { Slider } from "@/components/ui/slider";
import { FaRegSave } from "react-icons/fa";
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
        mlPerMin: number;
    }>({
        name: "",
        dose: 0,
        mlPerMin: 1
    });

    const handleSave = async () => {
        setLoading("Saving Program");
        try {
            if (!params.name || params.dose <= 0 || params.mlPerMin <= 0) {
                toast.error("Please fill all fields correctly.");
                setLoading(null);
                return;
            }
            await set(`programs/${params.name}`, {
                name: params.name,
                dose: params.dose,
                mlPerMin: params.mlPerMin
            });
            setParams({
                name: "",
                dose: 0,
                mlPerMin: 1
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
                </div>
                <label htmlFor="rotation" className="text-sm font-medium text-gray-700">Speed ml/min</label>
                <div className="flex items-center gap-3 col-span-2">
                    <Input className="text-sm h-8" placeholder="ml/min" type="number" step={1} min={1} value={params.mlPerMin || ""} onChange={e => setParams(prev => ({
                        ...prev,
                        mlPerMin: parseInt(e.target.value) || 0
                    }))} />
                </div>
            </div>
        </div>
        <Button onClick={handleSave} size="sm" className="mt-5">Save<FaRegSave /></Button>
    </div>
}

export default AddProgram//