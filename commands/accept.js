module.exports = {
  name: 'accept',
  description: 'accept!',
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
        .setDescription('You must enter an application id to accept an application')
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
            const accepted = await guild.channels.cache.get(config.accepted)
            const embed = new Discord.MessageEmbed()
              .setThumbnail(msg.embeds[0].thumbnail.url)
              .setTitle(`Accepted Application : ${msg.author.username}`)
              .setDescription(`${message.author} has accepted the application from <@${userid}>\nNotes : ${notes}`)
              .setColor('#fffff')

            for (let index = 0; index < application.length; index++) {
              embed.addField(`${index + 1}) ${application[index]}`, userjson.questions[index], true)
            };
            accepted.send(embed)
            const addrole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'accepted')
            const remrole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'applicant')
            member.roles.add(addrole).catch(console.error)
            member.roles.remove(remrole).catch(console.error)
            const acceptedEmbed = new Discord.MessageEmbed()
              .setTitle('Application Accepted')
              .setThumbnail(msg.embeds[0].thumbnail.url)
              .setDescription(`
                Welcome!
                Welcome New Member!
                
                Your application has been accepted and we hope you have a warm welcoming to the Unthinking Majority! We hope you enjoy your stay with us and we can't wait to see you in game. Don't hesitate to make some friends and start chatting in the cc with us.
                Our homeworld is 342, you'll find the majority of our clan hanging out in here.
                
                Please be sure to share this Discord every now and then to help us grow.
                
                [The invite to this Applications server is posted here!](https://discord.gg/6P7YjCCug4)

                [Here is the link to UM CC’s main Discord Server!](http://discord.gg/9udxEEk)
                
                Go to the clan tab and search "UM" to be able to join as a guest and be able to type within the clan!

                To apply to the clan (and receive your rank), go to your clan tab > settings > apply.
                If the clan is not open for applications, please contact any online mods ingame or on discord for assistance! 
                
                https://imgur.com/a/wVGewfb
                
                https://imgur.com/a/lLDlgzd

                Thank you and see you soon!
              `)
              .setColor('#fffff')

            member.send(acceptedEmbed)
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
