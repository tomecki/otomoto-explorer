#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require("fs");

const DEBUG = process.env.DEBUG === "true";
const MAX_PAGES = process.env.MAX_PAGES || 2;
const PUPPETEER_CONFIG = DEBUG? {headless: false, slowMo: 100, devtools: true} : {slowMo: 200};

console.log(`Running harvester, DEBUG set to '${DEBUG}'`);

const crawl = (async (params) => {
    const get_next_page_url = async (page) => {
        return await page.evaluate(() => {
            const next_page_elem = document.querySelector(".om-pager > li.next.abs > a");
            if(next_page_elem) {
                return next_page_elem.attributes["href"].value;
            } else {
                return null;
            }
        });
    };

    const RECOGNIZED_FIELDS_ORDER = Array.from(["otomoto_id", "title", "subtitle", "href", "year", "mileage", "engine", "fuel_type", "price", "price_currency", "price_details", "location_city", "location_region"]);

    const _id = (x) => x;
    const _quote = (x) => JSON.stringify(x);
    const _strip_non_digits = (x) => x.replace(/[\D]/g, "");
    const _strip_braces = (x) => x.replace(/[\(\)]/g, "");

    const RECOGNIZED_FIELDS_POSTPROCESS = {
        "otomoto_id": [_id],
        "title": [_quote],
        "subtitle": [_quote],
        "href": [_id],
        "year": [_id],
        "mileage": [_strip_non_digits],
        "engine": [_strip_non_digits],
        "fuel_type": [_id],
        "price": [_strip_non_digits],
        "price_currency": [_id],
        "price_details": [_quote],
        "location_city": [_quote],
        "location_region": [_strip_braces],
       
    };
    const get_offers = async (page) => {
        return await page.evaluate(() => {
            const _attrib = (elementHandle, selector, attrib) => {
                return elementHandle.querySelector(selector).attributes[attrib].value;
            }
            const _href = (elementHandle, selector) => {
                return _attrib(elementHandle, selector, "href");
            }

            const _text = (elementHandle, selector) => {
                const text_elem = elementHandle.querySelector(selector);
                if(text_elem) {
                    return text_elem.innerText.trim();
                }
                return "";
            }

            const articles = document.querySelectorAll("article[data-ad-id]");
            const parsed_offers = Array.from(articles).map(
                (article) => ({
                     otomoto_id: article.attributes["data-ad-id"].value,
                     title: _text(article, ".offer-title__link"),
                     subtitle: _text(article, ".offer-item__subtitle"),
                     href: _href(article, ".offer-title__link"),
                     year: _text(article, "li[data-code='year']"),
                     mileage: _text(article, "li[data-code='mileage']"),
                     engine: _text(article, "li[data-code='engine_capacity']"),
                     fuel_type: _text(article, "li[data-code='fuel_type']"),
                     price: _text(article, ".offer-price__number").replace(/[\D]/g, ""),
                     price_currency: _text(article, ".offer-price__currency"),
                     price_details: _text(article, ".offer-price__details"),
                     location_city: _text(article, ".ds-location-city"),
                     location_region: _text(article, ".ds-location-region"),
                })
            );
            return parsed_offers;
        });
    };    

    const _to_csv = (item) => {
        return RECOGNIZED_FIELDS_ORDER.map(
            (field) => RECOGNIZED_FIELDS_POSTPROCESS[field].reduce(
                function(prev, current, index, array) {
                    return current(prev)
                },
                item[field]
            )
        ).join(",") + "\n";
    }

    const {make, model} = params;

    console.log(`Input params: ${make} ${model}`)
    const browser = await puppeteer.launch(PUPPETEER_CONFIG);
    const page = await browser.newPage();

    await page.goto(`https://otomoto.pl/osobowe/${make}/${model}`, {waitUntil: "networkidle2"});
    let next_page_url = true;
    let pages_processed = 0;
    let total_pages = await page.evaluate(() => {
        return document.querySelector(".om-pager > li:nth-last-child(2) > a").innerText.trim();
    });
    let stream = fs.createWriteStream(`${make}_${model}_${new Date().toISOString()}.csv`, {flags: 'a'});
    stream.write(RECOGNIZED_FIELDS_ORDER.join(",") + "\n");
    do {

        console.log(`hello ${next_page_url}`);
        next_page_url = await get_next_page_url(page);
    
        let offers = await get_offers(page);

        offers.forEach(function(item, index) {
            stream.write(_to_csv(item));
        });

        if (next_page_url !== null) {
            await page.goto(next_page_url, {waitUntil: "networkidle2"});
        }
        pages_processed += 1;
        console.log(`Processed page ${pages_processed} out of ${total_pages}, collected ${offers.length} offers`);
    } while (next_page_url !== null && (!DEBUG || pages_processed < MAX_PAGES))
    browser.close();
});

require('yargs')
    .scriptName("harvester")
    .command('harvester [make] [model]', '', (yargs) => {
        yargs.positional('make', {
            type: 'string',
        })
        yargs.positional('model', {
            type: 'string'
        })
    }, function(argv) {
        crawl({"xd": "lol", "make": argv.make, "model": argv.model});
    }).help().argv

