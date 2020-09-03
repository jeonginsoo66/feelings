import axios from "axios";
import cheerio from "cheerio";
import puppeteer from "puppeteer";

const scrappingAPI = {
  getLyrics: (artistAndTitle) => {
    const getHtml = async () => {
      // [Node.js] node.js 크롤링 방지 우회하기 with axios
      // 참고 : https://stackoverflow.com/questions/45578844/how-to-set-header-and-options-in-axios
      // 참고 : https://hanswsw.tistory.com/7
      // 참고 : https://velog.io/@yesdoing/Node.js-%EC%97%90%EC%84%9C-%EC%9B%B9-%ED%81%AC%EB%A1%A4%EB%A7%81%ED%95%98%EA%B8%B0-wtjugync1m
      let config = {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
          "Accept-Charset": "utf-8",
        },
      };

      try {
        const str = `https://www.musixmatch.com/lyrics/${artistAndTitle}`;
        return await axios.get(encodeURI(str), config);
      } catch (err) {
        console.log(err);
      }
    };

    const lyricsData = getHtml().then(async (html) => {
      try {
        let trackData = {};
        let ulList = [];
        const $ = await cheerio.load(html.data);

        let lyrics = $(".lyrics__content__ok");

        if (lyrics.text() == "") {
          lyrics = $(".lyrics__content__warning");
        }

        const albumImg = $(".banner-album-image-desktop").children("img");

        lyrics.each(function (index, elem) {
          ulList[index] = $(this).text();
        });

        trackData.lyrics = ulList;
        trackData.albumImg = albumImg.attr("src");

        return trackData;
      } catch (err) {
        console.log(err);
      }
    });

    return lyricsData;
  },
  getYoutube: (title) => {
    puppeteer.launch({ headless: true }).then(async (browser) => {
      const url = `https://www.youtube.com/results?search_query=${title}`;

      let config = {
        waitUntil: "networkidle2",
      };
      const page = await browser.newPage();
      await page.goto(encodeURI(url), config);

      const html = await page.$eval("#contents", (e) => e.outerHTML);

      const data = cheerio.load(html);

      const youtubeObj = {};

      const thumbnails = [];
      const thumb = data("#img");

      const videoHrefs = [];
      const videoTitles = [];
      const vh = data("#video-title");

      thumb.each((key, val) => {
        if (data(val).attr("src")) {
          thumbnails.push(data(val).attr("src"));
        }
      });

      vh.each((key, val) => {
        if (data(val).attr("href")) {
          videoHrefs.push(data(val).attr("href"));
          videoTitles.push(data(val).attr("title"));
        }
      });

      youtubeObj.thumbnails = thumbnails;
      youtubeObj.videoHrefs = videoHrefs;
      youtubeObj.videoTitles = videoTitles;

      return youtubeObj;
    });
  },
};

export default scrappingAPI;

/*
let str = "Major Lazer feat. Bruno Mars, 2 Chainz, Tyga & Black M";

let special_pattern = /[!~@#$%^&-*()_+|<>?:{},.\s]/g;

let arr = str.split(special_pattern);

console.log(arr);

while (true) {
  let isValid = false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === "") {
      arr.splice(i, 1);
    }
  }

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === "") {
      isValid = false;
      break;
    } else {
      isValid = true;
    }
  }

  if (isValid) {
    break;
  }
}

console.log(arr.join("-"));
*/
