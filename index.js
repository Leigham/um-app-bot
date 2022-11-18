const Discord = require('discord.js')
const client = new Discord.Client()
const auth = require('./auth.json')
const fs = require('fs')
const handlers = ['message', 'ready', 'guildMemberAdd']
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command)
}

// -- Setting up the handlers
handlers.forEach(handler => {
  client.on(handler, data => {
    require(`./handlers/${handler}.js`).execute(client, data)
  })
})

client.login(auth.token)
