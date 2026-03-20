import React, { useCallback, useState } from "react"
import toast from "react-hot-toast"

interface ClickCopyProps {
    text: string
    onCopied?: () => void
    children: React.ReactElement<{ className?: string; children?: React.ReactNode }>
}

export default function ClickCopy({ text, onCopied, children }: ClickCopyProps) {
    const [copied, setCopied] = useState(false)
    const [pressed, setPressed] = useState(false)

    const handleCopy = useCallback(async () => {
        if (!text) return
        try {
            await navigator.clipboard.writeText(text)
            toast.success("Copied!")
            onCopied?.()
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error("Could not copy — please copy manually.")
        }
    }, [text, onCopied])

    const cloned = React.cloneElement(children, {
        className: [
            children.props.className ?? "",
            "transition-all duration-150 select-none",
            copied ? "opacity-70" : "opacity-100",
            pressed ? "scale-95" : "scale-100",
        ].join(" "),
        children: copied ? "✓ Copied" : children.props.children,
    })

    return (
        <span
            onClick={handleCopy}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            className="cursor-copy contents"
        >
            {cloned}
        </span>
    )
}