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
			return {
				name: document.querySelector("#productTitle").innerText,
				price: document.querySelector("#priceblock_ourprice").innerText,
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
		console.log("Item does not exist or URL is invalid.");
	}

	await browser.close();
	if (item) return item;
	return null;
};

const checkPrices = async () => {
	return;
};

const sendPriceMail = async (product, price, link) => {
	return;
};

// cron.schedule("* * * * *", () => {
// 	console.log("running a task every minute");
// });

const test = async () => {
	const item = await getItem(
		"https://www.amazon.com/dp/B0941YLJH6/ref=sspa_dk_detail_2?psc=1&pd_rd_i=B0941YLJH6&pd_rd_w=hnd18&pf_rd_p=80360d1c-2d74-4d2e-9034-f92fb5248b33&pd_rd_wg=DuVXj&pf_rd_r=6YVQPNCC1ZGNRZS0JECG&pd_rd_r=4fed79e9-ae18-4251-b210-b386e0a73501&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzTlgzMDBNTFhMOE85JmVuY3J5cHRlZElkPUEwNDU5NzY5SDFKSTlGU1dQN1ZJJmVuY3J5cHRlZEFkSWQ9QTA4MjA0MjMyRUhTM1I1MDZCWVNXJndpZGdldE5hbWU9c3BfZGV0YWlsJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==",
	);
	console.log(item);
};

test();
