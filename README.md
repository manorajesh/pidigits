# pi1by1

A simple Twitter bot that tweets a digit of pi everyday at 3:14 UTC.

## Usage
To deploy to Workers, use 
```shell
npx wrangler deploy
```

This will deploy the package along with the `[3 14 * * *]` cron trigger. You will also need to set the `secrets` for the
API keys in order for the bot to post.

### Dev
Use 
```shell
npx wrangler dev
```

This will start a local development server; however, cron triggers don't seem to work in this environment. The `secrets`
are stored in a `.dev.vars` file. A KV preview database will need to be created as well.

## How
Using the Twitter V2 API and their OAuth1.0a User Context authentication, the bot tweets using [this](https://twitter.com/pi1by1) account.
The tweet is scheduled to run using [Cloudflare Workers](https://developers.cloudflare.com/workers/) and their [Cron triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/#cron-triggers)

## Why
I wanted to experiment with Cloudflare Workers before using it for a bigger project. This simple Twitter bot seemed like an interesting one-day opportunity to explore Workers and get knowledgable on the Twitter V2 API.