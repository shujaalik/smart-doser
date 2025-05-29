import { Button } from "../components/ui/button"
import { FaArrowRight } from "react-icons/fa";
import { LuBluetoothOff, LuBluetooth } from "react-icons/lu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Slider } from "../components/ui/slider"
import { useState } from "react";

const DoctorView = () => {
    const [dose, setDose] = useState(30);
    return <div className="flex flex-col gap-4">
        <div className="flex gap-2">
            <Button>Connect <LuBluetooth /></Button>
            <Button variant={"destructive"}>Disconnect <LuBluetoothOff /></Button>
        </div>
        <div className="flex gap-2 justify-between items-center">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Dose Name</Label>
                <Input id="name" type="text" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="interval">Set Interval</Label>
                <Select>
                    <SelectTrigger id="interval" className="">
                        <SelectValue placeholder="eg: (sec, min, hour)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sec">Seconds</SelectItem>
                        <SelectItem value="min">Minutes</SelectItem>
                        <SelectItem value="hour">Hours</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="dosage" className="flex justify-between">
                    <span>Dosage</span>
                    <span>{dose}ml</span>
                </Label>
                <Slider id="dosage" value={[dose]} defaultValue={[dose]} onValueChange={e => setDose(e[0])} max={100} step={1} />
            </div>
        </div>
        <div className="w-full justify-end flex gap-2">
            <Button>Send to Doser <FaArrowRight /></Button>
        </div>
    </div>
}

export default DoctorView