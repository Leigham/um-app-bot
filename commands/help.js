module.exports = {
  name: 'help',
  description: 'Generic Help Command!',
  execute (message, args) {
    const Discord = require('discord.js')
    const config = require('../config.json')
    const { commands } = message.client
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')

    if (!args.length) {
      embed.setTitle('Here\'s a list of all my commands')
      embed.setDescription(`You can send \`${config.prefix}help [command name]\` to get info on a specific command!`)
      commands.forEach(element => {
        embed.addField(element.name, element.description)
      })

      return message.author.send(embed)
        .then(() => {
          if (message.channel.type === 'dm') return
          message.reply('I\'ve sent you a DM with all my commands!')
            .then(msg => {
              msg.delete({ timeout: 20000 })
            })
            .catch(console.error)
          if (message.channel.type !== 'dm') {
            message.delete()
          }
        })
        .catch(error => {
          console.error(`Could not send help DM to ${message.author.tag}.\n`, error)
          message.reply('it seems like I can\'t DM you! Do you have DMs disabled?')
            .then(msg => {
              if (message.channel.type !== 'dm') {
                message.delete()
              }
              msg.delete({ timeout: 20000 })
            })
            .catch(console.error)
        })
    }
    const name = args[0].toLowerCase()
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

    if (!command) {
      if (message.channel.type !== 'dm') {
        message.delete()
      }
      return message.reply('that\'s not a valid command!')
    }

    embed.setTitle(command.name)
    embed.setDescription(command.description)

    if (command.usage) embed.addField('Usage', `${config.prefix}${command.name} ${command.usage}`)
    if (command.cooldown) embed.addField('Cooldown', `${command.cooldown || 3} second(s)`)
    if (command.example) embed.addField('Example', `${command.example || 3}`)

    message.channel.send(embed)
      .then(msg => {
        if (message.channel.type !== 'dm') {
          message.delete()
        }
        msg.delete({ timeout: 20000 })
      })
      .catch(console.error)
  }
}
