module.exports = {
  name: 'deny',
  description: 'deny!',
  async execute (message, args) {
    const Discord = require('discord.js')
    const fs = require('fs')
    const applicationsPath = './data/applications/'
    const config = require('../config.json')
    const { application } = require('../data/questions.json')
    if (message.member.roles.cache.find(r => r.name.toLowerCase() === 'application processor') === undefined) {
      const embed = new Discord.MessageEmbed()
        .setTitle('Nope')
        .setDescription('You dont have permission to do that.')
      message.reply(embed)
        .then(msg => {
          if (message.channel.type !== 'dm') {
            message.delete()
          }
          msg.delete({ timeout: 20000 })
        })
        .catch(console.error)
      return
    }
    if (args.length < 1) {
      const embed = new Discord.MessageEmbed()
        .setTitle('Nope')
        .setDescription('You must enter an application id to deny an application')
      message.channel.send(embed)
        .then(msg => {
          if (message.channel.type !== 'dm') {
            message.delete()
          }
          msg.delete({ timeout: 20000 })
        })
        .catch(console.error)
      return
    }

    const shortcuts = JSON.parse(await fs.readFileSync('./appshortcuts.json'))
    const userid = shortcuts.shortcuts[args[0]]
    args.splice(0, 1)
    const notes = args.join(' ')
    const userApplication = `${applicationsPath}${userid}.json`
    await fs.access(userApplication, async error => {
      if (error) {
        const embed = new Discord.MessageEmbed()
          .setTitle('Nope!')
          .setDescription('There is not an application in progress with that id, please check and try again.')
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
          const member = await guild.members.fetch(userid)
          if (msg !== undefined) {
            const denied = await guild.channels.cache.get(config.denied)
            const embed = new Discord.MessageEmbed()
              .setThumbnail(msg.embeds[0].thumbnail.url)
              .setTitle(`Denied Application : ${message.author.username}`)
              .setDescription(`${message.author} has denied the application from <@${userid}>\nNotes : ${notes}`)
              .setColor('#fffff')

            for (let index = 0; index < application.length; index++) {
              embed.addField(`${index + 1}) ${application[index]}`, userjson.questions[index], true)
            };

            denied.send(embed)
            const addrole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'denied')
            const remrole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'applicant')
            member.roles.add(addrole).catch(console.error)
            member.roles.remove(remrole).catch(console.error)
            const deniedEmbed = new Discord.MessageEmbed()
              .setTitle('Application Denied')
              .setThumbnail(message.author.displayAvatarURL())
              .setDescription(`
                Unfortunately, your application for Member was denied because of the following:\n
                ${notes}
            `)
              .setColor('#fffff')
            member.send(deniedEmbed)
            msg.delete()
          }
        }

        fs.unlink(userApplication, async error => {
          if (error) {
            console.error(error)
          } else {
            console.log('Application Deleted!')
            const update = require('../functions/updateStatus.js')
            update.execute(message.client)
          }
        })
      };
      if (message.guild !== null) { message.delete().catch(console.error) }
    })
  }
}
