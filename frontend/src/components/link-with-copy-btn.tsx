import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"
import {useCopyToClipboard} from "@uidotdev/usehooks"
import {CopyCheckIcon, CopyIcon} from "lucide-react"

export function LinkWithCopyBtn({link}: {link: string}) {
    const [clipboard, copyToClipboard] = useCopyToClipboard()
    const isCopied = clipboard === link
    return (
        <div className="relative flex items-center">
            <Input
                className="text-muted-foreground pointer-events-none rounded-lg border-0 dark:border-0"
                value={link}
                readOnly
            />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        className="absolute right-1 size-7"
                        variant="secondary"
                        onClick={() => {
                            void copyToClipboard(link)
                        }}
                    >
                        {isCopied ?
                            <CopyCheckIcon />
                        :   <CopyIcon />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{isCopied ? "Copied" : "Copy"}</TooltipContent>
            </Tooltip>
        </div>
    )
}
