import { Spinner } from "../../spinner"

const FullScreenLoader = ({
    text = "Loading",
}) => {
    return <div
        className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-10 bg-popover/50">
        <Spinner size="large">
            {text}...
        </Spinner>
    </div>
}

export default FullScreenLoader