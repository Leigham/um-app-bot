module.exports = {
  execute (client, msg) {
    const { prefix } = require('../config.json')
    if (!msg.content.startsWith(prefix) || msg.author.bot) {
      if (msg.author.bot) return
      if (msg.channel.type === 'dm') {
        require('../functions/applicationhandler').execute(msg)
      }
      return
    };

    const args = msg.content.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    if (!client.commands.has(command)) return

    try {
      client.commands.get(command).execute(msg, args)
    } catch (error) {
      console.error(error)
      msg.reply('there was an error trying to execute that command!')
    }
  }
}
