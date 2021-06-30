const cron = require("node-cron");
const puppeteer = require("puppeteer");
const axios = require("axios");
const nodemailer = require("nodemailer");
require("dotenv").config();

/*
	Gets an item's name and current price from the given url (only works on Amazon.com for now)
	@param url - must be a string starting with amazon.com/, the url of the product that you want to track
	@return - if the url is valid and the price and name are usable, returns an object with name and price. Otherwise, null
*/
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

/*
	Checks all the items in the db to get the price and email the user if the price has dropped.
*/
const checkPrices = async () => {
	// Check if item is available
	// Check if item is different price
	// Update current price if changes, if lower email
	return;
};

/*
	Sends an email to the user's email with the new price and a link to the item
	@param product - the name of the product that is being tracked
	@param price - the new lower price of the product (in a number)
	@param url - the url of the item being tracked
	@param email - the email address to send the item information to
*/
const sendPriceMail = async (product, price, url, email) => {
	// Send email with "Price Drop - product"
	// Give item, price, original price (discount?), and url
	return;
};

/*
	Tries to get an item's info and tries to log the info to the database
	@param email - the user's email to send a message to if the price drops
	@param url - the url of the item to be tracked
*/
const logNewPrice = async (email, url) => {
	const item = await getItem(url);
	if (item === null) {
		console.log(
			"\n[-]\tI'm sorry, there's no item or the item is invalid at that url.\n[-]\tPlease double check that you have the right link.\n",
		);
		return;
	}

	try {
		price = item.price.match(/[0-9]+.[0-9]+/g)[0];
		const res = await axios.post(`${process.env.DB_URL}/prices.json`, {
			email,
			url,
			name: item.name,
			original_price: Number(price),
			current_price: Number(price),
		});

		if (res.status !== 200 || res.statusText !== "OK") {
			throw new Error("Server error");
		}

		console.log(`\n[+]\t ${item.name}`);
		console.log(`[+]\t added at price ${price}\n`);
		return;
	} catch (err) {
		console.log(err.message);
		console.log(
			"\n[-]\tWe're having server issues right now.\n[-]\tPlease try again later!\n",
		);
		return;
	}
};

// Schedule for every morning
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
