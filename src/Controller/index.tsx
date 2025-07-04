import { useSetAtom } from "jotai"
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Button } from "@/components/ui/button"
import { LuBluetooth, LuBluetoothOff, LuWifi } from "react-icons/lu";
import { deviceAtom, store } from "@/components/others/jotai"
import { connectToBluetoothDevice, disconnectFromBluetoothDevice, transaction, verifyBluetoothDevice } from "@/components/others/functions/bluetooth"
import useSub from "@/components/others/jotai/hooks"
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen"
import { AiOutlineStop } from "react-icons/ai";
import { useEffect, useState } from "react"
import { toast } from "sonner"
import InsertDose from "./InsertDose";
import AddProgram from "./AddProgram";
import RunProgram from "./RunProgram";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import mqtt, { type IClientOptions, type MqttClient } from "mqtt";

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
                            {!device.isConnected ? <>
                                {isDoctor && <ConnectMQTTModal />}
                                <Button size="sm" onClick={connect} disabled={device.isBusy}>Connect <LuBluetooth /></Button>
                            </>
                                : <Button size="sm" variant={"destructive"} className="text-white" onClick={disconnect} disabled={device.isBusy}>Disconnect <LuBluetoothOff /></Button>}
                            <Button size="sm" variant={"destructive"} className="text-white" disabled={!device.isConnected || device.isBusy} onClick={stop}>Stop <AiOutlineStop /></Button>
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

const ConnectMQTTModal = () => {
    const device = useSub(deviceAtom);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<null | string>(null);
    const [scannedDevices, setScannedDevices] = useState<{
        [machineID: string]: string
    }>({});
    const [client, setClient] = useState<MqttClient | null>(null);

    useEffect(() => {
        try {
            const options: IClientOptions = {
                clientId: 'react_mqtt_' + Math.random().toString(16).substr(2, 8),
                protocol: "wss",
                port: 8884,
            };
            const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', options);
            client.on("connect", () => {
                setClient(client);
                client.subscribe(`doser_to_client/broadcast`, (err) => {
                    if (err) {
                        console.error("Failed to subscribe to MQTT topic:", err);
                        setClient(null);
                    } else {
                        console.log("Subscribed to doser_to_client/broadcast");
                    }
                });
            })
            client.on("error", (err) => {
                console.error("MQTT Client Error:", err);
                setClient(null);
            });
            client.on("end", () => {
                console.log("MQTT Client Disconnected");
                setClient(null);
            });
            client.on("message", (topic, message) => {
                const msg = message.toString();
                if (topic === `doser_to_client/broadcast`) {
                    try {
                        const machineID = msg.split("/")[1];
                        setScannedDevices((prev) => ({
                            ...prev,
                            [machineID]: msg
                        }));
                    } catch (error) {
                        console.error("Error parsing MQTT message:", error);
                    }
                } else if (topic.startsWith(`doser_to_client/`)) {
                    const machineID = topic.split("/")[1];
                    if (msg === "ACK") {
                        store.set(deviceAtom, (prev) => ({
                            ...prev,
                            isConnected: true,
                            device: machineID
                        }));
                        setOpen(false);
                        toast.success(`Connected to ${machineID}`);
                        client.end();
                    } else {
                        console.error("Unexpected message received:", msg);
                    }
                }
            });
        } catch (error) {
            console.error("Error initializing MQTT client:", error);
            setClient(null);
        }
    }, [])

    const scanMQTT = async () => {
        if (!client) return;
        try {
            setLoading("Scanning for MQTT devices");
            for (let i = 0; i < 3; i++) {
                client.publish(`client_to_doser/broadcast`, JSON.stringify({
                    action: "SCAN",
                }));
            }
        } catch (error) {
            console.error("Error during MQTT calibration:", error);
        } finally {
            setLoading(null);
        }
    }

    const connect = async (machineID: string) => {
        if (!client) {
            toast.error("MQTT client is not initialized. Please try again.");
            return;
        }
        client.unsubscribe(`doser_to_client/broadcast`, (err) => {
            if (err) {
                console.error("Failed to unsubscribe from MQTT topic:", err);
            }
        });
        client.subscribe(`doser_to_client/${machineID}`, (err) => {
            if (err) {
                console.error("Failed to subscribe to MQTT topic:", err);
                setLoading(null);
                return;
            }
            console.log(`Subscribed to doser_to_client/${machineID}`);
        });
        client.publish(`client_to_doser/${machineID}`, JSON.stringify({
            action: "SYNC"
        }));
    }

    return <Dialog open={open}>
        {loading && <FullScreenLoader text={loading} />}
        <DialogTrigger><Button size="sm" disabled={device.isBusy || client === null} onClick={() => setOpen(true)}>Connect <LuWifi /></Button></DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Connect to MQTT</DialogTitle>
                <DialogDescription>
                    Connect to the MQTT broker to enable remote control and monitoring of the doser.
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
                <Button className="font-semibold uppercase" onClick={scanMQTT} disabled={device.isBusy}>Scan</Button>
            </div>
            <Separator />
            <div className="mt-4">
                {
                    Object.entries(scannedDevices).map(([machineID, topic], index) => (
                        <div key={machineID + index} className="flex items-center justify-between p-3 bg-accent rounded-md">
                            <div>
                                <p className="text-sm font-medium underline">{machineID}</p>
                                <p className="text-xs">{topic}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => connect(machineID)}>Connect</Button>
                            </div>
                        </div>
                    ))}
            </div>
        </DialogContent>
    </Dialog>
}

export default Controller