import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const Footer = () => {
    return (
        <Card className={cn("rounded-none shadow-md")}>
            <CardContent
                className={cn(
                    "px-10 py-4 flex flex-col md:flex-row",
                    "text-center md:text-left justify-between items-center"
                )}
            >
                <p className="opacity-90 text-xs">
                    © {new Date().getFullYear()} - All rights reserved.
                </p>
                <p className="opacity-90 text-xs">
                    Designed and developed by{" "}
                    <a
                        href="https://shujaalik.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-primary transition-colors"
                    >
                        Shuja Ali Kunji
                    </a>.
                </p>
            </CardContent>
        </Card>
    )
}

export default Footer
