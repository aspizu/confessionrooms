export const config = {apiPrefix: "/"}
async function callApi<T>(name: string, parameters: any): Promise<T> {
    const response = await fetch(`${config.apiPrefix}${name}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(parameters),
        credentials: "include",
    })
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
}

export async function create_room(
    parameters: CreateRoomParameters,
): Promise<string | null> {
    return callApi<string | null>("create-room", parameters)
}

export async function get_confession_room(
    parameters: GetConfessionRoomParameters,
): Promise<GetConfessionRoomResponse | null> {
    return callApi<GetConfessionRoomResponse | null>("get-confession-room", parameters)
}

export async function submit_confession(
    parameters: SubmitConfessionParameters,
): Promise<SubmitConfessionResponse | null> {
    return callApi<SubmitConfessionResponse | null>("submit-confession", parameters)
}

export async function revoke_confession(
    parameters: RevokeConfessionParameters,
): Promise<boolean> {
    return callApi<boolean>("revoke-confession", parameters)
}

export interface SubmitConfessionResponse {
    id: number
    token: string
}
export interface SubmitConfessionParameters {
    code: string
    content: string
    context: string
}
export interface CreateRoomParameters {
    name: string
    description: string
}
export interface RevokeConfessionParameters {
    token: string
}
export interface GetConfessionRoomResponse {
    name: string
    description: string
    confessions: Confession[]
}
export interface GetConfessionRoomParameters {
    code: string
}
export interface Confession {
    id: number
    content: string
    created_at: string
}
