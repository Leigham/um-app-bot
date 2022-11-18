
module.exports = {
  async execute (client, data) {
    data.guild.channels.cache.find(i => i.name === 'welcome').send(`Welcome ${data}`)
      .then(msg => {
        msg.delete({ timeout: 20000 })
      })
      .catch(console.error)
  }
}
