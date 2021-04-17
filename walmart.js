const fetch = require('node-fetch');
const cookie = require('cookie');
const colors = require('colors/safe');
const jsdom = require("jsdom");
const { format, addDays, isThisISOWeek } = require('date-fns');
const { JSDOM } = jsdom;
const { Headers } = fetch;
const { clearSchedules, addSchedulesForLocation } = require('./db');

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent((v[0] || '').trim())] = decodeURIComponent((v[1] || '').trim());
      return acc;
    }, {});

const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd')
}

const getCookiesFromResponse = (response) => response.headers.get('set-cookie');

class Walmart {
  constructor() {
    this.initialize();
    this.csrfToken = null;
    this.hmSession = null;
    this.config = {};
  }

  async start() {
    this.config = {};
    console.log(colors.green('[INITIALIZING SESSION]'));
    let cookie1;
    let hmSession1;

    var myHeaders = new Headers();
    myHeaders.append("authority", "portal.healthmyself.net");
    myHeaders.append("cache-control", "max-age=0");
    myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("upgrade-insecure-requests", "1");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36");
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-fetch-mode", "navigate");
    myHeaders.append("sec-fetch-user", "?1");
    myHeaders.append("sec-fetch-dest", "document");
    myHeaders.append("referer", "https://portal.healthmyself.net/walmarton/forms/Dpd");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    // notice how you dont need to pass a cookie for this initial request

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    await fetch("https://portal.healthmyself.net/walmarton/guest/booking/form/8498c628-533b-41e8-a385-ea2a8214d6dc", requestOptions)
      .then(response => {
        cookie1 = getCookiesFromResponse(response);
        const parsedCookie1 = parseCookie(cookie1);
        // console.log(parsedCookie1);
        hmSession1 = parsedCookie1['secure, hm_session'];
        // console.log('got response from initial request');
        // console.log(cookie1);
        return response.text();
      })
      .then(result => {
        const dom = new JSDOM(result);
        // console.log(html);
        const metatags = dom.window.document.querySelectorAll('meta');
        const csrfmeta = Array.from(metatags).filter(tag => tag.name === 'csrf-token')[0];
        this.csrfToken = csrfmeta.content;
        // metatags.forEach(tag => {
        //   console.log(tag.textContent);
        // })
        // console.log(metatags);
        // console.log(result);
      })
      // .catch(error => console.log('error', error));
  
    var myHeaders = new Headers();
    myHeaders.append("authority", "portal.healthmyself.net");
    myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
    myHeaders.append("x-xsrf-token", "eyJpdiI6ImI5cUJrZzQ3cGxhaWg0Z3VNeEdtNlE9PSIsInZhbHVlIjoidGp6RzBmbTRjVnJGYUwxaFhIMXNRcjNPN0FxUDlQOHdzYWI4NUY2SFRYcmFtVGkzTVwva1dUYzZqRnF1TWZsY1AiLCJtYWMiOiIwMjIwMDgyNWYxZGJkM2FmZDU0OTdkMjE5NzhiNjUyM2ZjZjk2MjMzNmQ5MGYwZGFjNjE3YWUyYTRhOTJkM2I4In0=");
    myHeaders.append("x-csrf-token", "wjKDwzpo50zj1a3MWA6zApomvecDEny5LlCR2P2w");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36");
    myHeaders.append("x-socket-id", "s4xucdwkd43Su5X_IoSP");
    myHeaders.append("accept", "application/json, text/plain, */*");
    myHeaders.append("x-requested-with", "XMLHttpRequest");
    myHeaders.append("x-hm-client-timezone", "America/Toronto");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("referer", "https://portal.healthmyself.net/walmarton/guest/booking/form/8498c628-533b-41e8-a385-ea2a8214d6dc");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("cookie", `hm_session=${hmSession1}`);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    let cookie2, hmSession2;

    await fetch("https://portal.healthmyself.net/walmarton/guest/booking/types", requestOptions)
      .then(response => {
        cookie2 = getCookiesFromResponse(response);
        const parsedCookie2 = parseCookie(cookie2);
        // console.log(parsedCookie2);
        hmSession2 = parsedCookie2['secure, hm_session'];
        return response;
      })
      // .then(response => response.text())
      // .then(result => console.log(result))
      // .catch(error => console.log('error', error));

    // getting the locations

      var myHeaders = new Headers();
      myHeaders.append("authority", "portal.healthmyself.net");
      myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
      myHeaders.append("x-xsrf-token", "eyJpdiI6ImtwbTA3Y3hIZStPVWJXTkJhb1ZSaUE9PSIsInZhbHVlIjoiTnBERzNHUktEN2owNDdvYlhtbjVUTzJPenJwdldRNnNEa2VQTWRJU1VnRVQzYUtDVXh1d1NlOWR2aGk4SjQrTyIsIm1hYyI6IjYyZjk4NmJmMTY0ZTkzN2JkZDI0YjFkNjIzMmRiZDY3MDMyY2QxZTkyNzNlYjAzNzVmMTRjMjIzMmY3ODYyNzMifQ==");
      myHeaders.append("x-csrf-token", "wjKDwzpo50zj1a3MWA6zApomvecDEny5LlCR2P2w");
      myHeaders.append("sec-ch-ua-mobile", "?0");
      myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36");
      myHeaders.append("x-socket-id", "s4xucdwkd43Su5X_IoSP");
      myHeaders.append("accept", "application/json, text/plain, */*");
      myHeaders.append("x-requested-with", "XMLHttpRequest");
      myHeaders.append("x-hm-client-timezone", "America/Toronto");
      myHeaders.append("sec-fetch-site", "same-origin");
      myHeaders.append("sec-fetch-mode", "cors");
      myHeaders.append("sec-fetch-dest", "empty");
      myHeaders.append("referer", "https://portal.healthmyself.net/walmarton/guest/booking/form/8498c628-533b-41e8-a385-ea2a8214d6dc");
      myHeaders.append("accept-language", "en-US,en;q=0.9");
      myHeaders.append("cookie", `hm_session=${hmSession2}`);
      
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      let cookie3, hmSession3;
      
      await fetch("https://portal.healthmyself.net/walmarton/guest/booking/type/4752/locations", requestOptions)
        .then(response => {
          cookie3 = getCookiesFromResponse(response);
          const parsedCookie3 = parseCookie(cookie3);
          // console.log(parsedCookie3);
          hmSession3 = parsedCookie3['secure, hm_session'];
          this.hmSession3 = hmSession3;
          return response;
        })
        // .then(result => console.log(result))
        // .catch(error => console.log('error', error));

      console.log(colors.green('[FINISH INITIALIZING SESSION]'));
  }

