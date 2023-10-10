export type CommandMessage = {
    slash: false,
    name: string,
    usage: string,
    description: string,
    hidden?: boolean,
    execute: Function
}

export type CommandSlash = {
    slash: true,
    usage: string,
    data: any,
    hidden?: boolean,
    execute: Function
}