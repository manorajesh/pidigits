/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { HmacSHA1, enc } from 'crypto-js';
import OAuth from 'oauth-1.0a';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	pi_digit_counter: KVNamespace;

	APP_KEY: string;
	APP_SECRET: string;
	ACCESS_TOKEN: string;
	ACCESS_SECRET: string;

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

		let tweetStatus = await tweet(env.APP_KEY, env.APP_SECRET, env.ACCESS_TOKEN, env.ACCESS_SECRET);

		if (pi !== "Error" && tweetStatus.ok) {
			// update n
			n++;
			await env.pi_digit_counter.put('n', n.toString());
		}

		return new Response(`pi[${n}] = ${pi}; tweetStatus = ${tweetStatus}`);
	},
};

function hashSha1(baseString: any, key: any) {
	return HmacSHA1(baseString, key).toString(enc.Base64)
}

async function tweet(APP_KEY: string, APP_SECRET: string, ACCESS_TOKEN: string, ACCESS_SECRET: string): Promise<Response> {
	const oauth = new OAuth({
		consumer: { key: APP_KEY, secret: APP_SECRET },
		signature_method: 'HMAC-SHA1',
		hash_function: hashSha1,
	});

	// Will be added to request headers
	const reqAuth = {
		url: "https://api.twitter.com/2/tweets",
		method: 'POST',
	};

	const token = {
		key: ACCESS_TOKEN,
		secret: ACCESS_SECRET,
	};

	var reqBody = JSON.stringify({
		"text": "Hello World!"
	});

	const response = await fetch(reqAuth.url, {
		method: reqAuth.method,
		headers: {
			...oauth.toHeader(oauth.authorize(reqAuth, token)),
			'Content-Type': 'application/json',
		},
		body: reqBody
	});

	return new Response(await response.json());
}

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