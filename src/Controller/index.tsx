import { useSetAtom } from "jotai"
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Button } from "@/components/ui/button"
import { LuBluetooth, LuBluetoothOff, LuLogs, LuWifi } from "react-icons/lu";
import { deviceAtom, refreshLogsAtom, store } from "@/components/others/jotai"
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
import { get } from "@/components/others/firebase/api/db";
import { auth } from "@/components/others/firebase";
import dayjs from "dayjs";

const Controller = ({
    isDoctor
}: {
    isDoctor: boolean;
}) => {
    const [allowedDevices, setAllowedDevices] = useState<string[]>([]);
    const setDevice = useSetAtom(deviceAtom);
    const device = useSub(deviceAtom);
    const refreshLogs = useSub(refreshLogsAtom);
    const [loading, setLoading] = useState<null | string>(null);
    const [refreshPrograms, setRefreshPrograms] = useState(false);
    const [logs, setLogs] = useState<{
        action: string;
        device: string;
        timestamp: number;
        data: object | number | string;
    }[]>([]);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const func = async () => {
            const resp = await get(`users/${uid}/logs`);
            const logsData = resp.val() as {
                [id: string]: {
                    action: string;
                    timestamp: number;
                    device: string;
                    data: object | number | string;
                }
            } | null;
            if (logsData) {
                setLogs(Object.values(logsData));
            }
        }
        func();
    }, [refreshLogs])

    useEffect(() => {
        const fetchAllowedDevices = async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            const resp = await get(`users/${uid}/devices`);
            const data = resp.val() as string[] | null;
            if (data) {
                setAllowedDevices(data);
            }
        }
        fetchAllowedDevices();

        return () => {
            setAllowedDevices([]);
        }
    }, [])

    const connect = async () => {
        setLoading("Connecting");
        setDevice((prev) => ({
            ...prev,
            isBusy: true
        }));
        try {
            await connectToBluetoothDevice();
            setLoading("Verifying Device");
            await verifyBluetoothDevice(allowedDevices);
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
            <Card className="max-w-7xl">
                <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-2xl font-bold">
                                Doser Configuration
                            </CardTitle>
                            <CardDescription className="mt-[-5px]">Configure/Use Connected Doser</CardDescription>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Dialog>
                                <DialogTrigger><Button size="sm" variant="outline" disabled={logs.length === 0}>Logs <LuLogs /></Button></DialogTrigger>
                                <DialogContent className="z-60">
                                    <DialogHeader>
                                        <DialogTitle>Activity Logs</DialogTitle>
                                        <DialogDescription>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="relative mx-auto w-full">
                                        <Separator
                                            orientation="vertical"
                                            className="bg-muted absolute left-2 top-4"
                                        />
                                        {logs.map((log, index) => (
                                            <div key={index} className="relative mb-10 pl-8 font-poppins">
                                                <div className="bg-foreground absolute left-0 top-3.5 flex size-4 items-center justify-center rounded-full" />
                                                <h4 className="rounded-xl py-2 text-xl font-bold tracking-tight xl:mb-4 xl:px-3">
                                                    {log.action}
                                                </h4>

                                                <Card className="my-5 border-none shadow-none">
                                                    <CardContent className="px-0 xl:p-2">
                                                        <p className="text-xs">Time: <strong>{dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}</strong></p>
                                                        <p className="text-xs">Device: <strong>{log.device}</strong></p>
                                                        <p className="text-xs">Action: <strong>
                                                            {log.action === "INSERT_DOSE" ?
                                                                ((log.data as { dose: number }).dose) > 0 ? ` Injected ${(log.data as { dose: number }).dose}ml` : ` Ejected ${Math.abs((log.data as { dose: number }).dose)}ml` :
                                                                typeof log.data === "object" ?
                                                                    <pre>{JSON.stringify(log.data, null, 2)}</pre>
                                                                    : `Performed ${log.data}`
                                                            }</strong>
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                            {!device.isConnected ? <>
                                {isDoctor && <ConnectMQTTModal allowedDevices={allowedDevices} />}
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

const ConnectMQTTModal = ({
    allowedDevices
}: {
    allowedDevices: string[];
}) => {
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
                username: import.meta.env.VITE_MQTT_BROKER_USERNAME,
                password: import.meta.env.VITE_MQTT_BROKER_PASSWORD,
                port: 8083,
            };
            const client = mqtt.connect('wss://mqtt.industrialpmr.com/mqtt', options);
            client.on("connect", () => {
                setClient(client);
                client.subscribe(`smart-doser-225/unit_to_server/#`, (err) => {
                    if (err) {
                        console.error("Failed to subscribe to MQTT topic:", err);
                    } else {
                        console.log("Subscribed to smart-doser-225/unit_to_server/#");
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
                const macAddress = topic.split("/")[2];
                if (msg === "SCAN_ACK") {
                    setLoading(null);
                    setScannedDevices((prev) => ({
                        ...prev,
                        [macAddress]: topic
                    }));
                    console.log("MQTT Scan Acknowledged");
                }
                else if (msg === "ACK") {
                    if (!allowedDevices.includes(macAddress)) {
                        toast.error(`Device ${macAddress} is not allowed. Please contact the administrator.`);
                        return;
                    }
                    store.set(deviceAtom, (prev) => ({
                        ...prev,
                        isConnected: true,
                        device: macAddress
                    }));
                    setOpen(false);
                    toast.success(`Connected to ${macAddress}`);
                    client.end();
                } else {
                    console.error("Unexpected message received:", msg);
                }
            });
        } catch (error) {
            console.error("Error initializing MQTT client:", error);
            setClient(null);
        }
    }, [allowedDevices]);

    const scanMQTT = async () => {
        if (!client) return;
        try {
            setLoading("Scanning for MQTT devices");
            for (let i = 0; i < 3; i++) {
                client.publish(`smart-doser-225/server_to_unit/broadcast`, JSON.stringify({
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
        client.unsubscribe(`smart-doser-225/unit_to_server/#`, (err) => {
            if (err) {
                console.error("Failed to unsubscribe from MQTT topic:", err);
            }
        });
        client.subscribe(`smart-doser-225/unit_to_server/${machineID}`, (err) => {
            if (err) {
                console.error("Failed to subscribe to MQTT topic:", err);
                setLoading(null);
                return;
            }
            console.log(`Subscribed to smart-doser-225/unit_to_server/${machineID}`);
        });
        client.publish(`smart-doser-225/server_to_unit/${machineID}`, JSON.stringify({
            action: "SYNC"
        }));
    }

    return <Dialog open={open}
        onOpenChange={setOpen}>
        {loading && <FullScreenLoader text={loading} />}
        <DialogTrigger><Button size="sm" disabled={device.isBusy || client === null} onClick={() => setOpen(true)}>Connect <LuWifi /></Button></DialogTrigger>
        <DialogContent className="z-60">
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