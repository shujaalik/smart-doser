import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "../components/ui/card"
import DoctorView from "./DoctorView"
import { Separator } from "../components/ui/separator"

const Controller = () => {
    return <div className="flex font-poppins justify-center items-center flex-col px-10 py-4 gap-5 w-full">
        <Card className="w-4xl">
            <CardContent className="py-4">
                <Tabs defaultValue="patient">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-2xl font-bold">
                                Doser Configuration
                            </CardTitle>
                            <CardDescription className="mt-[-5px]">Configure/Use Connected Doser</CardDescription>
                        </div>
                        <TabsList className="cursor-pointer">
                            <TabsTrigger value="doctor">Doctor View</TabsTrigger>
                            <TabsTrigger value="patient">Patient View</TabsTrigger>
                        </TabsList>
                    </div>
                    <Separator />
                    <div className="mt-3">
                        <TabsContent value="doctor">
                            <DoctorView />
                        </TabsContent>
                        <TabsContent value="patient">
                            <DoctorView />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    </div>
}

export default Controller