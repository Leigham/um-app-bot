module.exports = {
  async execute (message, args) {
    const fs = require('fs')
    const { MessageEmbed } = require('discord.js')
    const { prefix } = require('../config.json')
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
      if (userjson.appmsg !== '') return
      if (message.content.length > 900) {
        const embed = new MessageEmbed()
          .setTitle('Nope!')
          .setDescription('Your message is too long (blame discord)')
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
      userjson.questions.push(message.content)
      if (userjson.questions.length === application.length) {
        const embed = new MessageEmbed()
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
        await fs.writeFileSync(userApplication, (JSON.stringify(userjson, undefined, 4)))
        await message.channel.send('', embed)
          .then(async msg => {
            const userapp = await fs.readFileSync(userApplication)
            const userjson = JSON.parse(userapp)
            userjson.appmsg = msg.id
            fs.writeFileSync(userApplication, (JSON.stringify(userjson, undefined, 4)))
          })
          .catch(console.error)
      } else {
        const embed = new MessageEmbed()
          .setTitle(`Question ${userjson.questions.length + 1}`)
          .setDescription(application[userjson.questions.length])
          .setFooter('Please type your answer below, with no prefix')
          .setColor('#fffff')
        // -- delete the users message, and send an embed, confirming their application was received.
        await message.channel.send('', embed)
        fs.writeFileSync(userApplication, (JSON.stringify(userjson, undefined, 4)))
      }
    })
  }
}
