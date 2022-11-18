module.exports = {
  name: 'send',
  description: 'send!',
  async execute (message, args) {
    const fs = require('fs')
    const { MessageEmbed } = require('discord.js')
    const config = require('../config.json')
    const { application } = require('../data/questions.json')
    const applicationsPath = './data/applications/'
    const userApplication = `${applicationsPath}${message.author.id}.json`

    await fs.access(userApplication, async error => {
      if (error) {
        console.error(error)
        return
      } // -- applcation does not exist.

      const userapp = await fs.readFileSync(userApplication)
      const userjson = JSON.parse(userapp)
      if (userjson.appmessage !== '' && userjson.appmessage !== undefined) {
        const embed = new MessageEmbed()
          .setTitle('Nope!')
          .setDescription('You have already sent your application, please wait for a staff member to review.')
          .setColor('#fffff')
        // -- delete the users message, and send an embed, confirming their application was received.
        await message.channel.send('', embed)
          .then(msg => {
            if (message.channel.type !== 'dm') {
              message.delete()
            }
            msg.delete({ timeout: 20000 })
          })
          .catch(console.error)
        return
      }
      if (userjson.questions.length === application.length) {
        const shortcuts = JSON.parse(await fs.readFileSync('./appshortcuts.json'))
        shortcuts.index += 1
        shortcuts.shortcuts[shortcuts.index] = message.author.id
        fs.writeFileSync('./appshortcuts.json', (JSON.stringify(shortcuts, undefined, 4)))
        const embed = new MessageEmbed()
          .setTitle(`Member Application : ${message.author.username} (ApplicationID : ${shortcuts.index})`)
          .setThumbnail(message.author.displayAvatarURL())
          .setAuthor(message.author.tag)
          .setDescription(`
              ${message.author} has completed their application, please check their answers below.\n
                  \`${config.prefix}accept ${shortcuts.index} [notes]\` to accept their application
                  \`${config.prefix}deny ${shortcuts.index} [reason]\` to deny their application
              \n\n
            `)
          .setColor('#fffff')

        for (let index = 0; index < application.length; index++) {
          embed.addField(`${index + 1}) ${application[index]}`, userjson.questions[index])
        };
        message.client.channels.fetch(config.applications)
          .then(channel => {
            channel.send(embed)
              .then(msg => {
                userjson.appmessage = [msg.guild.id, msg.channel.id, msg.id]
                fs.writeFileSync(userApplication, (JSON.stringify(userjson, undefined, 4)))
              })
          })
          .catch(console.error)
        const guild = await message.client.guilds.fetch(config.guildid)
        const member = await guild.members.fetch(message.author.id)
        const addrole = guild.roles.cache.find(r => r.name.toLowerCase() === 'applicant')
        member.roles.add(addrole).catch(console.error)
        const reply = new MessageEmbed()
          .setTitle('Application Sent')
          .setDescription('You have sent your application, please wait for a moderator to review your ticket.')
          .setColor('#fffff')
        await message.channel.send('', reply)
      } else {
        const embed = new MessageEmbed()
          .setTitle('Nope!')
          .setDescription('Please Complete Your application before doing that!')
          .setColor('#fffff')
          // -- delete the users message, and send an embed, confirming their application was received.
        await message.channel.send('', embed)
          .then(msg => {
            if (message.channel.type !== 'dm') {
              message.delete()
            }
            msg.delete({ timeout: 20000 })
          })
          .catch(console.error)
      }
    })
  }
}
