import { useSetAtom } from "jotai"
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Button } from "@/components/ui/button"
import { LuBluetooth, LuBluetoothOff } from "react-icons/lu";
import { TbArrowMoveRight } from "react-icons/tb";
import { deviceAtom } from "@/components/others/jotai"
import { connectToBluetoothDevice, disconnectFromBluetoothDevice, verifyBluetoothDevice } from "@/components/others/functions/bluetooth"
import useSub from "@/components/others/jotai/hooks"
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen"
import { useState } from "react"
import { toast } from "sonner"
import MoveDoser from "./MoveDoser";
import InsertDose from "./InsertDose";

const Controller = () => {
    const setDevice = useSetAtom(deviceAtom);
    const device = useSub(deviceAtom);
    const [loading, setLoading] = useState<null | string>(null);

    const connect = async () => {
        setLoading("Connecting");
        setDevice((prev) => ({
            ...prev,
            isBusy: true
        }));
        try {
            await connectToBluetoothDevice();
            setLoading("Verifying Device");
            await verifyBluetoothDevice();
        } catch (error) {
            toast.error("Failed to connect to the device. Please try again.");
            await disconnectFromBluetoothDevice();
            console.error("Error connecting to Bluetooth device:", error);
        } finally {
            setDevice((prev) => ({
                ...prev,
                isBusy: false
            }));
            setLoading(null);
        }
    }

    const disconnect = async () => {
        setLoading("Disconnecting");
        setDevice((prev) => ({
            ...prev,
            isBusy: true
        }));
        try {
            if (device.device) {
                await disconnectFromBluetoothDevice();
            }
            setDevice((prev) => ({
                ...prev,
                isConnected: false,
                device: null
            }));
        } catch (error) {
            toast.error("Failed to disconnect from the device. Please try again.");
            console.error("Error disconnecting from Bluetooth device:", error);
        } finally {
            setDevice((prev) => ({
                ...prev,
                isBusy: false
            }));
            setLoading(null);
        }
    }

    return <>
        {loading && <FullScreenLoader text={loading} />}
        <div className="flex font-poppins justify-center items-center flex-col px-10 py-4 gap-5 w-full">
            <Card className="w-4xl">
                <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-2xl font-bold">
                                Doser Configuration
                            </CardTitle>
                            <CardDescription className="mt-[-5px]">Configure/Use Connected Doser</CardDescription>
                        </div>
                        <div className="flex items-center justify-center">
                            {!device.isConnected ? <Button size="sm" onClick={connect} disabled={device.isBusy}>Connect <LuBluetooth /></Button>
                                : <Button size="sm" variant={"destructive"} className="text-white" onClick={disconnect} disabled={device.isBusy}>Disconnect <LuBluetoothOff /></Button>}
                        </div>
                    </div>
                    <Separator />
                    <div className="mt-5 h-48">
                        <div className="grid grid-cols-3 gap-5 h-full">
                            <MoveDoser />
                            <InsertDose />
                            <div className="h-full flex flex-col justify-between">
                                <p className="underline flex items-center gap-1 text-xl text-accent-foreground/90 font-medium font-teko">Move Doser <TbArrowMoveRight /></p>
                                <Button size="sm" className="mt-auto" disabled={!device.isConnected || device.isBusy}>Move<TbArrowMoveRight /></Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </>
}

export default Controller