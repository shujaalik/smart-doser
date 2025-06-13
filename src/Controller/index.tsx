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
import { deviceAtom } from "@/components/others/jotai"
import { connectToBluetoothDevice, disconnectFromBluetoothDevice, transaction, verifyBluetoothDevice } from "@/components/others/functions/bluetooth"
import useSub from "@/components/others/jotai/hooks"
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen"
import { AiOutlineStop } from "react-icons/ai";
import { useState } from "react"
import { toast } from "sonner"
import InsertDose from "./InsertDose";
import AddProgram from "./AddProgram";
import RunProgram from "./RunProgram";

const Controller = ({
    isDoctor
}: {
    isDoctor: boolean;
}) => {
    const setDevice = useSetAtom(deviceAtom);
    const device = useSub(deviceAtom);
    const [loading, setLoading] = useState<null | string>(null);
    const [refreshPrograms, setRefreshPrograms] = useState(false);

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

    const stop = async () => {
        if (!device.isConnected || device.isBusy) return;

        setLoading("Stopping Device");
        setDevice((prev) => ({
            ...prev,
            isBusy: true
        }));
        try {
            const resp = await transaction({
                action: "STOP"
            })
            if (resp === "ACK") {
                toast.success("Device stopped successfully");
            } else {
                toast.error("Failed to stop the device. Please try again.");
            }
        } catch (error) {
            console.error("Error stopping device:", error);
            toast.error("An error occurred while stopping the device. Please try again.");
        } finally {
            setLoading(null);
            setDevice((prev) => ({
                ...prev,
                isBusy: false
            }));
        }
    }

    return <>
        {loading && <FullScreenLoader text={loading} />}
        <div className="flex font-poppins justify-center items-center flex-col px-10 py-4 gap-5 w-full">
            <Card className="max-w-4xl">
                <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-2xl font-bold">
                                Doser Configuration
                            </CardTitle>
                            <CardDescription className="mt-[-5px]">Configure/Use Connected Doser</CardDescription>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            {!device.isConnected ? <Button size="sm" onClick={connect} disabled={device.isBusy}>Connect <LuBluetooth /></Button>
                                : <Button size="sm" variant={"destructive"} className="text-white" onClick={disconnect} disabled={device.isBusy}>Disconnect <LuBluetoothOff /></Button>}
                            <Button size="sm" variant={"destructive"} className="text-white" disabled={device.isBusy} onClick={stop}>Stop <AiOutlineStop /></Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="mt-5 min-h-48">
                        <div className="grid grid-cols-1 gap-5 h-full md:grid-cols-2 lg:grid-cols-3">
                            <InsertDose isDoctor={isDoctor} />
                            {isDoctor ? <AddProgram setRefreshPrograms={setRefreshPrograms} /> : null}
                            <div style={{
                                gridColumn: isDoctor ? "span 1" : "span 2"
                            }}>
                                <RunProgram refreshPrograms={refreshPrograms} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </>
}

export default Controller