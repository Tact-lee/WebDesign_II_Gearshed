// GEARSHED — Artists
// 첫 화면: 연주자 사진이 위에서 매달린 띠로 가로로 흐른다(휠·드래그). 사진을 누르면 그 연주자 화면(#id)으로.
// 화면은 주소의 해시로 바뀐다: '' = 목록, '#<id>' = 연주자, '#sources' = 출처.

const IMG = 'assets/artists/';

/* ---------- 프리로더 ---------- */
// 검정이 걷힘(0.75s) → 사진·서체가 빠르게 바뀜 → 검정이 아래에서 덮음 → 다시 걷히며 페이지. rAF 대신 타이머(숨은 탭에서도 끝난다)
const PL_FONTS = ['Anton', 'Bebas Neue', 'Rubik Mono One', 'UnifrakturMaguntia', 'Monoton', 'Bungee', 'Abril Fatface', 'Rye', 'Rock Salt',
  'Special Elite', 'Press Start 2P', 'Pacifico', 'Shrikhand', 'Bungee Shade', 'Black Ops One', 'Pirata One', 'Playfair Display', 'Righteous',
  'Instrument Serif', 'Instrument Sans'];
function preloader() {
  const pl = document.querySelector('.pl');
  if (!pl) return;
  const done = () => { document.body.classList.remove('pl-on'); pl.classList.add('is-done'); };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
  const box = pl.querySelector('.pl-imgs'), word = pl.querySelector('.pl-word'), curtain = pl.querySelector('.pl-curtain');
  // 받은 사진만 번갈아 보여 준다(못 받은 번호는 건너뜀)
  // 이 페이지의 표지·첫 화면 사진 + 상징적인 기타리스트 사진(PRE)
  const own = ARTISTS.map((a) => a.cover).concat(Object.values(DETAIL).map((d) => d.hero.src));
  const srcs = [...own.map((f) => IMG + f), ...PRE.map(([f]) => IMG + f)].sort(() => Math.random() - .5);
  const ready = [];
  srcs.forEach((src) => { const im = new Image(); im.alt = ''; im.decoding = 'async'; im.onload = () => { box.append(im); ready.push(im); }; im.src = src; });
  let i = 0, on = null;
  const flash = setInterval(() => {
    if (ready.length) { on?.classList.remove('is-on'); on = ready[i % ready.length]; on.classList.add('is-on'); }
    word.style.fontFamily = `"${PL_FONTS[i % PL_FONTS.length]}", var(--f-sans)`;
    i++;
  }, 85);
  setTimeout(() => curtain.classList.add('is-up'), 150);           // 1. 검정이 위로 걷힌다
  setTimeout(() => {                                                // 2. 검정이 아래에서 올라와 덮는다
    curtain.classList.remove('is-up'); curtain.classList.add('is-below');
    void curtain.offsetWidth;
    curtain.classList.replace('is-below', 'is-rise');
  }, 2500);
  setTimeout(() => {                                                // 3. 덮인 동안 무대를 치우고 다시 위로 걷어 페이지를 보인다
    clearInterval(flash);
    pl.querySelector('.pl-stage').remove();
    document.body.classList.remove('pl-on');
    curtain.style.transition = 'none'; curtain.classList.remove('is-rise');
    void curtain.offsetWidth;
    curtain.style.transition = ''; curtain.classList.add('is-up');
  }, 3350);
  setTimeout(done, 4200);
}

// 띠에 놓이는 순서 = 활동 시기 순. ready가 아닌 연주자는 사진만 보이고 "In progress".
const ARTISTS = [
  { id: 'les-paul', name: 'Les Paul', cover: 'cover-les-paul.jpg', coverPos: '50% 25%', alt: 'Les Paul smiling with an electric archtop, about 1947', ready: true },
  { id: 'b-b-king', name: 'B.B. King', cover: 'cover-b-b-king.jpg', coverPos: '50% 20%', alt: 'B.B. King singing with Lucille at the Ann Arbor Blues Festival, 1969', ready: true },
  { id: 'chuck-berry', name: 'Chuck Berry', cover: 'cover-chuck-berry.jpg', coverPos: '50% 20%', alt: 'Chuck Berry with a hollow-body guitar, 1957', ready: true },
  { id: 'george-harrison', name: 'George Harrison', cover: 'cover-george-harrison.jpg', coverPos: '50% 25%', alt: 'George Harrison in a black polo neck at The Ed Sullivan Show, 1964', ready: true },
  { id: 'keith-richards', name: 'Keith Richards', cover: 'cover-keith-richards.jpg', coverPos: '45% 20%', alt: 'Keith Richards on a red-lit stage in an embroidered jacket, 1970s', ready: true },
  { id: 'eric-clapton', name: 'Eric Clapton', cover: 'cover-eric-clapton.jpg', coverPos: '42% 30%', alt: 'Eric Clapton playing a Firebird with Cream at the Forum, Inglewood, 1968', ready: true },
  { id: 'pete-townshend', name: 'Pete Townshend', cover: 'cover-pete-townshend.jpg', coverPos: '45% 30%', alt: 'Pete Townshend in a white boiler suit kicking high with his SG, Hamburg, 1972', ready: true },
  { id: 'jeff-beck', name: 'Jeff Beck', cover: 'cover-jeff-beck.jpg', coverPos: '50% 20%', alt: 'Jeff Beck with long dark hair playing a white Stratocaster, 1972', ready: true },
  { id: 'jimi-hendrix', name: 'Jimi Hendrix', cover: 'hendrix-fehmarn-1970.jpg', alt: 'Jimi Hendrix on stage at the Fehmarn festival, 1970', ready: true },
  { id: 'jimmy-page', name: 'Jimmy Page', cover: 'cover-jimmy-page.jpg', coverPos: '45% 25%', alt: 'Jimmy Page with long curls playing a Les Paul under stage light, 1970s', ready: true },
  { id: 'rory-gallagher', name: 'Rory Gallagher', cover: 'cover-rory-gallagher.jpg', coverPos: '50% 25%', alt: 'Rory Gallagher playing his worn Stratocaster on stage in London, 1975', ready: true },
  { id: 'david-gilmour', name: 'David Gilmour', cover: 'cover-david-gilmour.jpg', coverPos: '22% 50%', alt: 'David Gilmour playing the Black Strat in red stage smoke with Pink Floyd, early 1970s', ready: true },
  { id: 'brian-may', name: 'Brian May', cover: 'cover-brian-may.jpg', coverPos: '62% 30%', alt: 'Brian May playing the Red Special beside Freddie Mercury, about 1976', ready: true },
  { id: 'angus-young', name: 'Angus Young', cover: 'cover-angus-young.jpg', coverPos: '45% 25%', alt: 'Angus Young in his school uniform playing an SG under spotlights at the Hammersmith Odeon, 1979', ready: true },
  { id: 'eddie-van-halen', name: 'Eddie Van Halen', cover: 'cover-eddie-van-halen.jpg', coverPos: '50% 20%', alt: 'Eddie Van Halen with the striped Frankenstein at the New Haven Coliseum, 1978', ready: true },
  { id: 'prince', name: 'Prince', cover: 'cover-prince.jpg', coverPos: '50% 15%', alt: 'Prince in a loose suit and tie pointing out from a spotlit stage, Brussels, 1986', ready: true },
  { id: 'the-edge', name: 'The Edge', cover: 'cover-the-edge.jpg', coverPos: '74% 55%', alt: 'The Edge playing his Explorer with U2 in Toronto, 1981', ready: true },
  { id: 'stevie-ray-vaughan', name: 'Stevie Ray Vaughan', cover: 'cover-stevie-ray-vaughan.jpg', coverPos: '50% 20%', alt: 'Stevie Ray Vaughan in a white suit playing Number One at the Ritz, 1980s', ready: true },
  { id: 'steve-vai', name: 'Steve Vai', cover: 'cover-steve-vai.jpg', coverPos: '45% 25%', alt: 'Steve Vai laughing as he plays a white JEM on a red-lit stage', ready: true },
  { id: 'yngwie-malmsteen', name: 'Yngwie Malmsteen', cover: 'cover-yngwie-malmsteen.jpg', coverPos: '50% 20%', alt: 'Yngwie Malmsteen in a gold-braided jacket playing a red Stratocaster, 1985', ready: true },
  { id: 'kirk-hammett', name: 'Kirk Hammett', cover: 'cover-kirk-hammett.jpg', coverPos: '65% 25%', alt: 'Kirk Hammett beside James Hetfield, playing a black guitar with a skull graphic', ready: true },
  { id: 'slash', name: 'Slash', cover: 'cover-slash.jpg', coverPos: '50% 15%', alt: 'Slash in a denim vest and leather jacket in a 1987 Guns N’ Roses publicity photo', ready: true },
  { id: 'kurt-cobain', name: 'Kurt Cobain', cover: 'cover-kurt-cobain.jpg', alt: 'Kurt Cobain on stage with Nirvana', ready: true },
  { id: 'john-frusciante', name: 'John Frusciante', cover: 'cover-john-frusciante.jpg', coverPos: '50% 20%', alt: 'John Frusciante playing a sunburst Stratocaster on stage in Nashville, 2022', ready: true },
  { id: 'noel-gallagher', name: 'Noel Gallagher', cover: 'cover-noel-gallagher.jpg', coverPos: '50% 20%', alt: 'Noel Gallagher in a check shirt playing a red hollow-body guitar, 2008', ready: true },
  { id: 'jack-white', name: 'Jack White', cover: 'cover-jack-white.jpg', coverPos: '50% 25%', alt: 'Jack White in red and Meg White in black and white, the White Stripes', ready: true },
  { id: 'john-mayer', name: 'John Mayer', cover: 'cover-john-mayer.jpg', coverPos: '50% 20%', alt: 'John Mayer in a black jacket playing a white Stratocaster at Radio City Music Hall', ready: true },
];

