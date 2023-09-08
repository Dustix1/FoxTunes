export const command = {
    slash: false,
    name: 'ping',
    description: 'Pong!',
    async execute(message: any, args: any) {
        if (args[0] === 'pong') return message.reply('Ping!');
        await message.reply('Pong.');
    }
}