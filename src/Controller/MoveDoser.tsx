import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TbArrowMoveRight } from "react-icons/tb";
import { deviceAtom } from "@/components/others/jotai";
import useSub from "@/components/others/jotai/hooks";
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen";
import { useSetAtom } from "jotai";
import { transaction } from "@/components/others/functions/bluetooth";
import { toast } from "sonner";

const MoveDoser = () => {
    const [params, setParams] = useState<{
        rotation: number;
        direction: "inject" | "eject";
    }>({
        rotation: 0,
        direction: "inject"
    });
    const [loading, setLoading] = useState<null | string>(null);
    const device = useSub(deviceAtom);
    const setDevice = useSetAtom(deviceAtom);

    const act = async () => {
        if (!device.isConnected || device.isBusy) return;

        setLoading("Moving Doser");
        setDevice(prev => ({
            ...prev,
            isBusy: true
        }));

        try {
            const resp = await transaction({
                action: "ROTATE",
                data: params.rotation * (
                    params.direction === "inject" ? 1 : -1
                )
            });
            if (resp === "ACK") {
                toast.success("Doser moved successfully");
            } else {
                toast.error("Failed to move doser. Please try again.");
            }
        } catch (error) {
            console.error("Error moving doser:", error);
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
        <p className="underline flex items-center gap-1 text-xl text-accent-foreground/90 font-medium font-teko">Move Doser <TbArrowMoveRight /></p>
        <div className="flex flex-col gap-2 mt-5">
            <div className="grid grid-cols-3 gap-5 items-center">
                <label htmlFor="rotation" className="text-sm font-medium text-gray-700">Rotation</label>
                <div className="flex items-center gap-3 col-span-2">
                    <Slider id="rotation" value={[params.rotation]} defaultValue={[params.rotation]} onValueChange={e => setParams(prev => ({
                        ...prev,
                        rotation: e[0]
                    }))} max={30} step={.5} />
                    <span className="text-sm text-gray-500 font-semibold">{params.rotation}</span>
                </div>
                <label htmlFor="rotation" className="text-sm font-medium text-gray-700">Direction</label>
                <Select value={params.direction} onValueChange={(value) => setParams(prev => ({
                    ...prev,
                    direction: value as "inject" | "eject"
                }))}>
                    <SelectTrigger size="sm" id="interval" className="w-full col-span-2">
                        <SelectValue placeholder="eg: (inject, eject)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inject">Inject</SelectItem>
                        <SelectItem value="eject">Eject</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button size="sm" className="mt-auto" disabled={!device.isConnected || device.isBusy} onClick={act}>Move<TbArrowMoveRight /></Button>
    </div>
}

export default MoveDoser