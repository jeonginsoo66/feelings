import axios from "axios";
import cheerio from "cheerio";
import client from "cheerio-httpcli";

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
    const str = "https://www.google.com/search?q=샘김 make up";
    return await axios.get(encodeURI(str), config);
  } catch (err) {
    console.log(err);
  }
};

getHtml()
  .then((html) => {
    let ulList = [];
    const $ = cheerio.load(html.data);

    const $bodyList = $("div.ujudUb").children("span");

    $bodyList.each(function (index, elem) {
      ulList[index] = $(this).text();
    });

    ulList = ulList.slice(ulList.indexOf("… ") + 1);

    return ulList;
  })
  .then((res) => console.log(res));
