import {LinkWithCopyBtn} from "@/components/link-with-copy-btn"
import {Button} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import * as api from "@/services/api.gen.ts"
import {zodResolver} from "@hookform/resolvers/zod"
import {useMutation} from "@tanstack/react-query"
import {createFileRoute} from "@tanstack/react-router"
import * as pathlib from "path"
import {useState} from "react"
import {useForm, type SubmitHandler} from "react-hook-form"
import {z} from "zod"

export const Route = createFileRoute("/")({
    component: RouteComponent,
})

const schema = z.object({
    name: z
        .string()
        .min(1, {error: "Name is required"})
        .max(80, {error: "Name is too long"}),
    description: z.string().max(120, {error: "Description is too long"}),
})

function RoomCreationForm() {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            description: "",
        },
    })
    const createRoom = useMutation({
        mutationKey: ["create_room"],
        mutationFn: api.create_room,
    })
    // eslint-disable-next-line func-style
    const onSubmit: SubmitHandler<z.infer<typeof schema>> = (values, e) => {
        e?.preventDefault()
        createRoom.mutate(values)
    }
    if (createRoom.isSuccess && createRoom.data) {
        return (
            <div className="flex w-[80%] max-w-96 flex-col">
                <LinkWithCopyBtn
                    link={pathlib.join(window.location.href, createRoom.data)}
                />
            </div>
        )
    }
    return (
        <Form {...form}>
            <form
                onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
                className="flex w-[80%] max-w-96 flex-col gap-4"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="My confession room"
                                    {...field}
                                    className="rounded-none border-0 border-b-1 bg-transparent pb-[1px] focus:border-b-2 focus:pb-0 focus:ring-0 dark:bg-transparent dark:focus:ring-0"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Only for friends"
                                    {...field}
                                    className="rounded-none border-0 border-b-1 bg-transparent pb-[1px] focus:border-b-2 focus:pb-0 focus:ring-0 dark:bg-transparent dark:focus:ring-0"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    className="mx-auto mt-4"
                    type="submit"
                    size="lg"
                    disabled={createRoom.isPending}
                >
                    Create
                </Button>
            </form>
        </Form>
    )
}

function RouteComponent() {
    const [isCreatingRoom, setIsCreatingRoom] = useState(false)
    if (isCreatingRoom) {
        return (
            <div className="flex h-dvh flex-col items-center justify-center p-4">
                <span className="text-2xl font-medium">Create Confession Room</span>
                <span className="text-muted-foreground mb-8 w-[80%] max-w-96 text-center text-sm">
                    Private anonymous confession rooms. Only those with the link can add
                    or view confessions in this room.
                </span>
                <RoomCreationForm />
            </div>
        )
    }
    return (
        <div className="flex h-dvh flex-col items-center justify-center p-4">
            <span className="text-2xl font-medium">Confession Rooms</span>
            <span className="text-muted-foreground text-sm">
                Private anonymous confession rooms.
            </span>
            <Button
                className="mt-4 mb-1"
                size="lg"
                onClick={() => {
                    setIsCreatingRoom(true)
                }}
            >
                Create Room
            </Button>
        </div>
    )
}