  async getConfigurationForLocation(locationId) {
    let config = {};
    var myHeaders = new Headers();
      myHeaders.append("authority", "portal.healthmyself.net");
      myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
      myHeaders.append("x-xsrf-token", "eyJpdiI6Ikk1R2ZBWTZrTW9tVzV0RTNwWWhkakE9PSIsInZhbHVlIjoiWE9LWXpvRW5Fd2xyR0t5Wk1aeCtEalRHWWpKV2ZZZVBwNHJTeSt1bnQxbUR1R0YrSVpIYkhDczlhbjI4MXFSVSIsIm1hYyI6IjU0MTg2Mzk3YjM3OTJlMjM2MmMxMzA1MGJlODIzNTE3MWU2OGQ1MWViODQ1N2RhMDU0MjNkMjNkNzc3ZWRiMDgifQ==");
      myHeaders.append("x-csrf-token", "wjKDwzpo50zj1a3MWA6zApomvecDEny5LlCR2P2w");
      myHeaders.append("sec-ch-ua-mobile", "?0");
      myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36");
      myHeaders.append("x-socket-id", "s4xucdwkd43Su5X_IoSP");
      myHeaders.append("accept", "application/json, text/plain, */*");
      myHeaders.append("x-requested-with", "XMLHttpRequest");
      myHeaders.append("x-hm-client-timezone", "America/Toronto");
      myHeaders.append("sec-fetch-site", "same-origin");
      myHeaders.append("sec-fetch-mode", "cors");
      myHeaders.append("sec-fetch-dest", "empty");
      myHeaders.append("referer", "https://portal.healthmyself.net/walmarton/guest/booking/form/8498c628-533b-41e8-a385-ea2a8214d6dc");
      myHeaders.append("accept-language", "en-US,en;q=0.9");
      myHeaders.append("cookie", `hm_session=${this.hmSession3}`);

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

    await fetch(`https://portal.healthmyself.net/walmarton/guest/booking/4752/schedules?locId=${locationId}`, requestOptions)
      .then(async response => {
        let cookie4 = getCookiesFromResponse(response);
        const parsedCookie4 = parseCookie(cookie4);
        // console.log(response.headers)
        let hmSession4 = parsedCookie4['secure, hm_session'];
        this.hmSession = hmSession4; // this is the important one
        config.hmSession = hmSession4; // lets store it in here anyways
        return JSON.parse(await response.text());
      })
      .then(response => {
        if (response.success) {
          if (response.data.length > 0) {
            config.name = response.data[0].name;
            config.appt_type_id = response.data[0].appt_type_id;
            config.schedule_appt_type_id = response.data[0].schedule_appt_type_id;
            config.schedule_id = response.data[0].schedule_id;
          }
        } else {
          config = null;
        }
      })
    
    return config;
  }


