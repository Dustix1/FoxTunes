export const command = {
    slash: false,
    name: 'ping',
    usage: '\`\`!ping\nPossible Arguments: pong\`\`',
    description: 'Replies with Pong!',
    async execute(message: any, args: any) {
        if (args[0] === 'pong') return message.reply('Ping!');
        await message.reply('Pong.');
    }
}