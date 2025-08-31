import * as React from "react"

import {cn} from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
    maxLength?: number
    showCounter?: boolean
}

function Textarea({
    className,
    maxLength,
    showCounter = false,
    ...props
}: TextareaProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [currentLength, setCurrentLength] = React.useState(0)

    const adjustHeight = React.useCallback(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }, [])

    React.useEffect(() => {
        adjustHeight()
        // Update current length when value prop changes
        const value = (props.value || props.defaultValue || "") as string
        setCurrentLength(value.length)
    }, [adjustHeight, props.value, props.defaultValue])

    function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
        const target = e.target as HTMLTextAreaElement
        setCurrentLength(target.value.length)
        adjustHeight()
        if (props.onInput) {
            props.onInput(e)
        }
    }

    const isOverLimit = maxLength && currentLength > maxLength
    const shouldShowCounter = showCounter || maxLength

    return (
        <div className="relative w-full">
            <textarea
                ref={textareaRef}
                data-slot="textarea"
                className={cn(
                    "placeholder:text-muted-foreground focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full resize-none overflow-hidden rounded-md border-0 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    shouldShowCounter && "pb-8", // Add bottom padding when counter is shown
                    isOverLimit && "border-destructive ring-destructive/20",
                    className,
                )}
                maxLength={maxLength}
                onInput={handleInput}
                {...props}
            />
            {shouldShowCounter && (
                <div className="pointer-events-none absolute right-2 bottom-2">
                    <span
                        className={cn(
                            "text-muted-foreground rounded px-1 py-0.5 text-xs backdrop-blur-sm",
                            isOverLimit &&
                                "text-destructive bg-destructive/10 font-medium",
                        )}
                    >
                        {maxLength ? `${currentLength}/${maxLength}` : currentLength}
                        {isOverLimit && " (limit exceeded)"}
                    </span>
                </div>
            )}
        </div>
    )
}

export {Textarea}