  async initialize() {
    await this.clearAllSchedules();
    await this.start();

    // let nextWeek = addDays(new Date(), 7);
    let today = new Date();
    let nextMonth = addDays(new Date(), 31);
    let locations = require('./walmart-locations');

    for (let location of locations) {
      console.log(colors.magenta(`>>> Getting configuration for ${location.loc_name}`));
      let config = await this.getConfigurationForLocation(location.loc_id);
      console.log(colors.magenta(`>>> Finished getting configuration for ${location.loc_name}`));
      let schedules = await this.getScheduleForLocation(location.loc_id, today, nextMonth, config);
      console.log(colors.yellow(`>>> Retrieved ${schedules.length} appointments`));
      if (schedules.length !== 0) {
        await addSchedulesForLocation('walmart', location.loc_id, schedules);
      } else {
        await addSchedulesForLocation('walmart', location.loc_id, []);
      }
      console.log(colors.green('>>> Done getting schedules, sleeping for 2000ms'));
      await sleep(2000);
    }
  }

  async clearAllSchedules() {
    console.log(colors.white('[WALMART] CLEARING ALL SCHEDULES'));
    await clearSchedules('walmart');
  }

  async getScheduleForLocation(locationId, startDate, endDate, config) {
    if (config === null) {
      console.log(colors.red(`failed to fetch for locationId: ${locationId} (config is null)`));
      return [];
    }
    // console.log('getting schedules for ', locationId, startDate, endDate);
    var myHeaders = new Headers();
    myHeaders.append("authority", "portal.healthmyself.net");
    myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
    myHeaders.append("x-csrf-token", this.csrfToken); // must have the csrf-token for posts
    // wonder if the csrf-token is per session, and can't pass any session in without corresponding csrf token
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36");
    myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    myHeaders.append("x-socket-id", "s4xucdwkd43Su5X_IoSP");
    myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
    myHeaders.append("x-requested-with", "XMLHttpRequest");
    myHeaders.append("x-hm-client-timezone", "America/Toronto");
    myHeaders.append("origin", "https://portal.healthmyself.net");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("referer", "https://portal.healthmyself.net/walmarton/guest/booking/form/8498c628-533b-41e8-a385-ea2a8214d6dc");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("cookie", `hm_session=${this.hmSession}`);
    
    // apptTypeId:
    // 4752 = first dose, but 
    var raw = `localTimezone=America%2FToronto&scheduleApptTypeId=${config.schedule_appt_type_id}&apptTypeId=${config.appt_type_id}&scheduleGroupId=&locId=${locationId}&start=${formatDate(startDate)}&end=${formatDate(endDate)}`;
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    return await fetch("https://portal.healthmyself.net/walmarton/guest/booking/available", requestOptions)
      .then(async response => {
        // console.log(response.status);
        let text = await response.text();
        return JSON.parse(text)
      })
      // .catch(error => console.log('error', error));
  }

  async getLocations() {
    try {
      const apiResponse = await fetch("https://portal.healthmyself.net/walmarton/guest/booking/type/4752/locations", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "cookie": this.getSessionCookie(),
        },
        "referrer": "https://portal.healthmyself.net/walmarton/guest/booking/form/8498c628-533b-41e8-a385-ea2a8214d6dc",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
      });

      // also need to get the locations from the 

      const data = await apiResponse.json();
      console.log(data);
    } catch(e) {
      console.log(e);
    }
  }
}

module.exports = new Walmart();
