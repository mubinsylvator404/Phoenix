const https = require('https');

const subjects = [
  { name: 'উদ্ভিদবিজ্ঞান', url: 'https://olranks.com/chapters/6576165504d6a0b68a778d9e' },
  { name: 'উচ্চতরগণিত ১ম পত্র', url: 'https://olranks.com/chapters/6576161504d6a0b68a778d96' },
  { name: 'পদার্থবিজ্ঞান ২য় পত্র', url: 'https://olranks.com/chapters/6576160604d6a0b68a778d94' },
  { name: 'উচ্চতরগণিত ২য় পত্র', url: 'https://olranks.com/chapters/6576162404d6a0b68a778d98' },
  { name: 'রসায়ন ১ম পত্র', url: 'https://olranks.com/chapters/6576163404d6a0b68a778d9a' },
  { name: 'বাংলা ১ম পত্র', url: 'https://olranks.com/chapters/65acd51f813914f4ad22f55f' },
  { name: 'English 1st paper', url: 'https://olranks.com/chapters/65acd554813914f4ad22f56d' },
  { name: 'রসায়ন ২য় পত্র', url: 'https://olranks.com/chapters/6576164204d6a0b68a778d9c' },
  { name: 'বাংলা ২য় পত্র', url: 'https://olranks.com/chapters/65acd53b813914f4ad22f56b' },
  { name: 'পদার্থবিজ্ঞান ১ম পত্র', url: 'https://olranks.com/chapters/657615e404d6a0b68a778d92' },
  { name: 'প্রাণিবিজ্ঞান', url: 'https://olranks.com/chapters/6576167204d6a0b68a778da0' },
  { name: 'তথ্য ও যোগাযোগ প্রযুক্তি', url: 'https://olranks.com/chapters/65784fff76584cb1dabdc61d' },
  { name: 'English 2nd paper', url: 'https://olranks.com/chapters/65acd562813914f4ad22f56f' }
];

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

async function run() {
  const result = {};
  for (const sub of subjects) {
    try {
      const html = await fetchUrl(sub.url);
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
      if (nextDataMatch) {
        const data = JSON.parse(nextDataMatch[1]);
        const chapters = data.props?.pageProps?.chapters || data.props?.pageProps?.data || [];
        result[sub.name] = chapters.map(c => c.name || c.title || c.chapterName || c);
      } else {
        // Try to extract from HTML text
        const matches = [...html.matchAll(/class="[^"]*chapter[^"]*"[^>]*>(.*?)<\//gi)];
        if (matches.length > 0) {
            result[sub.name] = matches.map(m => m[1]);
        } else {
            result[sub.name] = "COULD NOT PARSE";
        }
      }
    } catch (e) {
      result[sub.name] = "ERROR: " + e.message;
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

run();