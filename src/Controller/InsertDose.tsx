import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deviceAtom } from "@/components/others/jotai";
import useSub from "@/components/others/jotai/hooks";
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen";
import { useSetAtom } from "jotai";
import { transaction } from "@/components/others/functions/bluetooth";
import { toast } from "sonner";
import { BiInjection } from "react-icons/bi";

const InsertDose = ({
    isDoctor
}: {
    isDoctor: boolean;
}) => {
    const [params, setParams] = useState<{
        dose: number;
        direction: "inject" | "eject";
    }>({
        dose: 0,
        direction: !isDoctor ? "eject" : "inject"
    });
    const [loading, setLoading] = useState<null | string>(null);
    const device = useSub(deviceAtom);
    const setDevice = useSetAtom(deviceAtom);

    const act = async () => {
        if (!device.isConnected || device.isBusy) return;

        setLoading("Injecting Dose");
        setDevice(prev => ({
            ...prev,
            isBusy: true
        }));

        try {
            const resp = await transaction({
                action: "INSERT_DOSE",
                data: params.dose * (
                    params.direction === "inject" ? 1 : -1
                )
            });
            if (resp === "ACK") {
                toast.success("Dose injected successfully");
            } else {
                toast.error("Failed to inject dose. Please try again.");
            }
        } catch (error) {
            console.error("Error injecting dose:", error);
            toast.error("An error occurred while injecting the dose. Please try again.");
        } finally {
            setLoading(null);
            setDevice(prev => ({
                ...prev,
                isBusy: false
            }));
        }
    }

    return <div className="h-full flex flex-col justify-between">
        {loading && <FullScreenLoader text={loading} />}
        <p className="underline flex items-center gap-1 text-xl text-accent-foreground/90 font-medium font-teko">Inject Dose <BiInjection /></p>
        <div className="flex flex-col gap-2 mt-5">
            <div className="grid grid-cols-3 gap-5 items-center">
                <label htmlFor="rotation" className="text-sm font-medium text-gray-700">Dose</label>
                <div className="flex items-center gap-3 col-span-2">
                    <Slider id="rotation" value={[params.dose]} defaultValue={[params.dose]} onValueChange={e => setParams(prev => ({
                        ...prev,
                        dose: e[0]
                    }))} max={20} step={.1} />
                    <span className="text-sm text-gray-500 font-semibold">{params.dose}ml</span>
                </div>
                <label htmlFor="rotation" className="text-sm font-medium text-gray-700">Direction</label>
                <Select value={params.direction} onValueChange={(value) => setParams(prev => ({
                    ...prev,
                    direction: value as "inject" | "eject"
                }))}>
                    <SelectTrigger size="sm" id="interval" disabled={!isDoctor} className="w-full col-span-2">
                        <SelectValue placeholder="eg: (inject, eject)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inject">Inject</SelectItem>
                        <SelectItem value="eject">Eject</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button size="sm" className="mt-5" disabled={!device.isConnected || device.isBusy} onClick={act}>Perform<BiInjection /></Button>
    </div>
}

export default InsertDose