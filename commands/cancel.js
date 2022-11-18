module.exports = {
  name: 'cancel',
  description: 'cancel!',
  async execute (message, args) {
    const fs = require('fs')
    const Discord = require('discord.js')
    const applicationsPath = './data/applications/'
    const config = require('../config.json')
    const userApplication = `${applicationsPath}${message.author.id}.json`
    if (message.channel.type !== 'dm') {
      const embed = new Discord.MessageEmbed()
        .setTitle('Nope!')
        .setDescription('This command can only be used in dm\'s, if you have an application in progress')
      message.reply(embed)
        .then(msg => {
          msg.delete({ timeout: 20000 })
        })
        .catch(console.error)
      return
    }
    await fs.access(userApplication, async error => {
      if (error) {
        const embed = new Discord.MessageEmbed()
          .setTitle('Nope!')
          .setDescription('You must already have an application in progress to cancel!')
        message.reply(embed)
          .then(msg => {
            if (message.channel.type !== 'dm') {
              message.delete()
            }
            msg.delete({ timeout: 20000 })
          })
          .catch(console.error)
        return
      } else {
        const userapp = await fs.readFileSync(userApplication)
        const userjson = JSON.parse(userapp)

        if (userjson.appmessage !== undefined) {
          const guild = await message.client.guilds.fetch(config.guildid)
          const channel = await guild.channels.cache.get(userjson.appmessage[1])
          const msg = await channel.messages.fetch(userjson.appmessage[2])
          const member = await guild.members.fetch(message.author.id)
          const addrole = guild.roles.cache.find(r => r.name.toLowerCase() === 'applicant')
          member.roles.remove(addrole).catch(console.error)

          if (msg !== undefined) {
            const cancelled = await guild.channels.cache.get(config.cancelled)
            const embed = new Discord.MessageEmbed()
              .setAuthor(message.author.tag)
              .setThumbnail(msg.embeds[0].thumbnail.url)
              .setTitle(`Cancelled Application : ${message.author.username}`)
              .setDescription(`${message.author} has cancelled their their application`)
              .setColor('#fffff')
            cancelled.send(embed)
            msg.delete()
          }
        }

        fs.unlink(userApplication, async error => {
          if (error) {
            console.error(error)
          } else {
            console.log('Application Deleted!')
            const reply = new Discord.MessageEmbed()
              .setTitle('Application Cancelled')
              .setDescription('You have cancelled your application')
              .setColor('#fffff')
            await message.channel.send('', reply)
            const update = require('../functions/updateStatus.js')
            update.execute(message.client)
          }
        })
      };
      if (message.guild !== null) { message.delete() }
    })
  }
}
