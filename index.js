const cron = require("node-cron");
const puppeteer = require("puppeteer");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { item_list, email_list } = require("./item_list");
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
			if (price_selector === null) {
				price_selector = document.querySelector("#priceblock_saleprice");
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

	try {
	} catch (err) {}

	return;
};

/*
	Sends an email to the user's email with the new price and a link to the item
	@param product - the name of the product that is being tracked
	@param price - the new lower price of the product (in a number)
	@param url - the url of the item being tracked
	@param email - the email address to send the item information to
*/
const sendPriceMail = async (product, originalPrice, newPrice, url, email) => {
	// Send email with "Price Drop - product"
	// Give item, price, original price (discount?), and url
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
		console.log(process.env.EMAIL_PASS);
		let emailText = `There has been a price drop on item: ${product}!`;
		let htmlText = `\n\nOriginal Price: $${originalPrice}`;
		htmlText += `\nNew Price: $${newPrice}`;
		htmlText += `\n\nLink to item: ${url}`;
		htmlText += "\n\nThanks for using our price tracker!";

		const info = await transporter.sendMail({
			from: '"Price Checker" <helloworldl88t@gmail.com>',
			to: email,
			subject: `Price Drop - ${product}`,
			text: `${emailText}${htmlText}`,
			html: `<b>${emailText}</b>${htmlText}`,
		});
	} catch (err) {
		console.log("Server Error! Please try again later");
		console.log(err.message);
	}
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
	// for (item of item_list) {
	// 	const rand_index = Math.floor(Math.random() * email_list.length);
	// 	await logNewPrice(email_list[rand_index], item);
	// }
	// sendPriceMail("Dell XPS 13", 400, 350, "amazon.com", "test@gmail.com");
};

test();
