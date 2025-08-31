import {queryClient} from "@/."
import {LinkWithCopyBtn} from "@/components/link-with-copy-btn"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Spinner} from "@/components/ui/spinner"
import {Textarea} from "@/components/ui/textarea"
import * as api from "@/services/api.gen.ts"
import {useMutation, useQuery} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"
import * as fns from "date-fns"
import {useState} from "react"
export const Route = createFileRoute("/$code")({
    component: RouteComponent,
})

function RevokeConfessionDialog({
    code,
    open,
    onOpenChange,
}: {
    code: string
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [token, setToken] = useState("")
    const revoke = useMutation({
        mutationKey: ["revokeConfession"],
        mutationFn: api.revoke_confession,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["confessions", code]})
            onOpenChange(false)
        },
    })
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Revoke a confession</DialogTitle>
                    <DialogDescription>
                        Enter your revocation token to delete the confession.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Revocation Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    <Button
                        disabled={revoke.isPending}
                        onClick={() => revoke.mutate({token})}
                    >
                        Revoke
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ConfessionForm({code}: {code: string}) {
    const [revokeConfessionDialogOpen, setRevokeConfessionDialogOpen] = useState(false)
    const [content, setContent] = useState("")
    const context = JSON.stringify({})
    const submitConfession = useMutation({
        mutationKey: ["submitConfession", code],
        mutationFn: async ({content}: {content: string}) =>
            await api.submit_confession({code, content, context}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["confessions", code]})
        },
    })
    return (
        <div className="bg-card flex flex-col gap-4 rounded-xl p-4">
            <RevokeConfessionDialog
                code={code}
                open={revokeConfessionDialogOpen}
                onOpenChange={setRevokeConfessionDialogOpen}
            />
            <div className="flex flex-col">
                <span className="text-lg font-medium">Make a Confession</span>
                <Button
                    variant="link"
                    size="sm"
                    className="mr-auto p-0 opacity-50"
                    onClick={() => {
                        setRevokeConfessionDialogOpen(true)
                    }}
                >
                    Revoke a confession
                </Button>
                {submitConfession.isSuccess && submitConfession.data ?
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                            Use this token to revoke your last confession, note it down
                            somewhere
                        </span>
                        <span className="font-mono">{submitConfession.data.token}</span>
                    </div>
                :   <span className="text-muted-foreground text-sm">
                        After submitting a confession, you will receive a token to
                        revoke (delete) it later if you wish.
                    </span>
                }
            </div>
            <Textarea
                placeholder="What's on your mind?"
                maxLength={500}
                showCounter={true}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <Button
                disabled={submitConfession.isPending || !content}
                onClick={() => submitConfession.mutate({content})}
            >
                Submit
            </Button>
        </div>
    )
}

function RouteComponent() {
    const {code} = Route.useParams()
    const confessions = useQuery({
        queryKey: ["confessions", code],
        queryFn: async () => await api.get_confession_room({code}),
    })

    if (confessions.isLoading) {
        return (
            <div className="flex h-dvh w-full items-center justify-center">
                <Spinner size="large" />
            </div>
        )
    }

    if (!confessions.data) {
        return (
            <div className="flex h-dvh w-full flex-col items-center justify-center">
                <span className="text-muted-foreground text-4xl font-medium opacity-50">
                    404
                </span>
                <span className="text-muted-foreground text-sm">Room not found</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="bg-card flex flex-col rounded-xl p-4">
                <span className="text-3xl font-medium">{confessions.data.name}</span>
                {confessions.data.description && (
                    <span className="text-muted-foreground mt-1 text-sm">
                        {confessions.data.description}
                    </span>
                )}
                <div className="mt-4" />
                <LinkWithCopyBtn link={window.location.href} />
            </div>
            <ConfessionForm code={code} />
            {confessions.data.confessions.map((confession) => (
                <div
                    key={confession.id}
                    className="bg-card flex flex-col rounded-xl p-4"
                >
                    <span>{confession.content}</span>
                    <span className="text-muted-foreground mt-2 text-xs">
                        {fns.formatDistanceToNow(new Date(confession.created_at), {
                            addSuffix: true,
                        })}
                    </span>
                </div>
            ))}
        </div>
    )
}
