# Blkgrd Bot
The bot for the Blackguard Maplestory Discord server.

## Running the bot locally

Invite the bot to your test server with this url: `https://discord.com/oauth2/authorize?client_id=<botId>&scope=bot&permissions=8`

Create `src/config.json` and `src/ids.json` based on `src/config.example.json` and `src/ids.example.json`

`npm install`

`npm run deploy`

`npm start`

Every time a command is added, removed or the parameters are change you will need to re-run `npm run deploy`
