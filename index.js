const cron = require("node-cron");
const puppeteer = require("puppeteer");
const axios = require("axios");
const nodemailer = require("nodemailer");
require("dotenv").config();

const getItem = async url => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	let item;

	try {
		await page.goto(url);
		item = await page.evaluate(() => {
			const name = document.querySelector("#productTitle");

			let price_selector = document.querySelector("#priceblock_ourprice");
			if (price_selector === null) {
				price_selector = document.querySelector("#priceblock_dealprice");
			}
			return {
				name: name.innerText,
				price: price_selector.innerText,
			};
		});
		if (
			!item.name ||
			!item.price ||
			item.name.length === 0 ||
			item.price.length === 0
		) {
			throw new Error("Error!");
		}
	} catch (err) {
		console.log(err.message);
	}

	await browser.close();
	if (item) return item;
	return null;
};

const checkPrices = async () => {
	return;
};

const sendPriceMail = async (product, price, url, email) => {
	return;
};

const logNewPrice = async (email, url) => {
	const item = await getItem(url);
	if (item === null) {
		console.log(
			"\n[-]\tI'm sorry, there's no item or the item is invalid at that url.\n[-]\tPlease double check that you have the right link.\n",
		);
		return;
	}

	try {
		const res = await axios.post(`${process.env.DB_URL}/prices.json`, {
			email,
			url,
			name: item.name,
			price: Number(item.price.match(/[0-9]+.[0-9]+/g)[0]),
		});
		if (res.status !== 200 || res.statusText !== "OK") {
			throw new Error("Server error");
		}
		console.log(`\n[+]\t ${item.name}`);
		console.log(`[+]\t added at price ${item.price}\n`);
		return "OK";
	} catch (err) {
		console.log(err.message);
		console.log(
			"\n[-]\tWe're having server issues right now.\n[-]\tPlease try again later!\n",
		);
		return "ERROR";
	}
};

// cron.schedule("* * * * *", () => {
// 	console.log("running a task every minute");
// });

const test = async () => {
	const item = await logNewPrice(
		"dax@dax.com",
		"https://www.amazon.com/dp/B07JXTFJVB?tag=georiot-us-default-20&th=1&psc=1&ascsubtag=cbq-us-1298475855091195600-20&geniuslink=true",
	);
};

test();
