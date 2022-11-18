module.exports = {
  name: 'edit',
  description: 'edit!',
  async execute (message, args) {
    const fs = require('fs')
    const Discord = require('discord.js')
    const { prefix } = require('../config.json')
    const applicationsPath = './data/applications/'
    const userApplication = `${applicationsPath}${message.author.id}.json`
    const { application } = require('../data/questions.json')
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
          .setDescription('You must already have an application in progress to edit a question!')
        message.reply(embed)
        return
      } else {
        const userapp = await fs.readFileSync(userApplication)
        const userjson = JSON.parse(userapp)
        if (userjson.questions.length !== application.length) {
          const embed = new Discord.MessageEmbed()
            .setTitle('Nope!')
            .setDescription('You must complete the application before editing answers!')
          message.reply(embed)
            .then(msg => {
              if (message.channel.type !== 'dm') {
                message.delete()
              }
              msg.delete({ timeout: 20000 })
            })
            .catch(console.error)
          return
        };
        if (userjson.appmessage !== '' && userjson.appmessage !== undefined) {
          const embed = new Discord.MessageEmbed()
            .setTitle('Nope!')
            .setDescription('You have already sent your application, please wait for a staff member to review.Alternativly, you can `!cancel` your application and use `!apply` to start again')
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
        const index = args[0]
        args.splice(0, 1)
        const newAnswer = args.join(' ')
        if (newAnswer.length > 900) {
          const embed = new Discord.MessageEmbed()
            .setTitle('Nope!')
            .setDescription('Your answer is too long (blame discord)')
          message.reply(embed)
            .then(msg => {
              if (message.channel.type !== 'dm') {
                message.delete()
              }
              msg.delete({ timeout: 20000 })
            })
            .catch(console.error)
          return
        };
        if (newAnswer === '') {
          const embed = new Discord.MessageEmbed()
            .setTitle('Nope!')
            .setDescription('You need to actually enter an answer to replace your current one with!')
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
        if (isNaN(index)) {
          const embed = new Discord.MessageEmbed()
            .setTitle('Nope!')
            .setDescription('Check the index you have entered for the answer, it must be a number')
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
        if ((parseInt(index) - 1) > (application.length - 1)) {
          const embed = new Discord.MessageEmbed()
            .setTitle('Nope!')
            .setDescription('Check the index you have entered for the answer, it must be a question number')
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
        // - replace the current answer of the index
        userjson.questions.splice(parseInt(index) - 1, 1, newAnswer)
        fs.writeFileSync(userApplication, (JSON.stringify(userjson, undefined, 4)))

        // resend the completed application
        const embed = new Discord.MessageEmbed()
          .setTitle('Application Complete')
          .setDescription(`
            You have completed your application, check the answers below.\n
                \`${prefix}send\` to send your application
                \`${prefix}edit # [new answer]\` to edit a question on your application
                \`${prefix}cancel\` to cancel your application
            \n\n
          `)
          .setColor('#fffff')

        for (let index = 0; index < application.length; index++) {
          embed.addField(`${index + 1}) ${application[index]}`, userjson.questions[index])
        };

        // Find the message by id.
        message.channel.messages.fetch(userjson.appmsg || '')
          .then(async message => {
            message.edit(embed)
            const embed1 = new Discord.MessageEmbed()
              .setTitle('Application Edited!')
              .setDescription(`Please check your application again\n${message.url}`)
            message.channel.send(embed1)
              .then(msg => {
                if (message.channel.type !== 'dm') {
                  message.delete()
                }
                msg.delete({ timeout: 20000 })
              })
              .catch(console.error)
          }).catch(console.error)
      }
      if (message.guild !== null) { message.delete() }
    })
  }
}
