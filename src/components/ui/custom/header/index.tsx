import { Button } from "../../button"
import { useTheme } from "../theme-provider";
import Clock from "./Clock";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";

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
            {/* <ResetAll /> */}
            <Button size={"icon"} variant={"outline"} onClick={toggleColorMode}>
                {theme === "dark" ? <IoSunnyOutline />
                    : <IoMoonOutline />}
            </Button>
        </div>
    </div>
}

export default Header