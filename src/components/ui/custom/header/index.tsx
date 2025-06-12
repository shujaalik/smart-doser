import { useState } from "react";
import { Button } from "../../button"
import FullScreenLoader from "../loader/FullScreen";
import { useTheme } from "../theme-provider";
import Clock from "./Clock";
import { IoSunnyOutline, IoMoonOutline, IoLogOutOutline } from "react-icons/io5";
import { signOut } from "@/components/others/firebase/api/auth";
import { toast } from "sonner";

const Header = () => {
    const { setTheme, theme } = useTheme();

    const toggleColorMode = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    return <div className="flex w-full justify-between items-center">
        <div>
            <Clock />
            {/* <h1 className="uppercase font-teko scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-4xl">
                Smart Doser
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Smart Doser control application</p> */}
        </div>
        <div className="flex justify-center items-center gap-4">
            <Logout />
            <Button size={"icon"} variant={"outline"} onClick={toggleColorMode}>
                {theme === "dark" ? <IoSunnyOutline />
                    : <IoMoonOutline />}
            </Button>
        </div>
    </div>
}

const Logout = () => {
    const [loading, setLoading] = useState<string | null>(null);

    const handleLogout = async () => {
        setLoading("Logging out");
        try {
            await signOut();
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to log out. Please try again.");
        } finally {
            setLoading(null);
        }
    }

    return <>
        {loading && <FullScreenLoader text={loading} />}
        <Button size={"icon"} variant={"destructive"} className="text-white" onClick={handleLogout}>
            <IoLogOutOutline />
        </Button>
    </>
}

export default Header