// 연주자 화면. 글은 sources에 적은 자료들을 교차 확인해 쓴다(Hendrix는 사용자가 지정한 두 기사).
const DETAIL = {
  'jimi-hendrix': {
    years: '1966–1970',
    hero: { src: 'hendrix-1967.jpg', alt: 'Jimi Hendrix playing a Stratocaster at Gröna Lund, Stockholm, May 1967', pos: '50% 30%' },
    lead: 'Hendrix was left-handed and mostly played right-handed Stratocasters turned upside down and restrung. Flipping the guitar reversed the slant of the bridge pickup and put the long side of the headstock under the high strings, which changed the string tension and made bends on the B and high E easier. Fender’s later Hendrix models copy both details.',
    // 악기마다: 가운데 큰 이름 + 그 아래 기종(sub) → 사진 줄들. rows 안의 'text'가 문단 자리.
    // 사진 줄: bleed(화면 좌우 끝까지) / center(size: mid·wide) / pair(작은 사진 + 큰 사진, flip이면 좌우 반대). 누끼는 쓰지 않는다.
    gear: [
      {
        id: 'monterey',
        name: 'Monterey Stratocaster',
        sub: 'Fender Stratocaster, 1964',
        years: '1967',
        text: 'A 1964 Stratocaster with clay dot inlays and the “spaghetti” logo, red with a rosewood fingerboard when Hendrix got it early in 1967. That year he repainted it in a psychedelic pattern. At the Monterey Pop Festival he set it on fire after “Wild Thing,” then smashed it to pieces.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'hendrix-monterey-fire.jpg', alt: 'Hendrix kneeling beside the burning Stratocaster at Monterey Pop, 1967' } },
          'text',
          { type: 'pair', small: { src: 'hendrix-monterey-mopop.jpg', alt: 'The painted body of the Monterey Stratocaster in a museum case' }, big: { src: 'hendrix-monterey-met.jpg', alt: 'A broken red and white fragment of the Monterey Stratocaster' } },
        ],
      },
      {
        id: 'sg-custom',
        name: 'Gibson SG Custom',
        sub: 'Gibson SG Custom, 1967',
        years: '1968–1969',
        text: 'A white 1967 SG Custom, acquired in 1968 and used often from then on. The SG’s two horns are nearly symmetrical, so nothing gets in the way when it is played upside down. He used it for “Sunshine of Your Love,” a nod to Eric Clapton’s SG with Cream, and played it on The Dick Cavett Show in 1969.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'hendrix-sg-cavett.jpg', alt: 'Hendrix playing the white SG Custom on The Dick Cavett Show, 1969' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'hendrix-sg-hardrock.jpg', alt: 'The white SG Custom in a Hard Rock Cafe display case' }, small: { src: 'hendrix-sg-controls.jpg', alt: 'Worn control knobs and the vibrato arm on Hendrix’s SG Custom' } },
        ],
      },
      {
        id: 'izabella',
        name: 'Izabella', // 별명이 있으면 모델명 대신 별명(fuzzfaced)
        sub: 'Fender Stratocaster, 1968',
        years: '1968–1969',
        text: 'An Olympic White Stratocaster, serial 240981, bought at Manny’s Music in New York in 1968. Hendrix named it Izabella. Apart from the strap button, moved on the lower horn for his left hand, it stayed stock. He used it regularly up to Woodstock in 1969 and played “The Star-Spangled Banner” on it there.',
        rows: [
          { type: 'bleed', img: { src: 'hendrix-izabella-woodstock.jpg', alt: 'Hendrix in a pink headband holding Izabella’s neck to his face at Woodstock, 1969' } },
          'text',
          { type: 'center', size: 'mid', img: { src: 'hendrix-woodstock.jpg', alt: 'Hendrix in a white fringed jacket playing Izabella at Woodstock, 1969' } },
          { type: 'pair', flip: true, big: { src: 'hendrix-woodstock-closeup.jpg', alt: 'Pickguard and pickups of Izabella behind glass' }, small: { src: 'hendrix-izabella-met.jpg', alt: 'Izabella standing in a glass case at the Metropolitan Museum of Art, 2019' } },
        ],
      },
    ],
    sources: [
      ['Fuzzfaced, “Jimi Hendrix Stratocasters”', 'https://www.fuzzfaced.net/hendrix-strats.html'],
      ['Stringjoy, “The Guitars of Jimi Hendrix”', 'https://stringjoy.com/guitars-of-jimi-hendrix/'],
    ],
    credits: [
      ['Gröna Lund, Stockholm, 1967. Photographer unknown, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimi_Hendrix_1967_uncropped.jpg'],
      ['Monterey Pop, 1967. Ken Marcus, Fender press release', 'https://www.fender.com/newsroom/271730-fender-releases-limited-edition-jimi-hendrix-monterey-stratocaster-in-honor-of-monterey-international-pop-festival-s-50th-anniversary/'],
      ['Monterey Stratocaster at the Museum of Pop Culture. Roland Tanglao, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:EMP_Museum_-_Jimi_Hendrix_(15201352540).jpg'],
      ['Monterey Stratocaster fragment, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimi_Hendrix%27s_Fragment_of_Fender_Stratocaster_(1967)_destroyed_by_him_at_Moterey_Pop_Festival_on_June_18,_1967_-_Play_It_Loud._MET_(2019-05-13_19.35.38_by_Eden,_Janine_and_Jim).jpg'],
      ['The Dick Cavett Show, 1969. Via Stringjoy', 'https://stringjoy.com/guitars-of-jimi-hendrix/'],
      ['SG Custom at the Hard Rock Cafe, Atlantic City. Ira, Flickr, via Ground Guitar', 'https://www.groundguitar.com/jimi-hendrix-gear/jimi-hendrixs-1967-gibson-sg-custom/'],
      ['SG Custom controls, Hard Rock Cafe. iirraa (Ira), Flickr, CC BY-NC-ND 2.0', 'https://www.flickr.com/photos/iirraa/155142223/'],
      ['Woodstock, 1969. Fender, “Jimi Hendrix and a Strat Named Izabella”', 'https://www.fender.com/articles/fender-performances/jimi-hendrix-and-a-strat-named-izabella'],
      ['Woodstock, 1969. From Woodstock: The Movie, via Stringjoy', 'https://stringjoy.com/guitars-of-jimi-hendrix/'],
      ['Izabella, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimi_Hendrix%27s_Fender_Stratocaster_(1968)_in_Olympic_White,_purchased_in_New_York_in_1968,_played_on_legendary_1969_Woodstock_performance,_and_used_until_about_1970_-_Play_It_Loud._MET_(2019-05-13_19.43.28_by_Eden,_Janine_and_Jim).jpg'],
      ['Izabella at the Experience Music Project, detail. Roland Tanglao, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:EMP_Museum_-_Jimi_Hendrix_(15201881017).jpg'],
      ['Fehmarn, 1970. Detlef Hansen, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimi_Hendrix_beim_Festival_1970.jpg'],
    ],
  },
  'chuck-berry': {
    years: '1955–2017',
    hero: { src: 'berry-tv.jpg', alt: 'Chuck Berry playing a Gibson thinline on a television stage', pos: '50% 16%' },
    lead: 'Berry played Gibson thinline electrics from his first Chess sessions in 1955 to the end of his life. In the 1970s and 1980s he toured alone with his guitar case, hired a local band in each town and gave them no set list; they followed him from the first notes of each intro.',
    gear: [
      {
        id: 'maybellene',
        name: 'Maybellene',
        sub: 'Gibson ES-350T, 1959',
        years: '1955–1963',
        text: 'Gibson introduced the ES-350T in 1955: a thinline body, a short 23½-inch scale and two P-90 pickups. Berry used the model from his first Chess recordings, and in 1957 he bought one with the new PAF humbuckers that carried most of his late-1950s hits. The 1959 example he called Maybellene, the title of his first single, is in the Smithsonian’s National Museum of African American History and Culture, shown beside his Cadillac Eldorado.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'berry-edmonton-1957.jpg', alt: 'Berry on stage with an ES-350T at the Edmonton Gardens, Alberta, 1957' } },
          'text',
          { type: 'pair', small: { src: 'berry-met-es350t.jpg', alt: 'Another of Berry’s ES-350Ts, serial A29125, at the entrance of the Met’s “Play It Loud” exhibition, 2019' }, big: { src: 'berry-maybellene.jpg', alt: 'Maybellene, Berry’s natural-finish 1959 Gibson ES-350T' } },
        ],
      },
      {
        id: 'es-355',
        name: 'Gibson ES-355',
        sub: 'Gibson ES-355',
        years: '1960s–2017',
        text: 'Gibson stopped making the ES-350T in 1963, and Berry moved to the double-cutaway ES-335 family. He favored a 335 on his 1970s tours and played the ES-355, the luxury version of the 335, at his sixtieth-birthday concert in 1986. When he died in 2017, Gibson sent a new cherry-red ES-355 like the one he had used for years, and it was bolted inside the lid of his coffin.',
        rows: [
          { type: 'bleed', img: { src: 'berry-steinegg-2013.jpg', alt: 'Berry, 87, playing a cherry ES-355 at the Steinegg Live festival in South Tyrol, 2013', pos: '50% 30%' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'berry-virgin-2008.jpg', alt: 'Berry in a captain’s hat with a cherry ES-355 at the Virgin Festival, 2008' }, small: { src: 'berry-2008.jpg', alt: 'Berry playing an ES-355 on stage, 2008' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Chuck Berry”', 'https://en.wikipedia.org/wiki/Chuck_Berry'],
      ['Wikipedia, “Gibson ES-350T”', 'https://en.wikipedia.org/wiki/Gibson_ES-350T'],
      ['Smithsonian Magazine, “How Chuck Berry’s Cadillac and His Guitar Maybellene Came to the Smithsonian”', 'https://www.smithsonianmag.com/smithsonian-institution/how-chuck-berrys-cadillac-and-his-guitar-maybelline-came-smithsonian-180962638/'],
      ['Smithsonian NMAAHC, “Electric guitar belonging to Chuck Berry, nicknamed ‘Maybellene’”', 'https://www.si.edu/object/electric-guitar-belonging-chuck-berry-nicknamed-maybellene:nmaahc_2011.137.2'],
      ['Guitar Player, “Chuck Berry was buried with an electric guitar”', 'https://www.guitarplayer.com/guitarists/chuck-berry-was-buried-with-an-electric-guitar-there-was-a-gasp-from-everybody-oh-my-god-theyre-closing-the-casket-with-that-guitar-in-it'],
      ['Premier Guitar, “Chuck Berry 1926–2017”', 'https://www.premierguitar.com/articles/25525-chuck-berry-19262017'],
    ],
    credits: [
      ['Chuck Berry on television. Via MusicRadar, “Hail, hail rock ’n’ roll: the Chuck Berry story”', 'https://www.musicradar.com/news/chuck-berry-guitar-legend'],
      ['Edmonton Gardens, 1957. Richard G. Proctor Photography, Provincial Archives of Alberta (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry_performing_at_the_Edmonton_Gardens,_Alberta_(32714974404).jpg'],
      ['Maybellene. Smithsonian NMAAHC, CC0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Maybellene,_Chuck_Berry%27s_guitar,_a_Gibson_ES-350T.jpg'],
      ['ES-350T, serial A29125, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry%27s_ca.1958_Gibson_ES-350T_(serial_no._A29125)_-_(Courtesy_of_Joe_Edwards,_MO)_-_Play_It_Loud%EF%BC%9AInstruments_of_Rock_%26_Roll._Metropolitan_Museum_of_Art_(2019-05-13_18.30.51_by_Eden,_Janine_and_Jim).jpg'],
      ['Steinegg Live, 2013. Gaudenz Blaas, CC BY 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry_performing_live_at_the_Steinegg_Live_Festival_in_South_Tyrol,_Italy,_four_days_after_his_87th_birthday.jpg'],
      ['Virgin Festival, 2008. docmonstereyes, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry_(2760039335).jpg'],
      ['Chuck Berry, 2008. Pablo Vaz, CC BY 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry_(8275961).jpeg'],
      ['Chuck Berry, 1957. Universal Attractions, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry_1957.jpg'],
    ],
  },
  'jimmy-page': {
    years: '1963–',
    hero: { src: 'page-hero.jpg', alt: 'Jimmy Page on stage with the cherry double-neck', pos: '50% 4%' },
    lead: 'Page was a London session guitarist before he joined the Yardbirds in 1966 and formed Led Zeppelin in 1968. He made the first Led Zeppelin album on a Telecaster, moved to a Les Paul in 1969, and on stage added a double-neck for songs that needed six and twelve strings in the same piece.',
    gear: [
      {
        id: 'dragon',
        name: 'Dragon',
        sub: 'Fender Telecaster, 1959',
        years: '1966–1969',
        text: 'Jeff Beck gave Page this 1959 Telecaster in 1966, in thanks for recommending Beck to the Yardbirds. It arrived in a plain finish. In 1967 Page glued eight round mirrors to the body; later he stripped it and painted a dragon on it himself with the poster paint used for psychedelic posters, under a clear pickguard with reflective film. It was his main guitar in the Yardbirds and on Led Zeppelin’s first album. A house-sitter later painted over the dragon, and in 2019 Fender’s Custom Shop rebuilt both the mirrored and the dragon versions.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'page-dragon-1969.jpg', alt: 'Page playing the painted Dragon Telecaster beside Robert Plant in Led Zeppelin’s early days, 1969' } },
          'text',
          { type: 'pair', small: { src: 'page-mirror-tele.jpg', alt: 'The same Telecaster earlier, with round mirrors glued to the body' }, big: { src: 'page-met-dragon.jpg', alt: 'The Dragon Telecaster in the Met’s “Play It Loud” exhibition, 2019' } },
        ],
      },
      {
        id: 'number-one',
        name: 'Number One',
        sub: 'Gibson Les Paul Standard, 1959',
        years: '1969–1980',
        text: 'Page bought it from Joe Walsh in April 1969 for about $1,200. The back of the neck had already been shaved thin, which took the serial number with it; it is thought to date from late 1959 or early 1960. He swapped the Kluson tuners for gold Grovers, and after a 1972 Australian tour the failed bridge pickup was replaced with a T-Top humbucker. From 1969 it was his main guitar with Led Zeppelin, on tour and in the studio.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'page-met-number-one.jpg', alt: 'Number One hanging in the Met’s “Play It Loud” exhibition, 2019' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'page-number-one-1969.jpg', alt: 'Page playing his new Les Paul on an outdoor festival stage with Led Zeppelin, 1969' }, small: { src: 'page-number-one-pickups.jpg', alt: 'Number One in 1970 with the original bridge pickup, and in 1973 with the T-Top' } },
        ],
      },
      {
        id: 'eds-1275',
        name: 'Gibson EDS-1275',
        sub: 'Gibson EDS-1275 Double Neck, 1971',
        years: '1971–1980',
        text: 'Gibson no longer made the double-neck, so Page had a cherry one built with a twelve-string neck above a six-string neck, to play “Stairway to Heaven” live; it let him move between the two parts of the song without changing guitars. He also used it for “The Song Remains the Same” and “Celebration Day” in concert. In the studio it appears on one track, “Carouselambra” (1979). Gibson made 250 copies in 2007; Page kept number one.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'page-chicago-1977.jpg', alt: 'Page with the double-neck beside Robert Plant, Chicago, 1977' } },
          'text',
          { type: 'pair', big: { src: 'page-doubleneck-1973.jpg', alt: 'Page playing the double-neck in 1973' }, small: { src: 'page-met-doubleneck.jpg', alt: 'The double-neck and Page’s 1975 dragon suit at the Met, 2019' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Jimmy Page”', 'https://en.wikipedia.org/wiki/Jimmy_Page'],
      ['Ground Guitar, “Jimmy Page’s 1959 Fender Telecaster Dragon”', 'https://www.groundguitar.com/jimmy-page-gear/jimmy-pages-1959-fender-telecaster-dragon/'],
      ['Guitar Player, “Jimmy Page recommended Jeff Beck for the Yardbirds…”', 'https://www.guitarplayer.com/guitars/electric-guitars/jimmy-page-recommended-jeff-beck-for-the-yardbirds-what-beck-gave-him-in-return-would-become-a-key-part-of-led-zeppelin-history-this-is-yours'],
      ['MusicRadar, “Jimmy Page: the whole idea of the Dragon Tele…”', 'https://www.musicradar.com/news/jimmy-page-the-whole-idea-of-the-dragon-tele-was-to-bring-a-new-life-into-it-to-mix-my-identity-into-the-actual-guitar'],
      ['Philadelphia Inquirer (AP), “Jimmy Page’s Dragon guitar reborn after years on ice”', 'https://inquirer.com/news/nation-world/jimmy-pages-dragon-guitar-reborn-after-years-ice-20190124.html'],
      ['Ground Guitar, “Jimmy Page’s 1959 Gibson Les Paul Standard ‘Number One’”', 'https://www.groundguitar.com/jimmy-page-gear/jimmy-pages-1959-gibson-les-paul-standard-number-one/'],
      ['Guitar.com, “The inside story of Jimmy Page’s Led Zeppelin guitars”', 'https://guitar.com/features/artist-rigs/the-inside-story-of-jimmy-pages-led-zeppelin-guitars/'],
      ['Wikipedia, “Gibson EDS-1275”', 'https://en.wikipedia.org/wiki/Gibson_EDS-1275'],
      ['Gibson, “Jimmy Page”', 'https://gibson.com/en-GB/page/jimmy-page'],
      ['Metropolitan Museum of Art, “EDS-1275 Double neck”', 'https://www.metmuseum.org/art/collection/search/754662'],
    ],
    credits: [
      ['Jimmy Page with the double-neck. Via Guitar Player, “A Look Back at Jimmy Page’s Gibson EDS-1275”', 'https://www.guitarplayer.com/gear/a-look-back-at-jimmy-pages-gibson-eds-1275'],
      ['Dragon Telecaster, 1969, and the mirrored Telecaster. Via Ground Guitar', 'https://www.groundguitar.com/jimmy-page-gear/jimmy-pages-1959-fender-telecaster-dragon/'],
      ['Dragon Telecaster, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page%27s_Dragon_Telecaster_(1959_Fender,_serial_no._50062),_received_from_Jeff_Beck_ca.1965,_hand_painted_%26_replaced_the_pickguard_by_Jimmy_Page,_played_with_violin_bow_-_Play_It_Loud._MET_(2019-05-13_19.27.12_by_Eden,_Janine_and_Jim).jpg'],
      ['Number One, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page%27s_%22Number_One%22_ca.1959-1960_Gibson_Les_Paul_Standard_-_Play_It_Loud._MET_(2019-05-13_18.43.02_by_Eden,_Janine_and_Jim).jpg'],
      ['Led Zeppelin, 1969: Dragon Telecaster and Number One on stage. Via Guitar World, “Watch Jimmy Page demo his most iconic guitar gear”', 'https://www.guitarworld.com/news/jimmy-page-demo-led-zeppelin-telecaster-les-paul-double-neck'],
      ['Strip: Page with a Les Paul, 1970s. Via Guitar World, “Jimmy Page on his surprise Rolling Stones collaboration…”', 'https://www.guitarworld.com/features/jimmy-page-anthology-2020-interview'],
      ['Number One pickup comparison. Via Ground Guitar', 'https://www.groundguitar.com/jimmy-page-gear/jimmy-pages-1959-gibson-les-paul-standard-number-one/'],
      ['Chicago, 1977. Jim Summaria, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page_with_Robert_Plant_2_-_Led_Zeppelin_-_1977.jpg'],
      ['Double-neck, 1973. Via Ground Guitar', 'https://www.groundguitar.com/jimmy-page-gear/jimmy-pages-1971-gibson-eds-1275-doubleneck-custom/'],
      ['EDS-1275 and dragon suit, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page%27s_Gibson_EDS-1275_Double_neck_(1971),_Dragon_suit_(1975)_by_CoCo_-_Play_It_Loud._MET_(2019-05-13_19.29.54_by_Eden,_Janine_and_Jim).jpg'],
      ['Jimmy Page, 1977. Agency for the Performing Arts, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Led_Zeppelin_-_Jimmy_Page_(1977).jpg'],
    ],
  },
  'brian-may': {
    years: '1970–',
    hero: { src: 'may-hero.jpg', alt: 'Brian May with long curls in a pleated white stage costume, 1970s', pos: '50% 20%' },
    lead: 'May has played the guitar he built with his father on almost every Queen record and concert. He plays it through Vox AC30s turned up to full volume with a treble booster in front, and by January 1976 he had nine AC30s on stage. His pick is an old sixpence coin.',
    gear: [
      {
        id: 'red-special',
        name: 'Red Special',
        sub: 'Built by Brian and Harold May, 1963–1964',
        years: '1964–',
        text: 'Brian May and his father Harold, an electrical engineer, built it at home between August 1963 and October 1964, when Brian could not afford a Fender or a Gibson. The neck is mahogany from an old fireplace mantel, its worm holes filled with matchsticks; the fret markers were shaped from buttons, and the body is blockboard with oak from an old table under mahogany veneer. Two motorbike valve springs balance the vibrato, whose arm ends in a knitting needle. Each of the three Burns Tri-Sonic pickups has its own on/off and phase switch. Coats of Rustins plastic coating gave it the red-brown color behind the name; May also calls it the Fireplace or the Old Lady.',
        rows: [
          { type: 'bleed', img: { src: 'may-queen-1980s.jpg', alt: 'Freddie Mercury singing as May plays the Red Special beside him, 1980s' } },
          'text',
          { type: 'pair', small: { src: 'may-father.jpg', alt: 'Brian May and his father Harold with the Red Special' }, big: { src: 'may-queen-1974.jpg', alt: 'Queen live in 1974: May with the Red Special shoulder to shoulder with Freddie Mercury' } },
          { type: 'center', size: 'mid', img: { src: 'may-red-special-closeup.jpg', alt: 'The Red Special’s dark red body, black pickguard and three Tri-Sonic pickups' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Red Special”', 'https://en.wikipedia.org/wiki/Red_Special'],
      ['Ground Guitar, “Brian May’s Red Special Guitar”', 'https://www.groundguitar.com/brian-may-guitars-and-gear/brian-mays-red-special-guitar/'],
      ['Ground Guitar, “Brian May’s Vox AC30 Guitar Amp”', 'https://www.groundguitar.com/brian-may-guitars-and-gear/brian-mays-vox-ac30-guitar-amp/'],
      ['American Songwriter, “The Curious Anatomy of Queen’s Brian May’s Guitar”', 'https://americansongwriter.com/the-curious-anatomy-of-queens-brian-mays-guitar-knitting-needles-matchsticks-and-a-300-year-old-fireplace'],
      ['Make, “Queen’s Brian May and His Homemade Guitar”', 'https://makezine.com/article/craft/music/brian-mays-homemade-guitar'],
      ['Pete Cornish, “Queen”', 'https://petecornish.co.uk/queen.html'],
    ],
    credits: [
      ['Strip: Queen, about 1976. Via Guitar Player, “Brian May on the Queen hit Freddie Mercury wrote in the bath”', 'https://www.guitarplayer.com/music/he-said-my-dear-i-just-wrote-this-in-the-bath-brian-may-on-the-chart-topping-queen-hit-freddie-mercury-composed-while-getting-ready-one-morning'],
      ['Brian May, 1970s. Via Guitar World, “The secrets behind Brian May’s guitar sound on ‘Tie Your Mother Down’”', 'https://www.guitarworld.com/artists/the-secrets-behind-brian-mays-guitar-sound-on-queens-tie-your-mother-down'],
      ['Mercury and May, 1980s. Via Guitar Player, “Brian May on Freddie Mercury and ‘We Are the Champions’”', 'https://www.guitarplayer.com/music/brian-may-on-freddie-mercury-and-we-are-the-champions'],
      ['Queen live, 1974. Via Guitar World, “I had doubts about the Red Special”', 'https://www.guitarworld.com/artists/guitarists/brian-may-queen-i'],
      ['Red Special close-up. Via Guitar Player, “Brian May on making the Red Special Queen’s secret weapon”', 'https://www.guitarplayer.com/guitars/brian-may-on-doubting-the-red-special'],
      ['Brian and Harold May. Via Ground Guitar', 'https://www.groundguitar.com/brian-may-guitars-and-gear/brian-mays-red-special-guitar/'],
    ],
  },
  'eddie-van-halen': {
    years: '1978–2020',
    hero: { src: 'evh-frankenstein-1978.jpg', alt: 'Eddie Van Halen backstage with the black-and-white Frankenstein, 1978', pos: '50% 12%' },
    lead: 'Van Halen took factory guitars apart and rebuilt them around the sound he wanted: one humbucker, one volume knob and a vibrato. The guitar he put together from parts in 1977 is the one he holds on the cover of Van Halen’s first album, released in 1978.',
    gear: [
      {
        id: 'frankenstein',
        name: 'Frankenstein',
        sub: 'Assembled from parts, 1977',
        years: '1977–',
        text: 'Around January 1977 he bought an unfinished ash body for $50, a factory second with a knot in the wood, and later a neck for $80, both from Wayne Charvel’s shop. He had the body routed for a single pickup, fitted a Gibson PAF humbucker taken from his ES-335, dipped it in paraffin wax against feedback, and wired it to one volume knob whose cap read “Tone.” The body was black at first; in July 1977 he masked stripes with tape and sprayed it white. In 1979 he added red over the black and white, and a Floyd Rose vibrato came later. The Metropolitan Museum of Art showed it in 2019.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'evh-debut-cover.jpg', alt: 'Van Halen with the black-and-white Frankenstein on the cover of the band’s 1978 debut album' } },
          { type: 'pair', small: { src: 'evh-live-1978.jpg', alt: 'Van Halen leaning back in red trousers, playing the striped Frankenstein high on stage, 1978' }, big: { src: 'evh-dance-1979.jpg', alt: 'Van Halen with the red, white and black Frankenstein in the “Dance the Night Away” video, 1979' } },
          'text',
          { type: 'center', size: 'wide', img: { src: 'evh-cobo-1982.jpg', alt: 'Van Halen grinning with the red-striped Frankenstein at Cobo Arena, Detroit, 1982' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Frankenstrat”', 'https://en.wikipedia.org/wiki/Frankenstrat'],
      ['Ground Guitar, “Eddie Van Halen’s Frankenstein/Frankenstrat”', 'https://www.groundguitar.com/eddie-van-halen-guitars-and-gear/eddie-van-halens-frankenstein-frankenstrat/'],
      ['Guitar World, “The true origins and evolution of Eddie Van Halen’s legendary Frankenstein guitar”', 'https://www.guitarworld.com/features/eddie-van-halen-frankenstein-origins'],
      ['Stringjoy, “Eddie Van Halen’s Frankenstrat”', 'https://stringjoy.com/frankenstrat/'],
    ],
    credits: [
      ['Eddie Van Halen with Frankenstein in front of his Marshalls, 1978. Via Guitar World, “The true origins and evolution of Eddie Van Halen’s legendary Frankenstein guitar”', 'https://www.guitarworld.com/features/eddie-van-halen-frankenstein-origins'],
      ['On stage, 1978; Cobo Arena, Detroit, 1982. Via Louder, “Eddie Van Halen: January 26, 1955 – October 6, 2020”', 'https://www.loudersound.com/features/eddie-van-halen-january-26-1955-october-6-2020'],
      ['Van Halen (1978) cover; “Dance the Night Away.” Via Ground Guitar', 'https://www.groundguitar.com/eddie-van-halen-guitars-and-gear/eddie-van-halens-frankenstein-frankenstrat/'],
      ['New Haven Coliseum, 1978. Carl Lender, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Eddie_Van_Halen_at_the_New_Haven_Coliseum.jpg'],
    ],
  },
  'kurt-cobain': {
    years: '1987–1994',
    hero: { src: 'cobain-hero.jpg', alt: 'Kurt Cobain singing and playing on stage under red light', pos: '50% 6%' },
    lead: 'Cobain was left-handed and liked the short 24-inch scale of the Fender Mustang. He said he could never find one guitar with everything he wanted, so in 1993 he drew his own.',
    gear: [
      {
        id: 'mustang',
        name: 'Fender Mustang',
        sub: 'Competition Mustang, 1969',
        years: '1991–1993',
        text: 'A blue 1969 Competition Mustang with a racing stripe on the body, played left-handed. It is the guitar in the “Smells Like Teen Spirit” video, filmed on August 17, 1991, the first time he is known to have used it. On stage it appeared only now and then, from a September 1991 in-store show in Seattle to the Cow Palace in San Francisco on April 9, 1993. It is kept at the Museum of Pop Culture in Seattle.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'cobain-teen-spirit.jpg', alt: 'Cobain with the blue Mustang in the “Smells Like Teen Spirit” video, 1991' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'cobain-mustang-mopop.jpg', alt: 'The Teen Spirit Mustang in a case at the Experience Music Project, Seattle' }, small: { src: 'cobain-mustang-closeup.jpg', alt: 'Close-up of the Teen Spirit Mustang’s pickguard, pickups and bridge' } },
        ],
      },
      {
        id: 'jag-stang',
        name: 'Jag-Stang',
        sub: 'Fender, designed by Kurt Cobain, 1993',
        years: '1993–1994',
        text: 'Cobain cut Polaroids of a Jaguar and a Mustang in half, pasted them together and sketched the result in his journal in 1993. Fender’s Larry Brooks built two left-handed prototypes, in Sonic Blue and Fiesta Red, with a copy of his favorite 24-inch Mustang neck. He took one on the 1994 European tour and played it on stage only a few times; Courtney Love later gave it to R.E.M.’s Peter Buck. Fender put the design into production in 1996 and reissued it in 2021 for the 30th anniversary of Nevermind.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'cobain-jagstang-live.jpg', alt: 'Cobain playing the Sonic Blue Jag-Stang on stage, 1994' } },
          'text',
          { type: 'pair', small: { src: 'cobain-journal-collage.jpg', alt: 'Journal page with a Mustang Polaroid and notes for the Jag-Stang' }, big: { src: 'cobain-journal-sketches.jpg', alt: 'Journal page with several left-handed Jag-Stang drawings' } },
        ],
      },
    ],
    sources: [
      ['Ground Guitar, “Kurt Cobain’s 1969 Fender Competition Mustang”', 'https://www.groundguitar.com/kurt-cobain-gear/kurt-cobains-1969-fender-competition-mustang/'],
      ['Wikipedia, “Fender Jag-Stang”', 'https://en.wikipedia.org/wiki/Fender_Jag-Stang'],
      ['Fender, “Cobain’s Brainstorm: The Jigsaw Story of the Jag-Stang”', 'https://www.fender.com/articles/behind-the-scenes/cobains-brainstorm-the-jigsaw-story-of-the-jag-stang'],
      ['Fender Newsroom, “Fender revives Kurt Cobain’s legendary Jag-Stang guitar” (2021)', 'https://www.fender.com/newsroom/272095-fender-revives-kurt-cobain-s-legendary-jag-stang-guitar-designed-by-the-icon-himself/'],
      ['Mixdown, “The story of Kurt Cobain’s signature Fender Jag-stang”', 'https://mixdownmag.com.au/features/the-story-of-kurt-cobains-signature-fender-jag-stang'],
    ],
    credits: [
      ['Kurt Cobain on stage. Via Guitar World, “The definitive Kurt Cobain gear guide”', 'https://www.guitarworld.com/features/the-definitive-kurt-cobain-gear-guide'],
      ['“Smells Like Teen Spirit,” 1991. Nirvana, official video still', 'https://www.youtube.com/watch?v=hTWKbfoikeg'],
      ['Teen Spirit Mustang, Experience Music Project. Razvan Orendovici, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Kurt_Cobain,_Smells_Like_Teen_Spirit_guitar,_EMP_Museum.jpg'],
      ['Mustang at the Museum of Pop Culture. prophead, Flickr, via Ground Guitar', 'https://www.groundguitar.com/kurt-cobain-gear/kurt-cobains-1969-fender-competition-mustang/'],
      ['Teen Spirit Mustang close-up. Via Guitar World, “Kurt Cobain’s 1969 Smells Like Teen Spirit Mustang”', 'https://www.guitarworld.com/gear/electric-guitars/kurt-cobain-1969-smells-like-teen-spirit-mustang'],
      ['Kurt Cobain journal pages, 1993. Fender press images', 'https://www.fender.com/newsroom/272095-fender-revives-kurt-cobain-s-legendary-jag-stang-guitar-designed-by-the-icon-himself/'],
      ['Kurt Cobain on stage. Via MusicRadar, “The story of Kurt Cobain’s Fender Jaguar”', 'https://www.musicradar.com/news/the-story-behind-kurt-cobains-fender-jaguar'],
      ['Cobain with the Jag-Stang. Via Mixdown, “The story of Kurt Cobain’s signature Fender Jag-stang”', 'https://mixdownmag.com.au/features/the-story-of-kurt-cobains-signature-fender-jag-stang'],
    ],
  },
  'eric-clapton': {
    years: '1967–1985',
    hero: { src: 'clapton-hero.jpg', alt: 'Eric Clapton in a paisley jacket playing a sunburst Les Paul, 1960s', pos: '50% 0%' },
    lead: 'In Cream, Clapton played Gibsons, among them a painted SG known as The Fool. In 1970, drawn by Jimi Hendrix and his Blind Faith bandmate Steve Winwood, he moved to Fender Stratocasters and stayed with them. His two best-known Strats, Brownie and Blackie, were later sold at Christie’s to raise money for the Crossroads Centre, the treatment center he founded in Antigua.',
    gear: [
      {
        id: 'the-fool',
        name: 'The Fool',
        sub: 'Gibson SG Standard, 1964',
        years: '1967–1968',
        text: 'Early in 1967, before Cream’s first trip to America, the Dutch design collective The Fool, Marijke Koger and Simon Posthuma, sanded Clapton’s 1964 SG and painted it in oil-based enamel: a cherub holding a triangle among stars and flames. It went on stage at the RKO theater in Manhattan on March 25, 1967, and Clapton used it on most of Cream’s recordings after Fresh Cream, Disraeli Gears above all. It then passed to George Harrison, Jackie Lomax and Todd Rundgren, who called it “Sunny.” In March 2026 it sold at Christie’s for just over $3 million, a record for a Gibson.',
        rows: [
          { type: 'bleed', img: { src: 'clapton-cream-tv-1968.jpg', alt: 'Cream on Dutch television in 1968, Clapton at right with The Fool behind the cymbals' } },
          'text',
          { type: 'center', size: 'wide', img: { src: 'clapton-fool-live.jpg', alt: 'Clapton, long-haired, playing The Fool on a dark stage with Cream' } },
          { type: 'pair', small: { src: 'clapton-fool-1968.jpg', alt: 'Clapton in a sheepskin coat playing The Fool outdoors, 1968' }, big: { src: 'clapton-fool-front.jpg', alt: 'The Fool’s painted body on a guitar stand: a cherub, stars and flames in dayglo colors' } },
        ],
      },
      {
        id: 'brownie',
        name: 'Brownie',
        sub: 'Fender Stratocaster, 1956',
        years: '1967–1971',
        text: 'A 1956 Stratocaster, serial 12073, in two-tone sunburst with a maple neck, named for its brown finish. Clapton bought it at Sound City in London on May 7, 1967, for $400, while he was still in Cream. It is on the cover of his first solo album, Eric Clapton (1970), and it is the main guitar on Derek and the Dominos’ Layla and Other Assorted Love Songs the same year. After 1971 it became the backup to Blackie. It sold at Christie’s on June 24, 1999, for $497,500 and is now at the Museum of Pop Culture in Seattle.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'clapton-brownie-live.jpg', alt: 'Clapton playing a sunburst Stratocaster on stage, 1970s' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'clapton-brownie-layla.jpg', alt: 'Back cover of Layla and Other Assorted Love Songs, with Brownie among scattered dominoes' }, small: { src: 'clapton-brownie-mopop.jpg', alt: 'Brownie, a worn sunburst Stratocaster with a maple neck' } },
        ],
      },
      {
        id: 'blackie',
        name: 'Blackie',
        sub: 'Fender Stratocaster, parts c. 1956–57',
        years: '1973–1985',
        text: 'In 1970 Clapton bought six 1950s Stratocasters at the Sho-Bud shop in Nashville for a few hundred dollars each. He gave one each to George Harrison, Pete Townshend and Steve Winwood, and Nashville luthier Ted Newman Jones built a single guitar from the best parts of the other three. Blackie first went on stage at the Rainbow Concert on January 13, 1973. From 1974 to 1985 Clapton played it almost exclusively, on “Cocaine,” “I Shot the Sheriff,” “Wonderful Tonight” and “Lay Down Sally,” until neck problems retired it after the Behind the Sun tour. It became the model for his Fender signature Stratocaster, and in 2004 Guitar Center bought it at Christie’s for $959,500, then a world record.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'clapton-blackie-1980s.jpg', alt: 'Clapton in a dark suit playing Blackie on stage, mid-1980s' } },
          'text',
          { type: 'pair', small: { src: 'clapton-blackie-just-one-night.jpg', alt: 'Cover of Just One Night (1980): Clapton on a bare stage with Blackie at his side' }, big: { src: 'clapton-blackie-body.jpg', alt: 'Blackie’s worn black body, white pickguard and pickups up close' } },
          { type: 'center', size: 'mid', img: { src: 'clapton-blackie-met.jpg', alt: 'Blackie in a glass case at the Metropolitan Museum of Art, 2019' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “The Fool (guitar)”', 'https://en.wikipedia.org/wiki/The_Fool_(guitar)'],
      ['Wikipedia, “Brownie (guitar)”', 'https://en.wikipedia.org/wiki/Brownie_(guitar)'],
      ['Wikipedia, “Blackie (guitar)”', 'https://en.wikipedia.org/wiki/Blackie_(guitar)'],
      ['Fender, “In 1970, Eric Clapton bought 6 Strats at a Nashville music store”', 'https://www.fender.com/articles/behind-the-scenes/in-1970-eric-clapton-bought-6-strats-at-a-nashville-music-store'],
      ['MusicRadar, “Under the microscope: Eric Clapton’s ‘Blackie’ Strat”', 'https://musicradar.com/news/under-the-microscope-eric-claptons-blackie-strat'],
      ['uDiscover Music, “The Day Clapton Said Goodbye To Blackie”', 'https://www.udiscovermusic.com/stories/the-day-clapton-said-goodbye-to-blackie/'],
      ['Guitar Player, “The Guitar Gear Behind Derek & the Dominos’ ‘Layla’”', 'https://www.guitarplayer.com/gear/the-guitar-gear-behind-derek-and-the-dominos-layla'],
      ['Museum of Pop Culture, “Fender Stratocaster formerly owned by Eric Clapton, 1956”', 'https://mopop.emuseum.com/objects/76142/fender-stratocaster-formerly-owned-by-eric-clapton-1956'],
      ['The Metropolitan Museum of Art, “‘Blackie’ composite Stratocaster”', 'https://www.metmuseum.org/art/collection/search/752452'],
      ['Ground Guitar, Eric Clapton’s Fool, Brownie and Blackie', 'https://www.groundguitar.com/eric-clapton-gear/eric-claptons-1964-gibson-sg-standard-the-fool/'],
    ],
    credits: [
      ['Strip: Cream at the Forum, Inglewood, 1968; Clapton in the 1960s. Via Guitar World, “The history and mysteries of Eric Clapton’s Cream guitars”', 'https://www.guitarworld.com/artists/guitarists/eric-clapton-cream-guitars'],
      ['The Fool on stage and up close. Via Guitar World, “The story of Eric Clapton’s Cream guitars”', 'https://www.guitarworld.com/artists/guitarists/eric-clapton-cream-guitars-history'],
      ['Cream on Dutch TV, 1968. F. van Geelen, VARA, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:CreamDutchTV1968.jpg'],
      ['Clapton with The Fool, 1968. Via Ground Guitar', 'https://www.groundguitar.com/eric-clapton-gear/eric-claptons-1964-gibson-sg-standard-the-fool/'],
      ['Clapton with a sunburst Stratocaster. Via Guitar Player', 'https://www.guitarplayer.com/gear/the-guitar-gear-behind-derek-and-the-dominos-layla'],
      ['Layla back cover; Brownie. Via Ground Guitar', 'https://www.groundguitar.com/eric-clapton-gear/eric-claptons-1956-fender-stratocaster-brownie/'],
      ['Blackie on stage, mid-1980s; Blackie up close. Via MusicRadar, “Under the microscope: Eric Clapton’s ‘Blackie’ Strat”', 'https://www.musicradar.com/news/under-the-microscope-eric-claptons-blackie-strat'],
      ['Just One Night cover (1980). Via Ground Guitar', 'https://www.groundguitar.com/eric-clapton-gear/eric-claptons-1950s-fender-stratocaster-blackie/'],
      ['Blackie, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Eric_Clapton%27s_%22Blackie%22_ca.1956-57_Fender_Stratocaster_composite_-_Play_It_Loud._MET_(2019-05-13_18.49.56_by_Eden,_Janine_and_Jim).jpg'],
    ],
  },
  'b-b-king': {
    years: '1949–2015',
    hero: { src: 'bbking-hero.jpg', alt: 'B.B. King singing with his arms open and Lucille across his chest, Hamburg, 1971', pos: '50% 30%' },
    lead: 'King played a Fender Esquire on most of his early RPM recordings, and early photos show a Gibson ES-5 through a tweed Fender amp. He settled on Gibson’s semi-hollow ES-355 and, for decades, a Lab Series L5 combo, which he said sat between the old Fender amps and the Twin. Every one of those guitars had the same name.',
    gear: [
      {
        id: 'lucille',
        name: 'Lucille',
        sub: 'Gibson ES-355 and B.B. King Lucille',
        years: '1949–2015',
        text: 'In the winter of 1949 King was playing a dance hall in Twist, Arkansas, heated by a barrel of burning kerosene. Two men started fighting, knocked the barrel over, and the hall went up in flames. King got out, then ran back in for his $30 Gibson, a small L-30 archtop. The next day he learned the men had been fighting over a woman named Lucille, and he gave the name to that guitar and every one after it, as a reminder never to do either thing again. Hollow-body Gibsons fed back at high volume, so he moved to the semi-hollow ES-335 and then the stereo ES-355. In 1980 Gibson built the B.B. King Lucille, an ES-355 with a maple neck and, at his request, no f-holes, to cut the feedback further.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'bbking-es355-1971.jpg', alt: 'King looking up as he plays the ES-355, Hamburg, 1971' } },
          'text',
          { type: 'pair', small: { src: 'bbking-lucille-lbj.jpg', alt: 'A black Lucille in a museum case at the LBJ Presidential Library' }, big: { src: 'bbking-lucille-stage.jpg', alt: 'King smiling with a black Lucille in a pale suit' } },
          { type: 'center', size: 'mid', img: { src: 'bbking-lucille-spotlight.jpg', alt: 'King under stage lights with Lucille, his drummer behind him' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Lucille (guitar)”', 'https://en.wikipedia.org/wiki/Lucille_(guitar)'],
      ['Wikipedia, “B.B. King” (equipment)', 'https://en.wikipedia.org/wiki/B.B._King'],
      ['Rolling Stone, “The Legacy of Lucille: The Surprising Story Behind B.B. King’s Guitar”', 'https://rollingstone.com/feature/the-legacy-of-lucille-the-surprising-story-behind-b-b-kings-guitar-63896'],
      ['NPR, “B.B. King’s Guitar Name, Lucille, Came From A Near-Death Experience” (2015)', 'https://www.npr.org/2015/05/15/407071609/b-b-kings-guitar-name-lucille-came-from-a-near-death-experi'],
      ['History.com, “What is the legend behind the naming of B.B. King’s guitar, Lucille?”', 'https://www.history.com/articles/bb-king-guitar-lucille-history-facts'],
    ],
    credits: [
      ['Strip: Ann Arbor Blues Festival, 1969. University of Michigan, CC BY 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:B.B._King,_Ann_Arbor_Blues_Festival_1969.jpg'],
      ['Hamburg, 1971. Heinrich Klaffs, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:B.B._King_in_Hamburg_1971.jpg'],
      ['Hamburg, 1971. Heinrich Klaffs, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:B.B._King_3011710047.jpg'],
      ['Lucille at the LBJ Presidential Library. LBJ Library, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:DIG15178-016_(53537432810).jpg'],
      ['B.B. King with Lucille. Gorupdebesanez, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:B.B._King_07.jpg'],
      ['B.B. King with Lucille. F. Antolín Hernandez, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:B.B._King_con_Lucille.jpg'],
    ],
  },
  'les-paul': {
    years: '1941–2009',
    hero: { src: 'lespaul-hero.jpg', alt: 'Les Paul in a studio surrounded by archtop guitars', pos: '50% 18%' },
    lead: 'Les Paul never stopped rebuilding his equipment. He made one of the first solid-body electric guitars from a length of 4-by-4 lumber, worked out sound-on-sound recording on an Ampex tape machine Bing Crosby gave him in 1949, and later had Ampex build him an eight-track deck he called the Octopus. With Mary Ford he stacked guitars and voices that way on hits like “How High the Moon” in 1951.',
    gear: [
      {
        id: 'the-log',
        name: 'The Log',
        sub: 'Homemade solid-body, c. 1941',
        years: '1941–1950s',
        text: 'Paul built it after hours in Epiphone’s New York factory around 1940 and 1941: a 4-by-4 post with a neck, a bridge and a pickup running straight through. For looks he sawed an Epiphone hollow body lengthwise and fixed a half to each side. With a solid center the guitar stopped feeding back, and the strings sustained instead of spending their energy on a vibrating top. He showed it to Gibson in the 1940s and was turned away; by one account they called it “a broomstick with pickups.” He kept changing it and used it on records even after Gibson put his name on a guitar. It is now at the Country Music Hall of Fame in Nashville.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'lespaul-log-cmhof.jpg', alt: 'The Log: a narrow block with neck and pickups between two halves of an Epiphone archtop body' } },
          'text',
        ],
      },
      {
        id: 'gibson-les-paul',
        name: 'Gibson Les Paul',
        sub: 'Gibson Les Paul Model “Goldtop,” 1952',
        years: '1952–2009',
        text: 'After Fender’s solid-bodies caught on in 1950, Gibson president Ted McCarty brought Paul in as a consultant and asked to put his name on the headstock. Paul’s part covered the trapeze tailpiece and the finish: he wanted gold, so the guitar would look expensive. The first Les Paul Model, a maple cap on mahogany with two P-90 pickups, made its stage debut with him at the Paramount Theatre in New York in June 1952. Of all the Goldtops he called only one his “Number One,” and he rebuilt it with a hidden coil and a pickup of his own. His other guitars never stayed stock either; on a late-1950s Les Paul Custom he fitted low-impedance pickups, a microphone jack and controls of his own.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'lespaul-mary-ford-1952.jpg', alt: 'Les Paul singing to Mary Ford with his new Les Paul, September 1952' } },
          'text',
          { type: 'pair', small: { src: 'lespaul-mary-ford-1954.jpg', alt: 'Les Paul and Mary Ford in a 1954 publicity photo, his Les Paul raised beside her' }, big: { src: 'lespaul-number-one.jpg', alt: 'Les Paul’s “Number One” Goldtop, worn and modified, in its case' } },
          { type: 'center', size: 'mid', img: { src: 'lespaul-custom-rrhof.jpg', alt: 'Les Paul’s modified white Les Paul Custom at the Rock and Roll Hall of Fame' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Les Paul”', 'https://en.wikipedia.org/wiki/Les_Paul'],
      ['Wikipedia, “Gibson Les Paul”', 'https://en.wikipedia.org/wiki/Gibson_Les_Paul'],
      ['Premier Guitar, “Les Paul’s Log Solidbody Guitar”', 'https://www.premierguitar.com/articles/Les_Pauls_Log_Solidbody_Guitar'],
      ['PBS American Masters, “Les Paul: Career Timeline”', 'https://www.pbs.org/wnet/americanmasters/les-paul-career-timeline/101'],
      ['Guitar Player, “Les Paul on His Eureka Moment”', 'https://guitarplayer.com/gear/i-have-a-problem-ive-got-to-make-my-guitar-louder-les-paul-on-his-eureka-moment'],
      ['Guitar.com, “The oral history of the Les Paul”', 'https://www.guitar.com/guides/essential-guide/the-oral-history-of-the-les-paul/'],
      ['Guitar World, “The incredible story … of Les Paul’s ‘Number One’ Goldtop”', 'https://www.guitarworld.com/features/les-paul-number-one-goldtop-story'],
      ['Guitar Player, “See the crazy mods inside Les Paul’s ‘Number One’ Goldtop”', 'https://www.guitarplayer.com/news/see-the-crazy-mods-inside-les-pauls-number-one-goldtop'],
    ],
    credits: [
      ['Strip: Les Paul, about January 1947. William P. Gottlieb, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Les_Paul,_ca._Jan._1947_(William_P._Gottlieb_07001).jpg'],
      ['Les Paul with his guitars. Via MusicRadar, “Les Paul: the man behind the machine”', 'https://musicradar.com/news/guitars/les-paul-the-man-behind-the-machine-639722'],
      ['The Log, Country Music Hall of Fame. Via Premier Guitar', 'https://www.premierguitar.com/articles/Les_Pauls_Log_Solidbody_Guitar'],
      ['Les Paul and Mary Ford, 1954. TV Guide, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Les_Paul_and_Mary_Ford_1954.jpg'],
      ['Les Paul and Mary Ford, September 1952. Via Guitar Player, “See the crazy mods inside Les Paul’s ‘Number One’ Goldtop”', 'https://www.guitarplayer.com/news/see-the-crazy-mods-inside-les-pauls-number-one-goldtop'],
      ['“Number One” Goldtop. Via Guitar World, “The incredible story … of Les Paul’s ‘Number One’ Goldtop”', 'https://www.guitarworld.com/features/les-paul-number-one-goldtop-story'],
      ['Modified Les Paul Custom, Rock and Roll Hall of Fame. Zurich_99, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Late-1950s_Gibson_Les_Paul_Custom,_modified_by_Les_Paul_with_low_impedance_pickups,_microphone_jack,_and_controls_(possibly_the_prototype_of_Les_Paul_Personal_in_1969)_-_Rock_and_Roll_Hall_of_Fame_(2014-07-12_13.04.12_by_Zurich_99).jpg'],
    ],
  },
  'stevie-ray-vaughan': {
    years: '1973–1990',
    hero: { src: 'srv-hero.jpg', alt: 'Stevie Ray Vaughan in a cowboy hat and blue jacket playing Lenny on stage', pos: '50% 22%' },
    lead: 'Vaughan played Stratocasters almost exclusively and was notoriously hard on them, so they needed constant repair, first from Charley Wirz of Charley’s Guitar Shop in Dallas and then from Rene Martinez, who worked there. He used only a few, mostly vintage pedals and favored Fender and Marshall amps, yet he could hear the smallest fault, even with 32 amplifiers running into the desk for In Step.',
    gear: [
      {
        id: 'number-one',
        name: 'Number One',
        sub: 'Fender Stratocaster, 1963 body, 1962 neck',
        years: '1973–1990',
        text: 'He also called it his “First Wife.” Vaughan always said it was a 1959, the date written on the back of its pickups, but Rene Martinez, who looked after it from 1980, found 1963 stamped in the body and 1962 on the neck. Ray Hennig of Heart of Texas Music in Austin let him have it in 1973. It carried a left-handed tremolo, though Vaughan was right-handed, and a burn on the headstock from a cigarette left under the low E too long. It is on all five of his studio albums. The neck was refretted until it could take no more and swapped in 1989; after his death the original went back on, and the guitar passed to his brother Jimmie. Fender’s SRV signature Stratocaster, based on it, came out in 1992.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'srv-number-one-1983.jpg', alt: 'Vaughan playing Number One behind his head at the Keystone, Berkeley, August 1983' } },
          'text',
          { type: 'pair', small: { src: 'srv-number-one-italy.jpg', alt: 'Close-up of Number One’s worn body and SRV pickguard during a show in Italy, 1985' }, big: { src: 'srv-number-one-bw.jpg', alt: 'Vaughan in a hat bending over Number One at the Warfield Theater, San Francisco, November 1984' } },
          { type: 'center', size: 'mid', img: { src: 'srv-number-one-live.jpg', alt: 'Vaughan grimacing as he plays the worn sunburst Number One, its pickguard marked SRV' } },
        ],
      },
      {
        id: 'lenny',
        name: 'Lenny',
        sub: 'Fender Stratocaster, 1965',
        years: '1980–1990',
        text: 'Vaughan saw it in an Austin pawnshop around 1979 but could not afford the $350. His wife, Lenora, had friends put in $50 each and gave it to him on October 3, 1980, his 26th birthday, at a club where he often played. A previous owner had refinished it a dark natural and inlaid an old mandolin-style pickguard behind the bridge. In 1981 Vaughan fitted a mid-’50s-style maple neck and added his signature and initials. He named the instrumental “Lenny” after her. Guitar Center bought the guitar at Christie’s in 2004 for $623,500.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'srv-lenny-body.jpg', alt: 'Lenny’s natural-finish body with the inlaid mandolin pickguard behind the bridge' } },
          'text',
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Stevie Ray Vaughan’s musical instruments”', 'https://en.wikipedia.org/wiki/Stevie_Ray_Vaughan%27s_musical_instruments'],
      ['Bullock Texas State History Museum, “‘Number One’ Fender Stratocaster”', 'https://thestoryoftexas.com/discover/artifacts/number1-fender-strat'],
      ['MusicRadar, Rene Martinez remembers Stevie Ray Vaughan', 'https://www.musicradar.com/news/we-enjoyed-each-others-company-a-lot-we-were-in-it-for-the-duration-of-our-lives-stevie-ray-vaughans-tech-rene-martinez-remembers-his-boss-friend-and-blues-guitar-legend'],
      ['Guitar.com, “Guitar legends: Stevie Ray Vaughan”', 'https://guitar.com/guides/essential-guide/guitar-legends-stevie-ray-vaughan/'],
      ['Ground Guitar, “Stevie Ray Vaughan’s 1965 Fender Stratocaster ‘Lenny’”', 'https://www.groundguitar.com/stevie-ray-vaughan-gear/stevie-ray-vaughans-1965-fender-stratocaster-lenny/'],
      ['Premier Guitar, “SRV’s Lenny”', 'https://www.premierguitar.com/articles/srv-s-lenny-1'],
    ],
    credits: [
      ['Strip: the Ritz, 1980s. Bbadventure, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Ritz_Theater_White_Suite.jpg'],
      ['Vaughan with Lenny. Via MusicRadar', 'https://www.musicradar.com/news/we-enjoyed-each-others-company-a-lot-we-were-in-it-for-the-duration-of-our-lives-stevie-ray-vaughans-tech-rene-martinez-remembers-his-boss-friend-and-blues-guitar-legend'],
      ['Vaughan with Number One. Via Guitar Player', 'https://guitarplayer.com/players/srv-albert-king-and-left-handed-whammy-bar'],
      ['Keystone, Berkeley, 1983; Warfield Theater, San Francisco, 1984. Via Guitar Player, “Stevie Ray Vaughan talks his Number One Strat, Dumble amps, and craziest gigs”', 'https://www.guitarplayer.com/players/stevie-ray-vaughan-couldnt-stand-the-weather'],
      ['Number One in Italy, 1985. Via Guitar Player, “Stevie Ray Vaughan’s guitar and amp secrets”', 'https://www.guitarplayer.com/gear/stevie-ray-vaughan-and-cesar-diaz'],
      ['Lenny. Via Ground Guitar', 'https://www.groundguitar.com/stevie-ray-vaughan-gear/stevie-ray-vaughans-1965-fender-stratocaster-lenny/'],
    ],
  },
  'keith-richards': {
    years: '1964–',
    hero: { src: 'keith-hero.jpg', alt: 'Keith Richards in sunglasses and a print shirt playing a black Les Paul on a TV stage, 1966', pos: '50% 25%' },
    lead: 'A break from touring in 1967 and 1968 gave Richards time to try open tunings. The one he settled on is open G with five strings, G–D–G–B–D: he takes the low string off and leaves those notes to the bass, saying it only got in the way. He has credited banjo tuning as the idea. It is the sound of “Honky Tonk Women,” “Brown Sugar” and “Start Me Up.”',
    gear: [
      {
        id: 'keith-burst',
        name: 'Keith Burst',
        sub: 'Gibson Les Paul Standard, 1959',
        years: '1964–1966',
        text: 'A sunburst 1959 Les Paul Standard, serial 9 3182, fitted with a Bigsby vibrato. Richards bought it second-hand in London in the late summer of 1964, three years after Gibson had dropped the model, and became the first star guitarist on the British scene to play one. It is the guitar he played on the Rolling Stones’ first Ed Sullivan Show appearance on October 25, 1964. It is now on loan to the Metropolitan Museum of Art.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'keith-burst-sullivan.jpg', alt: 'Richards playing the sunburst Les Paul on The Ed Sullivan Show, 1964' } },
          'text',
          { type: 'pair', small: { src: 'keith-burst-oslo-1965.jpg', alt: 'Richards in a fur hat playing the Les Paul with Bigsby in Oslo, 1965' }, big: { src: 'keith-burst-met.jpg', alt: 'The 1959 Les Paul Standard in a case at the Metropolitan Museum of Art, 2019' } },
          { type: 'center', size: 'mid', img: { src: 'keith-burst-closeup.jpg', alt: 'Close-up of the Les Paul’s faded sunburst top and Bigsby' } },
        ],
      },
      {
        id: 'micawber',
        name: 'Micawber',
        sub: 'Fender Telecaster, early 1950s',
        years: '1970–',
        text: 'A butterscotch Telecaster from 1953 or 1954 that, by most accounts, Eric Clapton gave Richards for his 27th birthday in December 1970. Richards strung it with five strings in open G during the Exile on Main St. sessions, and its bridge was modified with the low E saddle removed; locking tuners came later. In the 1980s he named it after Wilkins Micawber, the incurable optimist of Dickens’s David Copperfield. It has been his main five-string ever since, on “Brown Sugar,” “Honky Tonk Women” and “Can’t You Hear Me Knocking.”',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'keith-micawber-1970s.jpg', alt: 'Richards in a white satin shirt playing Micawber on a dark stage, 1970s' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'keith-micawber-live.jpg', alt: 'Richards in a leather jacket striking a wide-legged pose with Micawber on an outdoor stage' }, small: { src: 'keith-micawber-museum.jpg', alt: 'A butterscotch Telecaster labeled for Keith Richards in Fender’s factory museum' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Keith Richards”', 'https://en.wikipedia.org/wiki/Keith_Richards'],
      ['The Metropolitan Museum of Art, “Les Paul Standard, serial #9 3182”', 'https://www.metmuseum.org/art/collection/search/752448'],
      ['The Metropolitan Museum of Art, “‘Micawber’ Telecaster”', 'https://www.metmuseum.org/art/collection/search/752459'],
      ['Guitar Player, “The Rolling Stones, Ed Sullivan and the Keith Burst”', 'https://www.guitarplayer.com/news/the-rolling-stones-ed-sullivan-and-the-keith-burst'],
      ['Ground Guitar, “Keith Richards’ 1959 Gibson Les Paul ‘Keith burst’”', 'https://www.groundguitar.com/keith-richards-guitars-and-gear/keith-richards-1959-gibson-les-paul-keith-burst/'],
      ['Reverb, “A Blackguard Named Micawber: Keith Richards’ No. 1 Fender Telecaster”', 'https://reverb.com/news/a-blackguard-named-micawber-keith-richards-no-1-fender-telecaster'],
      ['Fender, “Iconic Mods: The Legend of Keith Richards’ Micawber”', 'https://www.fender.com/articles/behind-the-scenes/iconic-mods-the-legend-of-keith-richards-micawber'],
      ['Guitar World, “Keith Richards’ guitars: a complete guide”', 'https://www.guitarworld.com/features/keith-richards-a-life-in-guitars'],
    ],
    credits: [
      ['Strip: Richards on stage, 1970s. Via Mixdown, “Gear Rundown: Keith Richards”', 'https://mixdownmag.com.au/features/gear-rundown-keith-richards/'],
      ['Richards in 1966; Micawber in the 1970s. Via Guitar World, “Keith Richards: electric guitar hasn’t improved since Les Paul and Leo Fender”', 'https://www.guitarworld.com/features/keith-richards-interview-electric-guitar-les-paul-leo-fender'],
      ['The Ed Sullivan Show, 1964. Via Guitar Player', 'https://www.guitarplayer.com/news/the-rolling-stones-ed-sullivan-and-the-keith-burst'],
      ['Messehallen, Skøyen, Oslo, 1965. CC BY 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:The_Rolling_Stones,_konsert_i_messehallen_p%C3%A5_Sk%C3%B8yen,_1965_-_Keith_Richard_playing_1959_Gibson_Les_Paul_Standard_with_Bigsby.jpg'],
      ['Les Paul Standard, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Keith_Richards%27_1959_Gibson_Les_Paul_Standard(serial_9_3182)_-_Play_It_Loud._MET_(2019-05-13_19-09-12_by_Eden,_Janine_and_Jim).jpg'],
      ['Les Paul Standard close-up. Via Guitar Player', 'https://guitarplayer.com/gear/1959-Gibson-Les-Paul-Standard-Keith-Richards'],
      ['Telecaster at Fender’s factory museum. Mr. Littlehand, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:FGF_museum_04._Keith_Richards_Telecaster.jpg'],
      ['Richards with Micawber. Via Guitar World, “Keith Richards on his love affair with the guitar at 82”', 'https://www.guitarworld.com/artists/guitarists/keith-richards-rolling-stones-2026-interview'],
    ],
  },
  'angus-young': {
    years: '1973–',
    hero: { src: 'angus-hero.jpg', alt: 'Angus Young in his school uniform looking up as he plays a red SG under a spotlight', pos: '50% 10%' },
    lead: 'Young started on a banjo restrung with six strings. Around 1970, after leaving school, he bought a secondhand Gibson SG from a shop near his home, and he has played SGs ever since, mostly through Marshall Super Lead heads and 4x12 cabinets. The school uniform was his sister Margaret’s idea.',
    gear: [
      {
        id: 'sg',
        name: 'Gibson SG',
        sub: 'Gibson SG Standard, late 1960s',
        years: '1970–',
        text: 'He remembered the first one as “about a ’67”: dark brown, with a very slim neck like a Custom’s. He played it until sweat and water rotted the wood and warped the neck. Gibson’s Angus Young SG is based on a 1969–71 SG Standard. One of his SGs got lightning-bolt fingerboard inlays during a repair by luthier John Diggins and became his main studio guitar; on stage his main SG is a 1967 Standard in ebony. Around 1977 at least two of them had wireless circuitry built into a cavity routed in the back, an idea dropped because sweat could short it.',
        rows: [
          { type: 'bleed', img: { src: 'angus-sg-1981.jpg', alt: 'Brian Johnson singing at the front of the stage while Young plays his SG behind him, 1981' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'angus-sg-1976.jpg', alt: 'Young, shirtless, leaning over his SG beside Bon Scott at the Lyceum, London, 1976' }, small: { src: 'angus-sg-1983.jpg', alt: 'Young playing a red SG in front of Marshall stacks at Madison Square Garden, 1983' } },
        ],
      },
      {
        id: 'schaffer-vega',
        name: 'Schaffer-Vega',
        sub: 'Schaffer-Vega Diversity System, 1976',
        years: '1977–',
        text: 'Ken Schaffer designed it in New York in 1975 and 1976 after touring with the Rolling Stones, and the Vega Corporation built it in California. It used two complete receivers rather than two antennas, the first “true diversity” wireless, and compressed the signal 2:1 on the way out to keep it clean. Young began using it in 1977. Its built-in volume boost pushed his amps harder, so he used it as a booster too, on stage and in the studio, for chosen rhythm parts and all his leads. In a 1984 Guitar Player interview, asked whether he used any effects, he said he had just the Schaffer-Vega. Once the units were gone, he used a replica of its preamp with a Shure wireless for Rock or Bust.',
        rows: [
          { type: 'pair', small: { src: 'angus-svds-ad.jpg', alt: '1970s advertisement for Ken Schaffer’s wireless with a guitarist under a parachute' }, big: { src: 'angus-svds-unit.jpg', alt: 'A Schaffer-Vega receiver and transmitter on a wooden floor with its manual' } },
          'text',
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Angus Young”', 'https://en.wikipedia.org/wiki/Angus_Young'],
      ['Wikipedia, “Schaffer–Vega diversity system”', 'https://en.wikipedia.org/wiki/Schaffer%E2%80%93Vega_diversity_system'],
      ['Ground Guitar, “Angus Young’s 1970/71 Gibson SG Standard”', 'https://www.groundguitar.com/angus-young-gear/angus-youngs-1970-71-gibson-sg-standard/'],
      ['Ground Guitar, “Angus Young’s Schaffer-Vega Diversity System”', 'https://www.groundguitar.com/angus-young-gear/angus-youngs-schaffer-vega-diversity-system/'],
      ['SoloDallas, “The Schaffer-Vega Diversity System”', 'https://solodallas.com/blogs/blog/the-schaffer-vega-diversity-system'],
      ['SoloDallas, “Angus Young’s first Gibson SG”', 'https://solodallas.com/angus-youngs-first-gibson-sg'],
      ['Guitar World, “AC/DC’s Angus Young on his SG” (1984 interview)', 'https://guitarworld.com/features/acdc-angus-young-sg-fender-1984'],
    ],
    credits: [
      ['Strip: Hammersmith Odeon, 1979; the Lyceum, 1976; on stage, 1981. Via Guitar World, “Angus Young traces the lineage of AC/DC”', 'https://www.guitarworld.com/artists/bands/ac-dc-live-retrospective'],
      ['Joe Louis Arena, Detroit, 1983; Madison Square Garden, 1983. Via Guitar World, “Why AC/DC’s Angus Young prefers Gibson SG guitars to Fenders”', 'https://guitarworld.com/features/acdc-angus-young-sg-fender-1984'],
      ['Schaffer wireless advertisement. Via SoloDallas', 'https://solodallas.com/blogs/blog/the-schaffer-vega-diversity-system'],
      ['Schaffer-Vega Diversity System unit. CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Schaffer-Vega_Diversity_System_Unit.jpg'],
    ],
  },
  'david-gilmour': {
    years: '1968–',
    hero: { src: 'gilmour-hero.jpg', alt: 'David Gilmour with long hair looking down at his Stratocaster, 1970s', pos: '50% 20%' },
    lead: 'Gilmour joined Pink Floyd in 1968 and became its lead guitarist. On the Dark Side of the Moon tours of 1973 to 1975 he carried more than ten Hiwatt heads and checked each one himself at soundcheck. For most of the band’s best-known records he played one black Stratocaster.',
    gear: [
      {
        id: 'black-strat',
        name: 'The Black Strat',
        sub: 'Fender Stratocaster, 1969',
        years: '1970–',
        text: 'A 1969 Stratocaster with a large headstock and maple-cap fingerboard, originally sunburst but refinished black at Manny’s Music in New York, where Gilmour bought it in May 1970 to replace guitars stolen with the band’s rented van in New Orleans. It first appeared with him at the Bath Festival that summer. He kept changing it: a 1963 rosewood neck in 1972, a Gibson PAF humbucker between the bridge and middle pickups in 1973, later DiMarzio and Seymour Duncan bridge pickups, for a while a Kahler tremolo. It is on “Money,” the whole of “Shine On You Crazy Diamond” and the “Comfortably Numb” solo. Retired in 1986, it came back from a Hard Rock Cafe loan in 1997 in poor shape, was restored, and returned for Live 8 in 2005. At Christie’s in June 2019 it sold for $3,975,000, then a record, for the environmental charity ClientEarth.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'gilmour-black-strat.jpg', alt: 'The Black Strat’s worn black body, black pickguard and maple neck' } },
          'text',
          { type: 'pair', small: { src: 'gilmour-black-strat-exhibit.jpg', alt: 'The Black Strat standing in a red-walled exhibition case' }, big: { src: 'gilmour-black-strat-live8.jpg', alt: 'Gilmour playing the Black Strat with Pink Floyd at Live 8, Hyde Park, 2005' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “The Black Strat”', 'https://en.wikipedia.org/wiki/The_Black_Strat'],
      ['Fender, “Iconic Mods: Why David Gilmour’s Famous Black Strat Is So Special”', 'https://www.fender.com/articles/behind-the-scenes/iconic-mods-why-david-gilmour-s-famous-black-strat-is-so-special'],
      ['Guitar World, “Inside the guitar sounds of The Dark Side of the Moon”', 'https://www.guitarworld.com/features/pink-floyd-the-dark-side-of-the-moon-guitar-sounds'],
      ['Reverb, “David Gilmour’s Black Strat Sells for Record-Breaking $3,975,000”', 'https://reverb.com/news/david-gilmours-black-strat-white-strat-and-118-more-sell-at-auction'],
      ['Christie’s, “The David Gilmour Guitar Collection sells for $21.5 million”', 'https://www.christies.com.cn/en/stories/david-gilmour-collection-auction-results-2cbfd7770850419dbc5b91a607c8827f'],
      ['Gilmourish, “Classic tone: Shine On You Crazy Diamond”', 'https://www.gilmourish.com/?p=287'],
    ],
    credits: [
      ['Strip: Pink Floyd in concert. Erik Calonius, NARA, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:ROCK_CONCERT._(FROM_THE_SITES_EXHIBITION._FOR_OTHER_IMAGES_IN_THIS_ASSIGNMENT,_SEE_FICHE_NUMBERS_42,_97.)_-_NARA_-_553890.jpg'],
      ['Gilmour, 1970s. Via American Songwriter', 'https://americansongwriter.com/dark-side-of-the-moon/'],
      ['The Black Strat. Via Guitar World', 'https://www.guitarworld.com/gear/electric-guitars/david-gilmour-black-strat-heading-to-the-auction-block-again'],
      ['The Black Strat on display. TheTankman, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Black_Strat.jpg'],
      ['Live 8, Hyde Park, 2005. Via Guitar World, “Pink Floyd: The Black Strat tells history of David Gilmour’s iconic guitar”', 'https://guitarworld.com/features/pink-floyd-black-strat-tells-history-david-gilmours-iconic-guitar'],
    ],
  },
  'the-edge': {
    years: '1976–',
    hero: { src: 'edge-hero.jpg', alt: 'The Edge in a sleeveless check shirt playing his Explorer under stage lights, early 1980s', pos: '50% 25%' },
    lead: 'The Edge’s sound rests on echo. After buying his first delay, an Electro-Harmonix Memory Man, he used its repeats to fill in notes he was not playing, “like two guitar players rather than one,” often with the delay set to a dotted eighth note. Behind it sits a 1964 Vox AC30 Top Boost, chosen for its sparkle, in the studio and on stage.',
    gear: [
      {
        id: 'explorer',
        name: 'Gibson Explorer',
        sub: 'Gibson Explorer Limited Edition, 1976',
        years: '1976–',
        text: 'For U2’s early years it was his only guitar: a 1976 Limited Edition reissue of Gibson’s Explorer, mahogany in a natural finish, found in a New York music shop while he was there on holiday as a teenager. He disliked the sound of its low strings and avoided them, which pushed him toward a trebly style built on one area of the fretboard, with open strings ringing the same note “almost like a 12-string.” He has said the guitar holds most of the sounds of Boy, October and War. His tech later persuaded him to retire it from the road. It sold at Christie’s in New York in March 2026, with the Jim Irsay Collection, for $635,000.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'edge-explorer.jpg', alt: 'The Edge’s 1976 Explorer, natural mahogany with a white pickguard and gold hardware' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'edge-explorer-live.jpg', alt: 'The Edge in a beanie playing a natural Explorer on stage' }, small: { src: 'edge-explorer-drammen.jpg', alt: 'The Edge singing at the microphone with the Explorer at Drammenshallen' } },
        ],
      },
    ],
    sources: [
      ['Wikipedia, “The Edge”', 'https://en.wikipedia.org/wiki/The_Edge'],
      ['Gibson, “Up Close With The Edge’s 1976 Explorer From The Jim Irsay Collection”', 'https://www.gibson.com/blogs/gibson-gazette/up-close-with-the-edge-s-1976-explorer-from-the-jim-irsay-collection'],
      ['Jim Irsay Collection, “The Edge’s (U2) 1976 Gibson Explorer”', 'https://collection.jimirsaycollection.com/objects/1076/the-edges-u2-1976-gibson-explorer'],
      ['Guitar World, “Jim Irsay Collection guitar auction: final results”', 'https://www.guitarworld.com/gear/guitars/jim-irsay-collection-guitar-auction-final-results'],
      ['Louder, “The guitars that built rock: the Gibson Explorer”', 'https://www.loudersound.com/features/the-guitars-that-built-rock-the-gibson-explorer'],
    ],
    credits: [
      ['Strip: U2 in Toronto, May 19, 1981. P Douglas Middlemiss, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Bono_and_Edge_of_U2_in_Toronto_5-19-81.jpg'],
      ['The Edge, early 1980s. Via Guitar Player, “Master the Edge’s stylistic moves from War”', 'https://www.guitarplayer.com/lessons/the-edge-u2-war'],
      ['The Edge with the Explorer on stage. Via Guitar World, “The Edge guitar lesson: how to use a delay”', 'https://www.guitarworld.com/lessons/artist-lessons/the-edge-u2-rock-style'],
      ['The Edge at Drammenshallen. Hans Arne Nakrem, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Edge_Drammenshallen.jpg'],
      ['The Edge’s 1976 Explorer. Via Gibson', 'https://www.gibson.com/blogs/gibson-gazette/up-close-with-the-edge-s-1976-explorer-from-the-jim-irsay-collection'],
    ],
  },
  'pete-townshend': {
    years: '1964–',
    hero: { src: 'townshend-hero.jpg', alt: 'Pete Townshend in a work shirt swinging his arm over a Les Paul Deluxe, Winterland, 1976', pos: '50% 16%' },
    lead: 'Townshend played rhythm as a show: windmill strokes, leaps and, for years, smashed guitars, which meant replacing them all the time. He ran them through Hiwatt and Sound City amps, at times after a Univox Super Fuzz.',
    gear: [
      {
        id: 'sg-special',
        name: 'Gibson SG Special',
        sub: 'Gibson SG Special, 1969',
        years: '1968–1971',
        text: 'A cherry-red SG Special with two P-90 “soapbar” pickups and the stock vibrato tailpiece taken off. Townshend played SG Specials almost exclusively from 1968 to 1971: at Woodstock and the Isle of Wight, on Live at Leeds and through the Tommy years, and he broke a good number of them. He began moving away from them after 1971, when Gibson changed the model’s specifications and the supply of the old cherry ones ran out. One he smashed in 1973 for an Annie Leibovitz shoot for Rolling Stone ended up sealed in Lucite. Gibson made a Pete Townshend SG Special in 2000.',
        rows: [
          { type: 'bleed', img: { src: 'townshend-sg-hamburg-band.jpg', alt: 'Townshend raising his arm over the SG on stage with Roger Daltrey and Keith Moon, Hamburg, 1972' } },
          'text',
          { type: 'pair', small: { src: 'townshend-sg-hamburg.jpg', alt: 'Townshend singing with the cherry SG Special, Hamburg, 1972' }, big: { src: 'townshend-sg-met.jpg', alt: 'A 1969 SG Special beside John Entwistle’s Thunderbird basses at the Metropolitan Museum of Art' } },
          { type: 'center', size: 'mid', img: { src: 'townshend-sg-lucite.jpg', alt: 'The pieces of a smashed SG Special sealed in a block of Lucite' } },
        ],
      },
      {
        id: 'les-paul-deluxe',
        name: 'Les Paul Deluxe',
        sub: 'Gibson Les Paul Deluxe, 1970s',
        years: '1973–1980s',
        text: 'When the SG Specials ran out, Townshend moved to Gibson Les Paul Deluxes around 1973, Les Pauls with small mini-humbucking pickups. Each was marked with a large number on the body; the Metropolitan Museum’s “No. 6” is a 1975 Deluxe. They went into Hiwatt heads such as his 1969 Custom 100, now at the Rock and Roll Hall of Fame next to a Deluxe from about 1972.',
        rows: [
          { type: 'pair', flip: true, big: { src: 'townshend-deluxe-hiwatt.jpg', alt: 'Townshend’s 1969 Hiwatt head and cabinet with a Les Paul Deluxe at the Rock and Roll Hall of Fame' }, small: { src: 'townshend-deluxe-no6.jpg', alt: 'The Les Paul Deluxe marked No. 6 at the Metropolitan Museum of Art' } },
          'text',
        ],
      },
    ],
    sources: [
      ['The Metropolitan Museum of Art, “SG Special (serial no. 561569)”', 'https://www.metmuseum.org/art/collection/search/780396'],
      ['thewho.net, “Pete’s Gear: Gibson SG Special”', 'https://www.thewho.net/whotabs/sg.htm'],
      ['thewho.net, “Pete Townshend’s Guitar Gear History”', 'https://www.thewho.net/whotabs/equipment.htm'],
      ['Guitar Player, “Pete Townshend on the Gibson SG Special”', 'https://guitarplayer.com/guitars/electric-guitars/pete-townshend-on-the-gibson-sg-special'],
      ['Reverb, “The Who’s Live at Leeds: A Primer for Pete Townshend’s Tone”', 'https://reverb.com/news/the-whos-live-at-leeds-a-primer-for-pete-townshends-tone'],
      ['Premier Guitar, “Pete Townshend on guitar smashing regrets…”', 'https://www.premierguitar.com/pete-townshend-on-guitar-smashing-regrets-stylistic-evolution-and-becoming-a-gear-aficionado'],
    ],
    credits: [
      ['Strip: Hamburg, 1972. GladstoneHH, CC BY 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Pete_Townshend_Micro-Kick_1972_in_Hamburg.jpg'],
      ['Winterland, San Francisco, 1976. Bill Abbott, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Pete_Townshend,_The_Who,_Winterland,_San_Francisco,_Mar_28,_1976_-_49_years_ago_-_Flickr_-_wbaiv.jpg'],
      ['The Who, Hamburg, 1972. Heinrich Klaffs, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:The_Who_Hamburg_1972.jpg'],
      ['Hamburg, 1972. GladstoneHH, CC BY 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Pete_Townshend_1972_in_Hamburg.jpg'],
      ['SG Special and Thunderbirds, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:John_Entwistle_(The_Who)%27s_one_of_two_Gibson_Thunderbird_IV_(1964,_serial_no._160065),_Pete_Townshend%27s_Gibson_SG_Special_(1969,_serial_no._561569)_-_Play_It_Loud._MET_(2019-05-13_19.36.28_by_Eden,_Janine_and_Jim).jpg'],
      ['SG Special in Lucite, “Play It Loud.” Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Pete_Townshend%27s_memorabilia,_Gibson_SG_Special_in_Lucite_(c.1973),_smashed_by_him_for_Rolling_Stone_photo_shoot_by_Annie_Leibovitz_in_1973,_then_encased_in_Lucite_by_her_-_Play_It_Loud._MET_(2019-05-13_19.35.58_by_Eden,_Janine_and_Jim).jpg'],
      ['Les Paul Deluxe “No. 6,” “Play It Loud.” Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Pete_Townshend%27s_%22No._6%22_1975_Gibson_Les_Paul_Deluxe_(serial_no._133592)_-_Play_It_Loud._MET_(2019-05-13_18.49.40_by_Eden,_Janine_and_Jim).jpg'],
      ['Hiwatt and Les Paul Deluxe, Rock and Roll Hall of Fame. Zurich_99, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:The_Who,_Pete_Townshend%27s_1969_Hi-Watt_Custom_Hiwatt_100_amp_head_%26_cab.,_c.1972_Gibson_Les_Paul_Deluxe,_and_Roger_Daltrey%27s_Helmet_(ca.1974),_-_Rock_and_Roll_Hall_of_Fame_(2014-07-12_16.01.03_by_Zurich_99).jpg'],
    ],
  },
  'prince': {
    years: '1978–2016',
    hero: { src: 'prince-hero.jpg', alt: 'Prince bending over a white Cloud in purple and white light, Purple Rain tour, 1985', pos: '50% 25%' },
    lead: 'Prince played most of the instruments on his own records from the start, and on stage he was a lead guitarist as much as a singer. His guitars were as much a part of the look as the clothes: a Japanese Tele copy with a leopard-print guard, a curling white Cloud made for Purple Rain, and later a guitar in the shape of his own name.',
    gear: [
      {
        id: 'mad-cat',
        name: 'Mad Cat',
        sub: 'Hohner H.S. Anderson Mad Cat, late 1970s',
        years: 'c. 1980–2016',
        text: 'A Telecaster-style guitar with a leopard-print pickguard, designed in Japan by Hidesato Shiino for the H.S. Anderson brand that Moridaira launched in 1973 and sold in a small batch in the U.S. with a Hohner logo. Prince is thought to have bought his around 1980 and kept it for good; under the Tele outline its hardware and pickups are closer to a hardtail Stratocaster. Hohner later put out a production version named The Prinz.',
        rows: [
          { type: 'pair', small: { src: 'prince-madcat-met.jpg', alt: 'Prince’s Hohner Mad Cat with its leopard pickguard at the Metropolitan Museum of Art' }, big: { src: 'prince-madcat-coachella.jpg', alt: 'Prince playing the Mad Cat at Coachella, 2008' } },
          'text',
        ],
      },
      {
        id: 'cloud',
        name: 'Cloud',
        sub: 'Custom solid-body by Dave Rusan, 1983',
        years: '1984–',
        text: 'Built for the film Purple Rain by Dave Rusan, a luthier at Knut-Koupée Music in Minneapolis, with a body that sweeps up into a scroll on the upper horn. Rusan has said the best plan was to make a guitar he would enjoy playing himself. He built four Clouds for Prince, who had them refinished over the years; a yellow one is in the Smithsonian’s National Museum of American History. Rusan trademarked the shape in 2018, which led to a dispute with Prince’s estate.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'prince-cloud-1984.jpg', alt: 'Prince in a purple coat raising his arm with the white Cloud, Joe Louis Arena, Detroit, November 1984' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'prince-cloud-1989.jpg', alt: 'Prince with a blue Cloud on stage in New York, 1989' }, small: { src: 'prince-cloud-smithsonian-2.jpg', alt: 'The yellow Cloud lit up in its case at the National Museum of American History' } },
        ],
      },
      {
        id: 'love-symbol',
        name: 'Love Symbol',
        sub: 'Custom guitar by Jerry Auerswald, 1993',
        years: '1993–',
        text: 'In 1993 Prince replaced his name with an unpronounceable symbol, and luthier Jerry Auerswald built him a guitar in its shape, gold, with the neck rising out of the symbol’s loop. It was shown at the Metropolitan Museum of Art in the 2019 exhibition Play It Loud.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'prince-symbol-met.jpg', alt: 'The gold Love Symbol guitar at the Metropolitan Museum of Art, 2019' } },
          'text',
        ],
      },
    ],
    sources: [
      ['Wikipedia, “Prince (musician)”', 'https://en.wikipedia.org/wiki/Prince_(musician)'],
      ['Guitar Player, “Dave Rusan reveals the magic behind Prince’s iconic solidbody”', 'https://www.guitarplayer.com/gear/the-best-plan-was-to-make-a-guitar-i-would-enjoy-playing-dave-rusan-reveals-the-magic-behind-princes-iconic-solidbody'],
      ['Guitar.com, interview with Cloud luthier Dave Rusan', 'https://www.guitar.com/features/interviews/prince-cloud-guitar-luthier-dave-rusan/'],
      ['Guitar World, “Prince’s guitar builder fights estate to keep hold of Cloud design”', 'https://www.guitarworld.com/news/princes-guitar-builder-fights-estate-to-keep-hold-of-cloud-design'],
      ['Museum of Pop Culture, “Cloud guitar formerly owned by Prince”', 'https://mopop.emuseum.com/objects/156418/cloud-guitar-formerly-owned-by-prince'],
      ['MusicRadar, “H.S. Anderson Mad Cat: Prince discovered one of these rare guitars early on”', 'https://www.musicradar.com/news/the-wishlist-hs-anderson-vintage-reissue-mad-cat-mkii-prince-discovered-one-of-these-rare-guitars-early-on-in-his-career'],
      ['Guitar Cloud, “Hohner HG-490 ‘Mad Cat’”', 'https://www.guitarcloud.org/equipment/hohner-madcat'],
    ],
    credits: [
      ['Purple Rain tour, 1985. Via Guitar World, “Prince’s Cloud guitar builder Dave Rusan on how he made the iconic instrument”', 'https://www.guitarworld.com/gear/electric-guitars/prince-cloud-guitar-builder-dave-rusan'],
      ['Joe Louis Arena, Detroit, 1984. Via Guitar Player, “The best plan was to make a guitar I would enjoy playing”', 'https://www.guitarplayer.com/gear/the-best-plan-was-to-make-a-guitar-i-would-enjoy-playing-dave-rusan-reveals-the-magic-behind-princes-iconic-solidbody'],
      ['New York, 1989. Via MusicRadar, “The most significant Prince guitar that’ll ever come up for auction”', 'https://www.musicradar.com/news/the-most-significant-prince-guitar-thatll-ever-come-up-for-auction-is-for-sale'],
      ['Strip: Brussels, 1986. Yves Lorson, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Prince_Brussels_1986_(retouched).jpg'],
      ['Mad Cat, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Prince%27s_ca.1980s_Hohner_The_Prinz_-_Hohner_version_of_H.S.Anderson_HS-1_Mad_Cat_-_Play_It_Loud._MET_(2019-05-13_18.50.16_by_Eden,_Janine_and_Jim).jpg'],
      ['Coachella, 2008. Scott Penner, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Prince_with_MadCat,_Coachella_2008.jpg'],
      ['Cloud at the Smithsonian. Will from New York, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Prince_guitar_Smithsonian-20060219.jpg'],
      ['Love Symbol, “Play It Loud.” Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Prince%27s_Love_Symbol_(1993)_by_Jerry_Auerswald_-_Play_It_Loud._MET_(2019-05-13_19.28.44_by_Eden,_Janine_and_Jim).jpg'],
    ],
  },
  'slash': {
    years: '1985–',
    hero: { src: 'slash-hero.jpg', alt: 'Slash, curls over his face, playing a sunburst Les Paul with Guns N’ Roses at the Country Club, Reseda, 1985', pos: '50% 0%' },
    lead: 'Slash has played Gibson Les Pauls through Marshall heads for most of his career. The sound of Appetite for Destruction, though, came from a Les Paul that Gibson did not build.',
    gear: [
      {
        id: 'appetite',
        name: 'Appetite Les Paul',
        sub: 'Kris Derrig copy of a 1959 Les Paul Standard',
        years: '1986–',
        text: 'Late in the Appetite for Destruction sessions, Guns N’ Roses’ manager Alan Niven brought Slash a Les Paul made by Kris Derrig, a luthier in the Los Angeles area: a copy of a 1959 Les Paul Standard with some 1958 details. Slash said it sounded perfect, and it carried the album, through a rented Marshall from SIR modified with an extra gain stage. He took it on the road for all of 1987 and into 1988, and in under a year the wear on its top and back was done. He then bought factory-second Les Pauls for touring and kept the Derrig at home. In 2010 Gibson made the Slash Appetite Les Paul based on it, and Marshall the AFD100 head based on that amp.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'slash-appetite-limelight.jpg', alt: 'Slash in a top hat and leather jacket playing a flame-top Les Paul at the Limelight, New York, January 1988' } },
          'text',
          { type: 'pair', small: { src: 'slash-appetite-holding.jpg', alt: 'Slash with a cigarette, holding a flame-top Les Paul' }, big: { src: 'slash-appetite-1988.jpg', alt: 'Slash, shirtless, playing his Les Paul beside Izzy Stradlin at Poplar Creek, July 1988' } },
        ],
      },
    ],
    sources: [
      ['Guitar World, “Slash: Appetite for Reconstruction”', 'https://guitarworld.com/features/slash-appetite-reconstruction'],
      ['Guitar Player, “A Look Back at Slash’s Les Paul Standard Copy”', 'https://www.guitarplayer.com/gear/a-look-back-at-slashs-les-paul-standard-copy'],
      ['Premier Guitar, “Slash’s Appetite Les Paul”', 'https://www.premierguitar.com/gear/guitars/slash-appetite-les-paul'],
      ['Premier Guitar, “Gibson Slash Appetite Les Paul review”', 'https://www.premierguitar.com/gear/gibson-slash-appetite-les-paul-electric-guitar-review'],
      ['Guitar World, “Slash’s 5 most iconic guitars, in his own words”', 'https://www.guitarworld.com/gear/electric-guitars/slashs-5-most-iconic-guitars-in-his-own-words'],
      ['Wikipedia, “Kris Derrig”', 'https://en.wikipedia.org/wiki/Kris_Derrig'],
    ],
    credits: [
      ['Strip: Guns N’ Roses, 1987. Robert John, Geffen Records, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Gnr1987_(cropped_Slash).jpeg'],
      ['Country Club, Reseda, 1985; the Limelight, 1988; Poplar Creek, 1988. Via Guitar World, “Slash & Izzy Stradlin on making Appetite for Destruction”', 'https://www.guitarworld.com/features/slash-izzy-stradlin-guns-n-roses-appetite-destruction'],
      ['Slash with a Les Paul. Via Premier Guitar', 'https://www.premierguitar.com/gear/guitars/slash-appetite-les-paul'],
    ],
  },
  'george-harrison': {
    years: '1958–2001',
    hero: { src: 'harrison-hero.jpg', alt: 'George Harrison with long hair and a beard playing an acoustic guitar, around 1970', pos: '50% 25%' },
    lead: 'Harrison was the Beatles’ lead guitarist. He bought his first serious electric secondhand in Liverpool in 1961, and six years later he painted a Stratocaster himself in Day-Glo colors.',
    gear: [
      {
        id: 'duo-jet',
        name: 'Gretsch Duo Jet',
        sub: 'Gretsch 6128 Duo Jet, 1957',
        years: '1961–1963',
        text: 'Harrison bought it in the summer of 1961 for £75 from Ivan Hayward, a Liverpool cab driver and former merchant seaman who had bought it new in New York and was about to emigrate. It was his main guitar at the Cavern Club, and he played it at the Beatles’ first Abbey Road session on June 6, 1962. After mid-1963, as Beatlemania took hold, newer Gretsches, a Country Gentleman and a Tennessean, took over and the Duo Jet was mostly retired. It came back in 1987 on the cover of his album Cloud Nine, and Gretsch made a George Harrison tribute Duo Jet in 2011.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'harrison-duojet-cavern.jpg', alt: 'Harrison in a suit and tie with the black Duo Jet in front of the Cavern Club’s brick arches' } },
          'text',
          { type: 'center', size: 'mid', img: { src: 'harrison-duojet-close.jpg', alt: 'A black Gretsch Duo Jet with its cream pickguard and Bigsby vibrato' } },
        ],
      },
      {
        id: 'country-gentleman',
        name: 'Country Gentleman',
        sub: 'Gretsch 6122 Country Gentleman, 1963',
        years: '1963–1965',
        text: 'Harrison bought two Country Gentlemen new from Sound City in London in 1963, the second as a backup just before the Beatles left for America. He played it on The Ed Sullivan Show on February 9, 1964, where its dark brown finish read as black on television, and orders for Gretsch guitars poured in afterward. Through the Beatlemania years it was the guitar most people pictured in his hands. One Country Gentleman is said to have fallen off the back of the band’s car in Scotland in December 1965 and been run over, though Guitar Player has questioned which guitar that really was.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'harrison-gent-1965.jpg', alt: 'Harrison singing outdoors with the Country Gentleman, 1965' } },
          'text',
          { type: 'center', size: 'mid', img: { src: 'harrison-gent-stage.jpg', alt: 'Harrison in a Beatles suit playing the Country Gentleman on stage' } },
        ],
      },
      {
        id: 'rocky',
        name: 'Rocky',
        sub: 'Fender Stratocaster, 1961',
        years: '1967–',
        text: 'A 1961 Stratocaster in Sonic Blue that came to Harrison in 1965, delivered by the Beatles’ roadie Mal Evans along with a matching one for John Lennon. In 1967, between the Sgt. Pepper sessions and the “All You Need Is Love” broadcast of June 25, he painted it himself in Day-Glo colors. It is the guitar he plays in the Magical Mystery Tour film. By December 1969 he had added “Bebopalula” on the body, “Go Cat Go” on the pickguard and “Rocky” on the headstock. Fender’s Custom Shop made 100 copies in 2020.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'harrison-rocky-1974.jpg', alt: 'Harrison with a moustache playing Rocky on stage during the 1974 Dark Horse tour' } },
          'text',
          { type: 'pair', small: { src: 'harrison-rocky-close.jpg', alt: 'Close-up of Rocky’s hand-painted body and controls' }, big: { src: 'harrison-rocky-1967.jpg', alt: 'Harrison holding the painted Rocky outdoors during Magical Mystery Tour, John Lennon beside him, 1967' } },
        ],
      },
    ],
    sources: [
      ['Guitar Player, “Five of George Harrison’s Most Iconic Beatles-Era Guitars”', 'https://guitarplayer.com/gear/george-harrison-beatles-guitars'],
      ['Guitar World, “The Beatles: guitar by guitar”', 'https://www.guitarworld.com/features/the-beatles-guitar-by-guitar-a-guide-to-the-models-that-made-music-history'],
      ['Wikipedia, “Gretsch 6128”', 'https://en.wikipedia.org/wiki/Gretsch_6128'],
      ['The Beatles Bible, “George Harrison Gretsch Duo Jet guitar: limited edition reissue”', 'https://beatlesbible.com/2011/01/10/george-harrison-gretsch-duo-jet-guitar-limited-edition-reissue'],
      ['Guitar World, “George Harrison talks about his Rocky Fender Stratocaster”', 'https://www.guitarworld.com/artists/george-harrison-talks-about-his-rocky-fender-stratocaster'],
      ['Fender, “Introducing the George Harrison Rocky Stratocaster”', 'https://fender.com/george-harrison-rocky-stratocaster.html'],
      ['Far Out, “How George Harrison created his famous Fender Strat ‘Rocky’”', 'https://faroutmagazine.co.uk/how-george-harrison-created-fender-strat-rocky/'],
      ['Gretsch, “50 Years Ago: The Beatles—and Gretsch—on The Ed Sullivan Show”', 'https://blog.gretschguitars.com/2014/02/50-years-ago-the-beatles%E2%80%94and-gretsch%E2%80%94on-the-ed-sullivan-show/'],
      ['Guitar Player, “The mystery over George Harrison’s Gretsch Country Gentleman”', 'https://www.guitarplayer.com/news/the-mystery-over-george-harrisons-gretsch-country-gentleman'],
      ['The Beatles Bible, “George Harrison’s Gretsch guitar destroyed”', 'https://beatlesbible.com/1965/12/02/george-harrison-gretsch-guitar-destroyed'],
    ],
    credits: [
      ['Strip: The Ed Sullivan Show, 1964. Bernard Gotfryd, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:George_Harrison_at_the_Ed_Sullivan_Show_in_1964_(cropped).jpg'],
      ['Harrison, around 1970. Via MusicRadar, “The Beatles’ fab gear: 25 key pieces of kit”', 'https://www.musicradar.com/news/guitars/the-beatles-fab-gear-25-key-pieces-of-kit-594134'],
      ['Country Gentleman, 1965 and on stage; Rocky, 1974 Dark Horse tour. Via Guitar World, “The guitar history of George Harrison’s greatest recordings”', 'https://www.guitarworld.com/artists/guitarists/the-best-of-george-harrison-from-the-beatles-to-his-solo-adventures'],
      ['The Cavern Club, 1961; Duo Jet. Via Guitar Player', 'https://guitarplayer.com/gear/george-harrison-beatles-guitars'],
      ['Magical Mystery Tour, 1967. Via Extra Chill, “The History of George Harrison’s Famous Guitar, Rocky”', 'https://extrachill.com/?p=20819'],
      ['Rocky close-up. Via Guitar World', 'https://www.guitarworld.com/artists/george-harrison-talks-about-his-rocky-fender-stratocaster'],
    ],
  },
  'jeff-beck': {
    years: '1965–2023',
    hero: { src: 'beck-hero.jpg', alt: 'Jeff Beck in a dark jacket playing a Les Paul on stage, 1973', pos: '50% 5%' },
    lead: 'Jeff Beck took over from Eric Clapton in the Yardbirds in 1965, then led the Jeff Beck Group and Beck, Bogert & Appice before turning to instrumental records. The guitar on the cover of the first of those, Blow by Blow, was a Les Paul that had already been rebuilt once before he found it.',
    gear: [
      {
        id: 'oxblood',
        name: 'Oxblood',
        sub: 'Gibson Les Paul, 1954',
        years: '1972–1975',
        text: 'A 1954 Les Paul that left Gibson as a goldtop. By the time Beck found it in Memphis late in 1972, Strings & Things had refinished it a deep oxblood brown, swapped its P-90s for full-size humbuckers and shaved the neck. Christie’s names the seller as Buddy Davis, who had paid $400 and let it go for $500; other accounts gathered by Guitar World have Beck’s manager buying it in Little Rock. Beck played it with Beck, Bogert & Appice, in the encore of the last Ziggy Stardust show in July 1973, and on Blow by Blow (1975), whose cover painting shows him with it. The headstock, already broken once, snapped again on a flight in 1975 and was rebuilt by Gordon Wells, and after that year’s tour Beck moved to a Stratocaster. Gibson’s Custom Shop copied the guitar in 2009, 50 signed and 100 unsigned. At Christie’s in London on January 22, 2025, it sold for £1,068,500.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'beck-oxblood-live.jpg', alt: 'Beck in a white T-shirt playing the Oxblood Les Paul on stage, 1970s' } },
          'text',
          { type: 'pair', small: { src: 'beck-blow-by-blow.jpg', alt: 'The cover of Blow by Blow, a painting of Beck playing the Oxblood' }, big: { src: 'beck-oxblood-1977.jpg', alt: 'Beck in a denim shirt bent over the Oxblood’s black top and cream pickguard, 1977' } },
          { type: 'center', size: 'mid', img: { src: 'beck-oxblood-case.jpg', alt: 'The Oxblood’s worn dark-brown body and gold knobs in its case' } },
        ],
      },
    ],
    sources: [
      ['Guitar World, “Untangling the history of Jeff Beck’s Oxblood Les Paul”', 'https://www.guitarworld.com/gear/electric-guitars/the-story-of-jeff-beck-oxblood-les-paul'],
      ['Christie’s, “Jeff Beck: 10 guitars that shaped a legend”', 'https://www.christies.com.cn/en/stories/jeff-beck-the-guitar-collection-5e25618d90624e4a84e396653011cd72'],
      ['MusicRadar, “Jeff Beck’s famous Les Paul sells for more than £1m”', 'https://musicradar.com/artists/fans-will-know-it-from-the-cover-of-his-debut-solo-album-jeff-becks-famous-les-paul-sells-for-more-than-gbp1m'],
      ['Guitar World, “Highlights from the Jeff Beck gear auction”', 'https://guitarworld.com/gear/highlights-from-the-jeff-beck-gear-auction'],
      ['Wikipedia, “Jeff Beck”', 'https://en.wikipedia.org/wiki/Jeff_Beck'],
    ],
    credits: [
      ['Strip: Jeff Beck, 1972. Klaus Hiltscher, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jeff_Beck_1972.jpg'],
      ['Jeff Beck, 1973. Via Guitar World, “Untangling the history of Jeff Beck’s Oxblood Les Paul”', 'https://www.guitarworld.com/gear/electric-guitars/the-story-of-jeff-beck-oxblood-les-paul'],
      ['Oxblood on stage; Oxblood in its case. Via Guitar World, “Highlights from the Jeff Beck gear auction”', 'https://guitarworld.com/gear/highlights-from-the-jeff-beck-gear-auction'],
      ['Jeff Beck, 1977; Blow by Blow cover. Via Guitar Player', 'https://guitarplayer.com/news/watch-jeff-beck-demonstrate-his-oxblood-les-paul-amps-and-effects-in-this-historic-bbc-clip'],
    ],
  },
  'rory-gallagher': {
    years: '1963–1995',
    hero: { src: 'rory-hero.jpg', alt: 'Rory Gallagher playing his worn Stratocaster on stage, 1970', pos: '50% 25%' },
    lead: 'Rory Gallagher bought a secondhand Stratocaster in Cork when he was fifteen and was still playing it when he died in 1995. Setlist archives count more than 1,900 of his shows between 1971 and 1995, almost all of them with that one guitar.',
    gear: [
      {
        id: 'strat',
        name: 'Fender Stratocaster',
        sub: 'Sunburst Stratocaster, 1961',
        years: '1963–1995',
        text: 'Its first owner was Jim Conlon of the Royal Showband, who had ordered a red Stratocaster and was sent a sunburst one. He sold it on about six months later, and in 1963 Gallagher bought it at Crowley’s Music Store on Merchants Quay in Cork for £100, paid off in instalments. In October 1966 it was stolen together with a borrowed Telecaster; after RTÉ’s Garda Patrol broadcast the theft, both were found in a ditch a few days later. The sunburst began coming away around 1967–68, worn off by his strumming and his sweat. Over the years the original pickups failed and were replaced, the Kluson tuners gave way to Schallers and then Sperzels, a five-way switch replaced the three-way, and the neck was changed after it had to be dried out. It is on the covers of his albums from Deuce (1971) to Fresh Evidence (1990). On October 17, 2024, it went to auction at Bonhams in London with an estimate of £700,000 to £1,000,000.',
        rows: [
          { type: 'bleed', img: { src: 'rory-strat-1975.jpg', alt: 'Gallagher talking to the crowd with the Stratocaster slung low, 1975' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'rory-strat-vox.jpg', alt: 'The Stratocaster, worn to bare wood, leaning on a Vox amplifier' }, small: { src: 'rory-strat-back.jpg', alt: 'The worn back of the Stratocaster against his Vox amplifier' } },
          { type: 'center', size: 'mid', img: { src: 'rory-strat-headstock.jpg', alt: 'The Stratocaster’s headstock and mismatched tuners up close' } },
        ],
      },
    ],
    sources: [
      ['Guitar World, “How Rory Gallagher found his 1961 Fender Strat”', 'https://www.guitarworld.com/artists/guitarists/how-rory-gallagher-found-his-1961-fender-strat'],
      ['Guitar World, “Rory Gallagher’s Guitars: the sunburst Strat”', 'https://www.guitarworld.com/gear/electric-guitars/rory-gallaghers-guitars-excerpt-sunburst-strat'],
      ['Ground Guitar, “Rory Gallagher’s 1961 Fender Stratocaster”', 'https://www.groundguitar.com/rory-gallagher-gear/rory-gallaghers-1961-fender-stratocaster/'],
      ['Guitar Player, “Rory Gallagher’s Strat goes to auction”', 'https://guitarplayer.com/news/rory-gallagher-strat-auction'],
    ],
    credits: [
      ['Strip: London, 1975; the back of the Strat; the headstock. Via Guitar World, “Rory Gallagher’s Guitars: the sunburst Strat”', 'https://www.guitarworld.com/gear/electric-guitars/rory-gallaghers-guitars-excerpt-sunburst-strat'],
      ['Rory Gallagher, 1970 and 1975; the Strat and Vox. Via Guitar World, “How Rory Gallagher found his 1961 Fender Strat”', 'https://www.guitarworld.com/artists/guitarists/how-rory-gallagher-found-his-1961-fender-strat'],
    ],
  },
  'steve-vai': {
    years: '1980–',
    hero: { src: 'vai-hero.jpg', alt: 'Steve Vai in black and white with long dark hair, 1990', pos: '50% 10%' },
    lead: 'Steve Vai played in Frank Zappa’s band before going on to his own records, Passion and Warfare (1990) among them. Since 1987 his main guitars have been Ibanez JEMs, a model he designed with the company.',
    gear: [
      {
        id: 'evo',
        name: 'Evo',
        sub: 'Ibanez JEM, early 1990s',
        years: '1990s–',
        text: 'The JEM began in 1986, when Ibanez built one of Vai’s custom designs in about three weeks; the JEM777 was launched at NAMM in June 1987 with a handle cut through the body, a scoop behind the bridge so the vibrato could pull up, and the top frets scalloped. Evo is the white JEM that followed, made in 1992 by one account and 1993 by others, when the white JEM7V moved to an alder body. Vai named it after its DiMarzio Evolution pickups; in another telling the name comes from Harley-Davidson’s Evolution engine. It has been his main guitar on stage and on most of his records ever since. The neck broke on a tour of Australia and is now its third, and Les Paul signed the back in 1995 and 1998.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'vai-evo-live.jpg', alt: 'Vai bent over Evo, its white body covered in marks, on stage' } },
          'text',
          { type: 'pair', small: { src: 'vai-evo-standing.jpg', alt: 'Evo standing upright in front of an amplifier' }, big: { src: 'vai-evo-amp.jpg', alt: 'Evo’s worn white body, pickguard and “EVO” lettering in front of an amp' } },
        ],
      },
    ],
    sources: [
      ['Guitar World, “Meet Steve Vai’s Ibanez Jem Evo guitar”', 'https://www.guitarworld.com/gear/meet-steve-vais-ibanez-jem-evo-guitar'],
      ['MusicRadar, “The story of the Ibanez Jem”', 'https://www.musicradar.com/news/the-story-of-the-ibanez-jem'],
      ['MusicRadar, “Take a tour through Steve Vai’s career-defining guitars”', 'https://musicradar.com/news/take-a-tour-through-steve-vais-career-defining-guitars-followed-by-an-in-depth-gear-interview-with-the-man-himself'],
      ['Wikipedia, “Evo (guitar)”', 'https://en.wikipedia.org/wiki/Evo_(guitar)'],
      ['Wikipedia, “Steve Vai”', 'https://en.wikipedia.org/wiki/Steve_Vai'],
    ],
    credits: [
      ['Steve Vai, 1990. Via Guitar Player', 'https://guitarplayer.com/gear/steve-vai-passion-and-warfare-eventide-H3000-ultra-harmonizer'],
      ['Strip: Steve Vai on stage; Vai with Evo. Via MusicRadar, “The story of the Ibanez Jem”', 'https://www.musicradar.com/news/the-story-of-the-ibanez-jem'],
      ['Evo standing. Via MusicRadar', 'https://musicradar.com/news/take-a-tour-through-steve-vais-career-defining-guitars-followed-by-an-in-depth-gear-interview-with-the-man-himself'],
      ['Evo in front of an amp. Via Guitar World, “Steve Vai offers a guided tour of his favorite guitars”', 'https://guitarworld.com/features/steve-vai-guitar-collection'],
    ],
  },
  'yngwie-malmsteen': {
    years: '1983–',
    hero: { src: 'yngwie-hero.jpg', alt: 'Yngwie Malmsteen in a black jacket playing a cream Stratocaster at the Aragon Ballroom, Chicago, 1988', pos: '50% 20%' },
    lead: 'Yngwie Malmsteen came to the United States from Sweden, had short stays in Steeler and Alcatrazz, and in 1984 released Rising Force, built on classical runs played at speed. He has played Stratocasters with scalloped fingerboards ever since.',
    gear: [
      {
        id: 'duck',
        name: 'The Duck',
        sub: 'Fender Stratocaster, early 1970s',
        years: '1980s–1994',
        text: 'An Olympic White Stratocaster from 1971 or 1972 — sources disagree — named for the Donald Duck sticker on its headstock. Malmsteen bought it in Sweden from a drummer who had come to audition for his band. It was his Strat on Rising Force in 1984 and on stage through the 1980s, and it carries his changes: a scalloped fingerboard, jumbo frets, DiMarzio pickups, a Play Loud sticker on the body and Ferrari badges on the back. Fender’s first Malmsteen signature model was based on it, and in 2008 the Custom Shop made 100 copies of the guitar. He put the original aside in 1994 to keep it safe and still takes it out for recording now and then.',
        rows: [
          { type: 'bleed', img: { src: 'yngwie-strat-swing.jpg', alt: 'Malmsteen swinging a cream Stratocaster above his head in red stage light' } },
          'text',
          { type: 'pair', small: { src: 'yngwie-strat-ferrari.jpg', alt: 'Ferrari badges and a pick sticker on the back of a cream Malmsteen Stratocaster' }, big: { src: 'yngwie-strat-holding.jpg', alt: 'Malmsteen in aviator sunglasses holding a cream Stratocaster' } },
        ],
      },
    ],
    sources: [
      ['Ground Guitar, “Yngwie Malmsteen’s Guitars and Gear”', 'https://www.groundguitar.com/yngwie-malmsteen-guitars-gear/'],
      ['Guitar World, “Yngwie Malmsteen looks back on Rising Force”', 'https://www.guitarworld.com/features/yngwie-malmsteen-looks-back-on-rising-force'],
      ['Fuzzfaced, “Malmsteen Tribute Stratocaster”', 'https://fuzzfaced.net/malmsteen-tribute-stratocaster.html'],
      ['MusicRadar, “Fender begins work on Malmsteen replica”', 'https://musicradar.com/news/guitars/fender-begins-work-on-malmsteen-replica-151060'],
    ],
    credits: [
      ['Aragon Ballroom, Chicago, 1988. Via Guitar World', 'https://www.guitarworld.com/artists/video-yngwie-malmsteen-shreds-alcatrazz-1984'],
      ['Strip: Yngwie Malmsteen, 1985. Via Guitar World, “Yngwie Malmsteen looks back on Rising Force”', 'https://www.guitarworld.com/features/yngwie-malmsteen-looks-back-on-rising-force'],
      ['Malmsteen on stage. Via Guitar World, “Yngwie Malmsteen on the Fender Stratocaster”', 'https://www.guitarworld.com/features/yngwie-malmsteen-on-the-fender-stratocaster'],
      ['Malmsteen with his Stratocaster; Ferrari badges. Via Guitar World, “Yngwie Malmsteen: Life in Gear”', 'https://guitarworld.com/artists/guitarists/yngwie-malmsteen-life-in-gear'],
    ],
  },
  'kirk-hammett': {
    years: '1983–',
    hero: { src: 'kirk-hero.jpg', alt: 'Kirk Hammett with long curls playing a black guitar on stage, late 1980s', pos: '50% 0%' },
    lead: 'Kirk Hammett joined Metallica in 1983. From the late 1980s his guitars came from ESP, and the one he used through the band’s biggest records of the 1990s had a Ouija board printed across its body.',
    gear: [
      {
        id: 'ouija',
        name: 'Ouija',
        sub: 'ESP custom, about 1990',
        years: '1990–2001',
        text: 'Around 1990 Hammett asked ESP for a guitar printed with a Ouija board, using Hasbro’s version of the game. There was no easy way to lay out the artwork, so it was sized on a copy machine, cut and arranged with scissors, and faxed to the ESP Custom Shop in Japan. Hammett used it on Metallica (the Black Album, 1991), Load, Reload, Garage Inc. and S&M. On June 25, 2001, he gave it away with a note on the back calling it one of his main touring and recording guitars of the 1990s. In April 2021 it went up for auction at Gotta Have Rock and Roll, with bidding from $225,000.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'kirk-ouija-live.jpg', alt: 'Hammett in a black vest bent over the Ouija guitar on stage' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'kirk-ouija-front.jpg', alt: 'The Ouija guitar’s black body printed with the alphabet, numbers, sun and moon' }, small: { src: 'kirk-ouija-back.jpg', alt: 'Hammett’s handwritten note on the back of the Ouija guitar' } },
        ],
      },
    ],
    sources: [
      ['Guitar World, “Kirk Hammett’s Ouija board ESP is up for auction”', 'https://guitarworld.com/news/kirk-hammetts-ouija-board-esp-as-used-on-the-black-album-load-and-reload-is-up-for-auction'],
      ['Loudwire, “Kirk Hammett’s Ouija guitar up for auction”', 'https://loudwire.com/metallica-kirk-hammett-ouija-guitar-auction/'],
      ['Ground Guitar, “Kirk Hammett’s 1987 ESP MM-270 Zorlac”', 'https://www.groundguitar.com/kirk-hammetts-guitars-and-gear/kirk-hammetts-1987-esp-mm-270-zorlac/'],
      ['Wikipedia, “Kirk Hammett”', 'https://en.wikipedia.org/wiki/Kirk_Hammett'],
    ],
    credits: [
      ['Kirk Hammett, late 1980s. Via Guitar World, “Kirk Hammett discusses recording Metallica’s One”', 'https://www.guitarworld.com/news/and-justice-for-all-30th-anniversary-kirk-hammett-discusses-recording-metallicas-one'],
      ['Strip: Kirk Hammett and James Hetfield. Via MusicRadar', 'https://www.musicradar.com/artists/i-remember-showing-up-at-10-or-11-in-the-morning-and-working-on-solos-and-that-leading-to-two-or-three-oclock-in-the-morning-the-next-day-how-metallica-beat-the-clock-and-battled-fatigue-to-create-a-poignant-and-pulverising-anti-war-epic'],
      ['Hammett with the Ouija (cropped); the Ouija front and back. Mick Hutson/Redferns and Gotta Have Rock and Roll, via Guitar World', 'https://guitarworld.com/news/kirk-hammetts-ouija-board-esp-as-used-on-the-black-album-load-and-reload-is-up-for-auction'],
    ],
  },
  'john-frusciante': {
    years: '1988–',
    hero: { src: 'frusciante-hero.jpg', alt: 'John Frusciante in a check shirt playing a sunburst Stratocaster in front of Marshall stacks', pos: '50% 0%' },
    lead: 'John Frusciante joined Red Hot Chili Peppers in 1988, left in 1992 and came back in 1998. From that return on, the guitar under most of the band’s records was a sunburst 1962 Stratocaster.',
    gear: [
      {
        id: 'strat-62',
        name: 'Fender Stratocaster',
        sub: 'Sunburst Stratocaster, 1962',
        years: '1998–',
        text: 'When Frusciante rejoined the Red Hot Chili Peppers in 1998, he went to Guitar Center with Anthony Kiedis, who lent him the money for it — or bought it for him, as Kiedis tells it in Scar Tissue. It is a three-tone sunburst Stratocaster, serial 84153, with a slab rosewood fingerboard and, by now, a 1963-style pickguard and later tuners. He leaned more on his 1955 Strat for Californication (1999); the ’62 took over on By the Way (2002) and Stadium Arcadium (2006), and again after his second return, on Unlimited Love and Return of the Dream Canteen (2022). Most of its finish has worn away. In October 2024 Fender’s Custom Shop released a Masterbuilt copy by Paul Waller at $20,000.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'frusciante-62-live.jpg', alt: 'Frusciante in a dark jacket laughing as he plays the sunburst Stratocaster' } },
          'text',
          { type: 'pair', small: { src: 'frusciante-62.jpg', alt: 'The worn sunburst 1962 Stratocaster standing upright' }, big: { src: 'frusciante-62-portrait.jpg', alt: 'Frusciante in a check shirt holding the sunburst Stratocaster' } },
        ],
      },
    ],
    sources: [
      ['Guitar Player, “The Vintage Fender Stratocasters of John Frusciante”', 'https://guitarplayer.com/gear/the-vintage-fender-stratocasters-of-john-frusciante'],
      ['Ground Guitar, “John Frusciante’s 1962 Fender Stratocaster”', 'https://www.groundguitar.com/john-frusciante-gear/john-frusciantes-1962-fender-stratocaster/'],
      ['Guitar World, “Fender John Frusciante Custom Shop Stratocaster”', 'https://www.guitarworld.com/gear/electric-guitars/fender-john-frusciante-custom-shop-signature-stratocaster'],
      ['Wikipedia, “John Frusciante”', 'https://en.wikipedia.org/wiki/John_Frusciante'],
    ],
    credits: [
      ['John Frusciante on stage (two photographs). Via MusicRadar, “Classic interview: John Frusciante”', 'https://musicradar.com/news/classic-interview-john-frusciante-red-hot-chili-peppers'],
      ['Strip: Nashville, 2022; the 1962 Stratocaster. Jason Kempin/Getty and Future/Eleanor Jane, via Guitar Player', 'https://guitarplayer.com/gear/the-vintage-fender-stratocasters-of-john-frusciante'],
      ['Frusciante with the Stratocaster. Via Guitar World', 'https://www.guitarworld.com/features/john-frusciante-red-hot-chili-peppers-unlimited-love'],
    ],
  },
  'noel-gallagher': {
    years: '1991–',
    hero: { src: 'noel-unionjack-1996.jpg', alt: 'Noel Gallagher in a dark jacket singing as he plays the Union Jack Sheraton under blue light', pos: '50% 25%' },
    lead: 'Noel Gallagher wrote the songs and played lead guitar in Oasis from 1991. Through the 1990s his main guitars were Epiphone hollow-bodies, and one of them was painted with the Union Jack.',
    gear: [
      {
        id: 'union-jack',
        name: 'Union Jack Sheraton',
        sub: 'Epiphone Sheraton, 1993',
        years: '1996–',
        text: 'An Epiphone Sheraton, most likely from a 1993 run of 250 made for Epiphone’s Nashville USA Collection, and sunburst when it left the factory. The usual story is that Meg Mathews, then Gallagher’s girlfriend, had it repainted with the Union Jack as a present in 1996. He played it on Top of the Pops that February and on the Morning Glory tour, including the Maine Road shows in Manchester. Epiphone later made a Union Jack version of his Supernova signature model, and the original has been shown in an Oasis exhibition.',
        rows: [
          { type: 'center', size: 'mid', img: { src: 'noel-unionjack-live.jpg', alt: 'Gallagher in a parka singing with the Union Jack Sheraton in front of Marshall amps' } },
          'text',
          { type: 'pair', flip: true, big: { src: 'noel-unionjack-exhibit.jpg', alt: 'The Union Jack Sheraton in an Oasis exhibition case' }, small: { src: 'noel-unionjack-1996-tv.jpg', alt: 'Gallagher in a white shirt playing the Union Jack Sheraton, 1996' } },
        ],
      },
    ],
    sources: [
      ['Ground Guitar, “Noel Gallagher’s Guitars, Amps & Gear List”', 'https://www.groundguitar.com/noel-gallagher-gear/'],
      ['Mixdown, “Gear Rundown: Noel Gallagher, the Oasis years”', 'https://mixdownmag.com.au/features/gear-rundown-noel-gallagher-the-oasis-years/'],
      ['Guitar World, “Epiphone 150th anniversary Noel Gallagher guitar exhibit”', 'https://guitarworld.com/news/epiphone-150th-anniversary-noel-gallagher-guitar-exhibit'],
      ['Guitar World, “The story behind Oasis’ signature Gibson and Epiphone guitars”', 'https://www.guitarworld.com/gear/electric-guitars/the-story-behind-oasis-signature-gibson-and-epiphone-guitars'],
      ['Wikipedia, “Noel Gallagher”', 'https://en.wikipedia.org/wiki/Noel_Gallagher'],
    ],
    credits: [
      ['Strip: Noel Gallagher, 2008. Anirudh Koul, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Noel_Gallagher_playing_Champagne_Supernova.jpg'],
      ['Gallagher with the Union Jack Sheraton. Via Mixdown', 'https://mixdownmag.com.au/features/gear-rundown-noel-gallagher-the-oasis-years/'],
      ['Gallagher with the Union Jack Sheraton (cropped). Via Guitar World', 'https://www.guitarworld.com/artists/guitarists/gem-archer-on-what-noel-gallagher-used-to-play-on-dont-look-back-in-anger'],
      ['Gallagher with the Union Jack Sheraton, 1996; the Sheraton on display. Via Ground Guitar', 'https://www.groundguitar.com/noel-gallagher-gear/'],
    ],
  },
  'jack-white': {
    years: '1997–',
    hero: { src: 'jackwhite-hero.jpg', alt: 'Jack White singing with eyes closed in an embroidered western jacket, 2008', pos: '50% 5%' },
    lead: 'Jack White formed the White Stripes with Meg White in Detroit in 1997, a two-piece with no bass player. He stayed away from Stratocasters and Les Pauls and played cheap old department-store guitars instead.',
    gear: [
      {
        id: 'airline',
        name: 'JB Hutto Airline',
        sub: 'Montgomery Ward Airline, 1964',
        years: '1997–2011',
        text: 'Valco built it and Montgomery Ward sold it under the Airline name between 1958 and 1968, at first for $99. The body is two hollow halves of fiberglass, which Valco called Res-O-Glas, with a pair of Valco single-coil pickups. It is known as the JB Hutto after the blues slide guitarist who was its best-known player in its day. White’s red one did most of the work on the White Stripes’ records until the band ended in 2011, and on Icky Thump (2007) it shared the load with a Kay. “Seven Nation Army” was the exception: that riff is the Kay, in open A, through a DigiTech Whammy set an octave down. Eastwood began making a copy in 2000, with a chambered mahogany body in place of the fiberglass.',
        rows: [
          { type: 'center', size: 'wide', img: { src: 'jackwhite-airline-2007.jpg', alt: 'Jack White playing the red Airline as Meg White sings beside him, 2007' } },
          'text',
          { type: 'pair', small: { src: 'jackwhite-airline.jpg', alt: 'The red Airline standing in front of a stack of amplifiers' }, big: { src: 'jackwhite-airline-amp.jpg', alt: 'The red Airline’s body and pickups against an amplifier' } },
          { type: 'center', size: 'mid', img: { src: 'jackwhite-airline-pickup.jpg', alt: 'A Valco pickup and knobs on the red Airline up close' } },
        ],
      },
    ],
    sources: [
      ['Guitar Player, “5 of Jack White’s Coolest Guitars”', 'https://www.guitarplayer.com/gear/5-of-jack-whites-coolest-guitars'],
      ['Guitar Player, “Why a young Jack White wanted to play anything but a Strat or a Les Paul”', 'https://www.guitarplayer.com/guitarists/why-a-young-jack-white-wanted-to-play-anything-but-a-strat-or-a-les-paul'],
      ['Guitar World, “Jack White’s guitar gear”', 'https://guitarworld.com/features/jack-white-guitar-gear'],
      ['Guitar World, “How Jack White got his Seven Nation Army guitar”', 'https://www.guitarworld.com/artists/guitarists/how-jack-white-got-his-seven-nation-army-guitar'],
      ['Wikipedia, “The White Stripes”', 'https://en.wikipedia.org/wiki/The_White_Stripes'],
    ],
    credits: [
      ['Jack White, 2008. Kris Krug, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jack_White_of_the_Raconteurs_shot_by_Kris_Krug.jpg'],
      ['Strip: Jack and Meg White. Via MusicRadar', 'https://www.musicradar.com/artists/it-was-just-a-challenge-to-myself-im-not-gonna-have-a-chorus-in-this-song-see-if-i-can-get-away-with-it-how-jack-white-created-the-guitar-riff-of-the-century-and-what-is-a-seven-nation-army-anyway'],
      ['Jack and Meg White, 2007. Fabio Venni, modified by anetode, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jack_%26_Meg,_The_White_Stripes.jpg'],
      ['The Airline standing; pickup close-up. Future/Eleanor Jane, via Guitar Player', 'https://www.guitarplayer.com/gear/5-of-jack-whites-coolest-guitars'],
      ['The Airline against an amplifier. Eleanor Jane, via Guitar Player', 'https://www.guitarplayer.com/guitarists/why-a-young-jack-white-wanted-to-play-anything-but-a-strat-or-a-les-paul'],
    ],
  },
  'john-mayer': {
    years: '2001–',
    hero: { src: 'mayer-hero.jpg', alt: 'John Mayer in a grey T-shirt singing with a Stratocaster under pink stage lights', pos: '50% 20%' },
    lead: 'John Mayer arrived as a pop songwriter with Room for Squares in 2001, then spent the next years as a blues guitarist, with the John Mayer Trio and on Continuum. The guitar of that turn was a black Stratocaster he helped build.',
    gear: [
      {
        id: 'black-one',
        name: 'The Black One',
        sub: 'Fender Custom Shop Stratocaster, 2004',
        years: '2004–',
        text: 'Mayer spent two days in October 2004 at the Fender Custom Shop in Corona, California, building it with master builder John Cruz, and it was delivered in November. The specs came from Fender’s Stevie Ray Vaughan Stratocaster — alder body, thick C-shaped maple neck, jumbo frets, gold tuners — with three custom single-coil pickups, and Cruz left it without lacquer and heavily worn. At first it did not sound right; Mayer even left it in a freezer overnight, before the fault turned out to be a missing ground. It became the guitar of Continuum (2006), which he said was almost all recorded on it, apart from songs like “Vultures” that need his gold-leaf Strat. In 2010 Fender made 83 Masterbuilt copies and a cheaper Black1 production model. After years in reserve it came back on stage at Madison Square Garden in late 2023.',
        rows: [
          { type: 'bleed', img: { src: 'mayer-black-one-stage.jpg', alt: 'Mayer playing the Black One at the microphone under blue spotlights' } },
          'text',
          { type: 'pair', small: { src: 'mayer-black-one.jpg', alt: 'Mayer holding the Black One, hand on his chest, against white' }, big: { src: 'mayer-black-one-live.jpg', alt: 'Mayer in a grey T-shirt playing the Black One on stage' } },
        ],
      },
    ],
    sources: [
      ['Guitar World, “Why John Mayer put his Fender Black One Strat in the freezer”', 'https://guitarworld.com/artists/guitarists/why-john-mayer-put-his-fender-black-one-strat-in-the-freezer'],
      ['Ground Guitar, “John Mayer’s 2004 Fender Stratocaster (Black One)”', 'https://www.groundguitar.com/john-mayer-guitars-and-gear/john-mayers-2004-fender-stratocaster-john-mayer-signature-black-one/'],
      ['MusicRadar, “Fender John Mayer The Black One Strat replica revealed”', 'https://musicradar.com/guitarist/fender-john-mayer-the-black-one-strat-replica-revealed-275964'],
      ['MusicRadar, “John Mayer interview”', 'https://www.musicradar.com/guitarist/john-mayer-interview-251957'],
      ['Wikipedia, “John Mayer”', 'https://en.wikipedia.org/wiki/John_Mayer'],
    ],
    credits: [
      ['John Mayer on stage; the Black One. Joby Sessions/Future and Getty, via MusicRadar', 'https://www.musicradar.com/guitarist/john-mayer-interview-251957'],
      ['Strip: John Mayer, Radio City Music Hall. Via Guitar World', 'https://www.guitarworld.com/artists/guitarists/why-john-mayer-left-fender-and-joined-prs-guitars'],
    ],
  },
};

// 띠 사진의 표지 출처 — 지금은 연주자마다 credits에 함께 적는다
// 프리로더 사진 — [파일(assets/artists/pre-*.jpg, 배포 스크립트가 이 파일 이름들을 찾아 함께 올린다), 출처 표기, 링크]
const PRE = [
  ['pre-b-b-king.jpg', 'B.B. King. Eugene F. Tourangeau, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:B.B._King_performs_at_the_Fillmore_East,_1971.jpg'],
  ['pre-eric-clapton.jpg', 'Eric Clapton. Matt Gibbons, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Clapton_and_Elliman.jpg'],
  ['pre-keith-richards.jpg', 'Keith Richards. Larry Rogers, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Mick_Jagger_%26_Keith_Richards_1972.jpg'],
  ['pre-george-harrison.jpg', 'George Harrison. David Hume Kennerly, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:George_Harrison_1974.jpg'],
  ['pre-pete-townshend.jpg', 'Pete Townshend. Harry Chase, Los Angeles Times, CC BY 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Pete_Townshend,_1975.jpg'],
  ['pre-david-gilmour.jpg', 'David Gilmour. Jean-Pierre Jeannin, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:David_Gilmour_and_stratocaster.jpg'],
  ['pre-stevie-ray-vaughan.jpg', 'Stevie Ray Vaughan. Bbadventure, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Stevie_Ray_Vaughan_Live_1983.jpg'],
  ['pre-angus-young.jpg', 'Angus Young. Harry (Howard) Potts, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Angus_Young_-_Manchester_Apollo_-_1982.jpg'],
  ['pre-muddy-waters.jpg', 'Muddy Waters. Lionel Decoster, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Muddy_Waters_november_1976.jpg'],
  ['pre-sister-rosetta-tharpe.jpg', 'Sister Rosetta Tharpe. James J. Kriegsmann, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Sister_Rosetta_Tharpe_(1938_publicity_photo_-_headshot).jpg'],
  ['pre-les-paul.jpg', 'Les Paul. NBC Television-photo by "Bruno of Hollywood", Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Les_Paul_and_Mary_Ford_1953.jpg'],
  ['pre-bo-diddley.jpg', 'Bo Diddley. Published by Chess Records. Photographer unknown., Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Bo_Diddley_(1957_publicity_portrait).jpg'],
  ['pre-buddy-holly.jpg', 'Buddy Holly. Brunswick Records (photographer: James J. Kriegsmann); scan , Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Buddy_Holly_Brunswick_Records.jpg'],
  ['pre-billy-gibbons.jpg', 'Billy Gibbons. Supermac1961 from CHAFFORD HUNDRED, England, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Billy_Gibbons_of_ZZ_Top_-_Flickr_-_Supermac1961.jpg'],
  ['pre-tom-morello.jpg', 'Tom Morello. deep_schismic, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Tom_Morello_-_RATM_-_Big_Day_Out.jpg'],
  ['pre-mark-knopfler.jpg', 'Mark Knopfler. Klaus Hiltscher, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Mark_and_David_Knopfler_of_Dire_Straits_1979.jpg'],
  ['pre-duane-allman.jpg', 'Duane Allman. Unknown authorUnknown author, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Allman_Brothers_Band_1969.jpg'],
  ['pre-jerry-garcia.jpg', 'Jerry Garcia. Jerry-Mickey at Red Rocks taken 08-11-87.jpg: User:Grateful , CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jerry_Garcia_at_Red_Rocks_taken_1987-08-11.jpg'],
  ['pre-bruce-springsteen.jpg', 'Bruce Springsteen. Carl Lender, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Bruce_Springsteen_at_the_New_Haven_Coliseum_(7238976776).jpg'],
  ['pre-elvis-presley.jpg', 'Elvis Presley. Associated Press, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Elvis_and_liberace.jpg'],
  ['pre-ritchie-blackmore.jpg', 'Ritchie Blackmore. W.W.Thaler - H.Weber, Hildesheim, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Deep_Purple,_Ritchie_Blackmore_1970.jpg'],
  ['pre-ace-frehley.jpg', 'Ace Frehley. Ian Ransley, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Ace_Frehley.JPG'],
  ['pre-joe-walsh.jpg', 'Joe Walsh. Jim Summaria, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Joe_Walsh_4_-_1975.jpg'],
  ['pre-rory-gallagher.jpg', 'Rory Gallagher. Harry Potts, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Rory_Gallagher_1982.jpg'],
  ['pre-peter-green.jpg', 'Peter Green. Herbert Weber, Hildesheim, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Fleetwood_mac_Peter_Green_Mick_Fleedwood.jpg'],
  ['pre-kirk-hammett.jpg', 'Kirk Hammett. kallerna, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Kirk_Hammett,_Metallica_@_Sonisphere.jpg'],
  ['pre-nancy-wilson.jpg', 'Nancy Wilson. Jim Summaria, http://www.jimsummariaphoto.com/, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Nancy_Wilson_-_Heart_-_1978.jpg'],
  ['pre-johnny-cash.jpg', 'Johnny Cash. ABC Television., Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Cass_Elliot_Johnny_Cash_1969.JPG'],
  ['pre-chet-atkins.jpg', 'Chet Atkins. Jack de Nijs for Anefo / Anefo, CC0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chet_Atkins_(1965).jpg'],
  ['pre-albert-king.jpg', 'Albert King. Utopia Records; Distributed by RCA, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Albert_King_1976_press_photo.jpg'],
  ['pre-freddie-king.jpg', 'Freddie King. Lionel Decoster, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Freddie_King_1975_6.jpg'],
  ['pre-django-reinhardt.jpg', 'Django Reinhardt. William P. Gottlieb / Adam Cuerden, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Django_Reinhardt_(Gottlieb_07301).jpg'],
  ['pre-wes-montgomery.jpg', 'Wes Montgomery. Published by A&amp;M Records. Photographer uncredited and un, Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Wes_Montgomery_(1967).jpg'],
  ['pre-dick-dale.jpg', 'Dick Dale. Mike Burns from Somerville, MA, USA, CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Dick_Dale.jpg'],
  ['pre-hank-marvin.jpg', 'Hank Marvin. Jpmawet, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Hank_Marvin01.jpg'],
  ['pre-bonnie-raitt.jpg', 'Bonnie Raitt. Lena, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Bonnie_Raitt_-_19890508-03.jpg'],
  ['pre-brian-setzer.jpg', 'Brian Setzer. Pietz, CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Stray_Cats_Brian_Setzer_Slim_Jim_Phantom.jpg'],
];
const COVER_CREDITS = PRE.map(([, label, url]) => [`Preloader: ${label}`, url]);

// 띠 — AUGE처럼 사진이 간격 없이 붙어 빠르게 흐른다. 사진 폭은 같고 높이만 화면 위치를 따라 바뀐다(왼쪽 낮게 → 오른쪽 높게).
const STRIP = { speed: 0.09, hMin: 0.36, hMax: 0.62 }; // 속도: 화면 폭 대비 초당 비율 · 높이: 화면 높이 대비(왼쪽 끝, 오른쪽 끝)

const view = document.getElementById('view');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const img = (o, cls = '', lazy = true) =>
  `<img class="${cls}" src="${IMG}${o.src}" alt="${esc(o.alt)}"${o.pos ? ` style="object-position:${o.pos}"` : ''} decoding="async"${lazy ? ' loading="lazy"' : ''} />`;

let stopStrip = null;

/* ---------- 목록 ---------- */
// 사진 아래 제목: 연주자 이름. 가리킬 때만 나타난다
function stripItem(a, copy) {
  const hidden = copy ? ' aria-hidden="true" tabindex="-1"' : '';
  const pic = `<span class="s-pic"><img src="${IMG}${a.cover}" alt="${copy ? '' : esc(a.alt)}"${a.coverPos ? ` style="object-position:${a.coverPos}"` : ''} decoding="async" draggable="false" /></span>`;
  const cap = `<span class="s-cap"><span class="s-name" data-text="${esc(a.name)}">${esc(a.name)}</span></span>`;
  return `<a class="s-item" href="#${a.id}" draggable="false"${hidden}>${pic}${cap}</a>`;
}

function renderIndex() {
  const set = (copy) => ARTISTS.map((a) => stripItem(a, copy)).join('');
  view.innerHTML = `
    <h1 class="sr-only">Artists</h1>
    <div class="strip" aria-label="Artists">
      <div class="strip-track">${set(false)}${set(true)}${set(true)}</div>
    </div>
    <div class="ix-foot">
      <p class="ix-title" aria-hidden="true">Artists</p>
      <div class="ix-side">
        <p class="ix-desc">Artists’ signature models, collected in one place.</p>
        <p class="ix-meta"><span>${ARTISTS.length} players</span><a href="#sources">Sources</a></p>
      </div>
    </div>
    <p class="copy"><small>© 2026 GEARSHED</small></p>`;
  const stopA = runStrip(view.querySelector('.strip'), view.querySelector('.strip-track'));
  const stopB = runTitleHover(view.querySelector('.ix-title'));
  stopStrip = () => { stopA(); stopB(); };
}

// 큰 제목 — 랜딩 제목(js/home.js headlineFrame)과 같은 반응: 커서 가까운 글자일수록 가늘고(700 → 400) 넓어지며(80% → 100%) 자간이 벌어진다(최대 0.07em).
// 터치 기기·움직임 줄이기에서는 쓰지 않는다
function runTitleHover(el) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || reduce) return () => {};
  const text = el.textContent;
  el.textContent = '';
  const chars = [...text].map((ch) => {
    const c = document.createElement('span');
    c.className = 'hx-c';
    c.textContent = ch;
    el.appendChild(c);
    return { el: c, x: 0, y: 0, t: 0, w: -1, ls: -1 };
  });
  let box = null, mx = -1e4, my = -1e4, sx = -1e4, sy = -1e4, raf = 0;
  const measure = () => {
    box = el.getBoundingClientRect();
    for (const c of chars) { const r = c.el.getBoundingClientRect(); c.x = r.left + r.width / 2; c.y = r.top + r.height / 2; }
  };
  const onMove = (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } };
  const onLeave = () => { mx = my = -1e4; };
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (v) => v * v * (3 - 2 * v);
  const tick = () => {
    raf = requestAnimationFrame(tick);
    // 제목은 화면 아래에 붙어 있어 창 크기·서체가 바뀌면 자리가 옮겨진다 — 자리가 바뀌었을 때만 글자 위치를 다시 잰다
    const b = el.getBoundingClientRect();
    if (!box || b.top !== box.top || b.left !== box.left) measure();
    const R = Math.max(240, Math.min(420, innerWidth * 0.21));
    const near = mx >= box.left - R * 0.5 && mx <= box.right + R * 0.5 && my >= box.top - R * 0.5 && my <= box.bottom + R * 0.5;
    sx = sx < -9e3 ? mx : lerp(sx, mx, 0.2);
    sy = sy < -9e3 ? my : lerp(sy, my, 0.2);
    for (const c of chars) {
      const d = Math.hypot(c.x - sx, c.y - sy);
      c.t = lerp(c.t, near ? 1 - smooth(Math.min(1, d / R)) : 0, 0.14);
      const w = Math.round(700 - 300 * c.t);
      if (w !== c.w) { c.w = w; c.el.style.fontWeight = w; c.el.style.fontStretch = `${(80 + 20 * c.t).toFixed(1)}%`; }
      const ls = +(c.t * 0.07).toFixed(3);
      if (ls !== c.ls) { c.ls = ls; c.el.style.marginRight = ls > 0.001 ? `${ls}em` : ''; }
    }
  };
  addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  document.fonts?.ready.then(() => { box = null; }); // 서체가 오면 글자 폭이 바뀐다
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
  };
}

// 글자 뒤섞기 — 무작위 글자가 앞에서부터 차례로 제 글자로 맺힌다(AUGE 제목처럼)
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scramble(el, ms = 650) {
  const text = el.dataset.text;
  if (reduce) { el.textContent = text; return; }
  const t0 = performance.now();
  cancelAnimationFrame(el._raf); clearTimeout(el._to);
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / ms);
    const done = Math.floor(p * text.length);
    el.textContent = [...text].map((c, i) => (i < done || c === ' ' || c === '·' ? c : GLYPHS[(Math.random() * 26) | 0])).join('');
    if (p < 1) el._to = setTimeout(step, 40); // 타이머로 돌려서 숨은 탭에서도 끝까지 맺힌다
  };
  step();
}

// 자동으로 흐르고, 사진을 가리키면 천천히 멈춘다. 휠·드래그로도 옮긴다. 세 벌을 이어 붙여 한 벌 폭만큼 돌면 제자리로 감는다.
function runStrip(strip, track) {
  const items = [...track.children];
  let x = 0, target = 0, setW = 0, itemW = 0, raf = 0, drag = null, hoverEl = null, v = 1, last = performance.now();
  const measure = () => { itemW = items[0].offsetWidth; setW = itemW * ARTISTS.length; };
  measure();
  addEventListener('resize', measure);
  target = x = -setW; // 가운데 벌에서 시작해 양쪽으로 감길 여유를 둔다

  const onWheel = (e) => { e.preventDefault(); target -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY); };
  // 누르자마자 포인터를 붙잡으면 클릭이 링크 대신 띠로 가서 연주자 화면이 열리지 않는다 — 실제로 끌기 시작할 때만 붙잡는다
  const onDown = (e) => { drag = { x: e.clientX, t: target, moved: false }; };
  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; strip.setPointerCapture(e.pointerId); }
    if (drag.moved) target = drag.t + dx;
  };
  const onUp = () => { setTimeout(() => { drag = null; }, 0); };
  const onClick = (e) => { if (drag?.moved) { e.preventDefault(); e.stopPropagation(); } };
  // 사진을 가리키면(또는 키보드로 닿으면) 그 사진 아래 이름이 맺힌다
  const show = (it) => {
    if (hoverEl === it) return;
    hoverEl?.classList.remove('is-on');
    hoverEl = it;
    if (!it) return;
    it.classList.add('is-on');
    it.querySelectorAll('[data-text]').forEach((el, i) => scramble(el, 520 + i * 180));
  };
  const onOver = (e) => show(e.target.closest('.s-item'));
  const onLeave = () => show(null);
  const onFocus = (e) => {
    const it = e.target.closest('.s-item');
    if (!it) return;
    const r = it.getBoundingClientRect();
    if (r.left < 0 || r.right > innerWidth) target -= r.left - innerWidth * 0.3;
    show(it);
  };

  addEventListener('wheel', onWheel, { passive: false });
  strip.addEventListener('pointerdown', onDown);
  strip.addEventListener('pointermove', onMove);
  strip.addEventListener('pointerup', onUp);
  strip.addEventListener('pointercancel', onUp);
  strip.addEventListener('click', onClick, true);
  strip.addEventListener('pointerover', onOver);
  strip.addEventListener('pointerleave', onLeave);
  strip.addEventListener('focusin', onFocus);
  strip.addEventListener('focusout', () => show(null));

  const tick = (now) => {
    const dt = Math.min(64, now - last) / 1000; last = now;
    // 가리키는 동안 흐름이 천천히 0으로, 떠나면 다시 원래 속도로
    v += ((hoverEl || drag ? 0 : 1) - v) * Math.min(1, dt * 2.4);
    if (!reduce) target -= STRIP.speed * innerWidth * v * dt;
    x += (target - x) * (reduce ? 1 : Math.min(1, dt * 9));
    if (setW) {
      while (x < -2 * setW) { x += setW; target += setW; }
      while (x > 0) { x -= setW; target -= setW; }
    }
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    // 사진 높이 — 사진 가운데가 화면 왼쪽 끝이면 hMin, 오른쪽 끝이면 hMax
    const vh = innerHeight;
    for (let i = 0; i < items.length; i++) {
      const c = x + (i + 0.5) * itemW;
      const t = Math.max(0, Math.min(1, c / innerWidth));
      items[i].style.setProperty('--h', `${((STRIP.hMin + (STRIP.hMax - STRIP.hMin) * t) * vh).toFixed(1)}px`);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('resize', measure);
    removeEventListener('wheel', onWheel);
  };
}

/* ---------- 연주자 ---------- */
// 라벨(왼쪽 좁은 칸) + 문단(가운데 칸)
const textRow = (body) => `<div class="g-txt"><p class="g-p">${esc(body)}</p></div>`;
const pic = (o) => `<figure class="g-fig">${img(o)}</figure>`;

function gearRow(r, g) {
  if (r === 'text') return textRow(g.text);
  if (r.type === 'bleed') return `<div class="g-row g-bleed">${pic(r.img)}</div>`;
  if (r.type === 'center') return `<div class="g-row g-center g-center--${r.size}">${pic(r.img)}</div>`;
  return `<div class="g-row g-pair${r.flip ? ' g-pair--flip' : ''}"><div class="g-small">${pic(r.small)}</div><div class="g-big">${pic(r.big)}</div></div>`;
}

function gearBlock(g) {
  return `<section class="gear" aria-labelledby="g-${g.id}">
    <h2 class="g-name" id="g-${g.id}">${esc(g.name)}</h2>
    <p class="g-sub">${esc(g.sub)}</p>
    ${g.rows.map((r) => gearRow(r, g)).join('')}
  </section>`;
}

function renderArtist(id) {
  const a = ARTISTS.find((x) => x.id === id);
  const d = DETAIL[id];
  const next = ARTISTS[(ARTISTS.indexOf(a) + 1) % ARTISTS.length];
  view.innerHTML = `
    <p class="a-pin" aria-hidden="true"><b>${esc(a.name)}</b><span>${d.years}</span></p>
    <article class="artist">
      <div class="a-hero">${img(d.hero, '', false)}</div>
      <h1 class="a-name">${esc(a.name)}</h1>
      <div class="a-intro">
        <p class="a-lead">${esc(d.lead)}</p>
        <dl class="a-meta">
          <div><dt>Active</dt><dd>${d.years}</dd></div>
          <div><dt>Instruments</dt><dd><ul>${d.gear.map((g) => `<li><a href="#${id}/${g.id}">${esc(g.name)}</a> <span>${g.years}</span></li>`).join('')}</ul></dd></div>
          <div><dt>Back</dt><dd><a href="#">All artists</a></dd></div>
        </dl>
      </div>
      ${d.gear.map(gearBlock).join('')}
      <nav class="a-next" aria-label="Artists">
        <a href="#">All artists</a>
        ${next.ready ? `<a class="a-next-to" href="#${next.id}">Next: ${esc(next.name)}</a>` : ''}
      </nav>
      ${sourcesBlock(d.sources, d.credits)}
    </article>
    <p class="copy copy--flow"><small>© 2026 GEARSHED</small></p>`;
  document.fonts.ready.then(fitName);
}

// 긴 이름(PETE TOWNSHEND 등)이 한 줄을 넘치면 넘친 비율만큼 vw 단위로 줄인다 — 화면 크기를 바꿔도 비율이 유지된다
function fitName() {
  const nm = view.querySelector('.a-name');
  const art = view.querySelector('.artist');
  if (!nm || !art) return;
  art.style.removeProperty('--name-fs');
  if (nm.scrollWidth <= nm.clientWidth) return;
  const vw = parseFloat(getComputedStyle(nm).fontSize) / innerWidth * 100 * nm.clientWidth / nm.scrollWidth * 0.99;
  art.style.setProperty('--name-fs', `clamp(32px, ${vw.toFixed(2)}vw, 290px)`);
}
addEventListener('resize', fitName);

function sourcesBlock(text, credits) {
  // Timeline 출처와 같이 항목마다 원문으로 가는 링크(새 탭). 주소가 없는 항목만 글자로
  const li = (arr) => arr.map(([t, u]) => `<li>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>` : esc(t)}</li>`).join('');
  return `<footer class="sources" id="sources-list">
    <h2>Sources</h2>
    ${text.length ? `<h3>Text</h3><ul>${li(text)}</ul>` : ''}
    <h3>Photographs</h3><ul>${li(credits)}</ul>
    <p class="sources-note">Photographs are resized for this site.</p>
  </footer>`;
}

function renderSources() {
  const text = Object.values(DETAIL).flatMap((d) => d.sources);
  const credits = [...Object.values(DETAIL).flatMap((d) => d.credits), ...COVER_CREDITS];
  view.innerHTML = `<div class="src-page"><p><a href="#">All artists</a></p>${sourcesBlock(text, credits)}</div>
    <p class="copy copy--flow"><small>© 2026 GEARSHED</small></p>`;
}

/* ---------- 화면 전환 ---------- */
let current = null;
function route() {
  const [id, part] = location.hash.slice(1).split('/');
  const key = DETAIL[id] ? id : id === 'sources' ? 'sources' : 'index';
  if (key !== current) {
    stopStrip?.(); stopStrip = null;
    document.body.dataset.view = key === 'index' ? 'index' : key === 'sources' ? 'sources' : 'artist';
    view.classList.remove('is-in');
    if (key === 'index') renderIndex(); else if (key === 'sources') renderSources(); else renderArtist(key);
    document.title = key === 'index' ? 'GEARSHED — Artists' : key === 'sources' ? 'GEARSHED — Artists · Sources' : `GEARSHED — ${ARTISTS.find((a) => a.id === key).name}`;
    scrollTo(0, 0);
    void view.offsetWidth; // 빠진 상태를 한 번 그리게 한 뒤 맺히게(rAF는 숨은 탭에서 멈춰 화면이 흐린 채 남을 수 있다)
    view.classList.add('is-in');
    if (current !== null) view.focus({ preventScroll: true });
    current = key;
  }
  if (part) document.getElementById(`g-${part}`)?.closest('section')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
// 연주자 화면에서 첫 사진을 지나면 위 가운데 이름이 남는다
const pin = () => document.body.classList.toggle('pin-on', document.body.dataset.view === 'artist' && scrollY > innerHeight * 0.8);
addEventListener('scroll', pin, { passive: true });
addEventListener('hashchange', () => { route(); pin(); });
preloader();
route();
