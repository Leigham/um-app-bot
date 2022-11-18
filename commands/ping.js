module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute (message, args) {
    message.channel.send('Pinging...').then(sent => {
      const { MessageEmbed } = require('discord.js')
      const embed = new MessageEmbed()
        .setTitle('Done.')
        .setDescription(`Pong! **${sent.createdTimestamp - message.createdTimestamp}**ms`)
      message.channel.send(embed)
      sent.delete()
    })
  }
}
