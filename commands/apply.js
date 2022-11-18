module.exports = {
  name: 'apply',
  description: 'apply!',
  async execute (message, args) {
    const fs = require('fs')
    const Discord = require('discord.js')
    const { prefix } = require('../config.json')
    const applicationsPath = './data/applications/'
    const userApplication = `${applicationsPath}${message.author.id}.json`
    const { application } = require('../data/questions.json')
    if (message.channel.type === 'dm') {
      const embed = new Discord.MessageEmbed()
        .setTitle('Nope')
        .setDescription('You can not apply within dms')
      message.reply(embed)
        .then(msg => {
          if (message.channel.type !== 'dm') {
            message.delete()
          }
          msg.delete({ timeout: 20000 })
        })
        return;
    }
    if (message.member.roles.cache.find(r => r.name.toLowerCase() === 'accepted') !== undefined) {
      const embed = new Discord.MessageEmbed()
        .setTitle('Nope')
        .setDescription('You cant apply if you are already a member')
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
    await fs.access(userApplication, error => {
      if (error) {
        // -- Check if the bot can pm the user
        message.author.send('Application Started')
          .then(async msg => {
            const embed = new Discord.MessageEmbed()
              .setTitle(`Registration for member : ${message.author.username}`)
              .setDescription('Thank you for applying to the **Unthinking Majority**! This is a Clan dedicated to finding great personalities. We realize a great personality doesn\'t always have the best account, so our only requirement is 1k Total Level!. Everyone is welcome to join the Clan.\n\n\nNote: Ranks are for loyal Clan Members, If you are consistently out of the Clan Chat you WILL lose your rank.')
              .setColor('#fffff')
              .setFooter(`You can use ${prefix}cancel at any time to exit.`)
            // -- delete the users message, and send an embed, confirming their application was received.
            await msg.edit('', embed).catch(console.error)
            const embed3 = new Discord.MessageEmbed()
              .setTitle(`Registration for member : ${message.author.username}`)
              .setDescription('Enter the answers to the question(s) below.')
              .setColor('#fffff')
            // -- delete the users message, and send an embed, confirming their application was received.
            await msg.channel.send('', embed3).catch(console.error)
            const embed4 = new Discord.MessageEmbed()
              .setTitle('Question 1')
              .setDescription(application[0])
              .setFooter('Please type your answer below, with no prefix')
              .setColor('#fffff')
            // -- delete the users message, and send an embed, confirming their application was received.
            await msg.channel.send('', embed4)
              .then(async msg => {
                // -- create the application for the user.
                const applcation = {
                  name: message.author.tag,
                  uid: message.author.id,
                  questions: [],
                  lastid: msg.id,
                  appmsg: ''
                }

                fs.writeFileSync(userApplication, (JSON.stringify(applcation, undefined, 4)))
                const update = require('../functions/updateStatus.js')
                update.execute(message.client)
                if (message.guild !== null) {
                  const reply = new Discord.MessageEmbed()
                    .setTitle('Application Sent')
                    .setDescription(`${message.author} An application has been sent to your dms, please follow the bots instructions to continue`)
                    .setColor('#fffff')
                  // -- delete the users message, and send an embed, confirming their application was received.
                  await message.channel.send('', reply)
                }
              })
              .catch(console.error)
          })
          .catch(error => {
            console.error(`Could not send help DM to ${message.author.tag}.\n`, error)
            message.reply('it seems like I can\'t DM you! Do you have DMs disabled?')
              .then(msg => { msg.delete({ timeout: 20000 }) })
              .catch(console.error)
          })
        if (message.guild !== null) { message.delete() }
        return
      }

      message.reply(`It seems like you already have an application in progress please check your dms from me, if you would like to restart the applcation pleace cancel the current one with ${prefix}cancel`)
        .then(msg => { msg.delete({ timeout: 20000 }) })
        .catch(console.error)
      if (message.guild !== null) { message.delete() }
    })
  }
}
