module.exports = {
  execute (client, data) {
    const update = require('../functions/updateStatus.js')
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setUsername('Unthinking Majority')
    client.user.setAvatar('https://cdn.discordapp.com/icons/475139932759916575/eab79f9c80076ed768cbb17a70103b51.webp')
    update.execute(client)
  }
}
