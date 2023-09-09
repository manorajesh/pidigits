/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	pi_digit_counter: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

import { TwitterApi } from 'twitter-api-v2';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let value = await env.pi_digit_counter.get('n');

		// init n
		if (value === null) {
			await env.pi_digit_counter.put('n', '0');
			value = '0';
		}

		// get pi
		let n = parseInt(value, 10);
		let pi = await fetchPi(n);

		// post with OAuth1.0a (User Context)
		const userClient = new TwitterApi({
			appKey: '--',
			appSecret: '--',
			accessToken: '--',
			accessSecret: '--',
		});
		
		let clientV2 = userClient.v2;

		if (pi !== "Error") {
			n++;
			await env.pi_digit_counter.put('n', n.toString());
		}

		return new Response(`${pi}`);
	},
};

async function fetchPi(n: number): Promise<string> {
	try {
		const response = await fetch(`https://api.pi.delivery/v1/pi?start=${n}&numberOfDigits=1`);
		const data: PiResponse = await response.json();
		return data.content;
	} catch (error) {
		console.error('Error:', error);
		return "Error";
	}
}

type PiResponse = {
	content: string;
};