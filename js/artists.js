// GEARSHED — Artists
// 첫 화면: 연주자 사진이 위에서 매달린 띠로 가로로 흐른다(휠·드래그). 사진을 누르면 그 연주자 화면(#id)으로.
// 화면은 주소의 해시로 바뀐다: '' = 목록, '#<id>' = 연주자, '#sources' = 출처.

const IMG = 'assets/artists/';

// 띠에 놓이는 순서 = 활동 시기 순. ready가 아닌 연주자는 사진만 보이고 "In progress".
const ARTISTS = [
  { id: 'chuck-berry', name: 'Chuck Berry', cover: 'cover-chuck-berry.jpg', coverPos: '50% 20%', alt: 'Chuck Berry with a hollow-body guitar, about 1958', ready: true },
  { id: 'jimi-hendrix', name: 'Jimi Hendrix', cover: 'hendrix-fehmarn-1970.jpg', alt: 'Jimi Hendrix on stage at the Fehmarn festival, 1970', ready: true },
  { id: 'jimmy-page', name: 'Jimmy Page', cover: 'cover-jimmy-page.jpg', alt: 'Jimmy Page performing with Led Zeppelin, 1977', ready: true },
  { id: 'brian-may', name: 'Brian May', cover: 'cover-brian-may.jpg', alt: 'Brian May on stage with the Red Special', ready: true },
  { id: 'eddie-van-halen', name: 'Eddie Van Halen', cover: 'cover-eddie-van-halen.jpg', coverPos: '50% 20%', alt: 'Eddie Van Halen with the striped Frankenstein at the New Haven Coliseum, 1978', ready: true },
  { id: 'kurt-cobain', name: 'Kurt Cobain', cover: 'cover-kurt-cobain.jpg', alt: 'Kurt Cobain on stage with Nirvana', ready: true },
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
      ['Chuck Berry, about 1958. Pickwick Records, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chuck_Berry_circa_1958.jpg'],
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
          { type: 'center', size: 'mid', img: { src: 'page-dragon-1969.jpg', alt: 'Page playing the painted Dragon Telecaster, London, 1969' } },
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
          { type: 'pair', flip: true, big: { src: 'page-number-one-1976.jpg', alt: 'Page playing Number One in “The Song Remains the Same”' }, small: { src: 'page-number-one-pickups.jpg', alt: 'Number One in 1970 with the original bridge pickup, and in 1973 with the T-Top' } },
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
      ['Number One in “The Song Remains the Same,” and pickup comparison. Via Ground Guitar', 'https://www.groundguitar.com/jimmy-page-gear/jimmy-pages-1959-gibson-les-paul-standard-number-one/'],
      ['Chicago, 1977. Jim Summaria, CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page_with_Robert_Plant_2_-_Led_Zeppelin_-_1977.jpg'],
      ['Double-neck, 1973. Via Ground Guitar', 'https://www.groundguitar.com/jimmy-page-gear/jimmy-pages-1971-gibson-eds-1275-doubleneck-custom/'],
      ['EDS-1275 and dragon suit, “Play It Loud,” Metropolitan Museum of Art. Eden, Janine and Jim, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Jimmy_Page%27s_Gibson_EDS-1275_Double_neck_(1971),_Dragon_suit_(1975)_by_CoCo_-_Play_It_Loud._MET_(2019-05-13_19.29.54_by_Eden,_Janine_and_Jim).jpg'],
      ['Jimmy Page, 1977. Agency for the Performing Arts, public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Led_Zeppelin_-_Jimmy_Page_(1977).jpg'],
    ],
  },
  'brian-may': {
    years: '1970–',
    hero: { src: 'may-hero.jpg', alt: 'Brian May playing the Red Special on stage', pos: '50% 10%' },
    lead: 'May has played the guitar he built with his father on almost every Queen record and concert. He plays it through Vox AC30s turned up to full volume with a treble booster in front, and by January 1976 he had nine AC30s on stage. His pick is an old sixpence coin.',
    gear: [
      {
        id: 'red-special',
        name: 'Red Special',
        sub: 'Built by Brian and Harold May, 1963–1964',
        years: '1964–',
        text: 'Brian May and his father Harold, an electrical engineer, built it at home between August 1963 and October 1964, when Brian could not afford a Fender or a Gibson. The neck is mahogany from an old fireplace mantel, its worm holes filled with matchsticks; the fret markers were shaped from buttons, and the body is blockboard with oak from an old table under mahogany veneer. Two motorbike valve springs balance the vibrato, whose arm ends in a knitting needle. Each of the three Burns Tri-Sonic pickups has its own on/off and phase switch. Coats of Rustins plastic coating gave it the red-brown color behind the name; May also calls it the Fireplace or the Old Lady.',
        rows: [
          { type: 'bleed', img: { src: 'may-o2-2017.jpg', alt: 'May playing the Red Special with Queen + Adam Lambert at the O2, London, 2017', pos: '50% 35%' } },
          'text',
          { type: 'pair', small: { src: 'may-father.jpg', alt: 'Brian May and his father Harold with the Red Special' }, big: { src: 'may-budapest-1986.jpg', alt: 'May playing the Red Special in Budapest, 1986' } },
          { type: 'center', size: 'mid', img: { src: 'may-red-special-body.jpg', alt: 'The Red Special’s three Tri-Sonic pickups, switches and vibrato bridge' } },
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
      ['Brian May with the Red Special. Via Songfacts, “The story of how Brian May of Queen built his hand-made Red Special”', 'https://www.songfacts.com/articles/the-story-of-how-brian-may-of-queen-built-his-hand-made-red-special-signature-guitar/'],
      ['Queen + Adam Lambert, the O2, 12 December 2017. Raph_PH, CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Queen_And_Adam_Lambert_-_The_O2_-_Tuesday_12th_December_2017_QueenO2121217-28_(39066620425).jpg'],
      ['Brian and Harold May; Budapest, 1986; Red Special detail (Premier Guitar). Via Ground Guitar', 'https://www.groundguitar.com/brian-may-guitars-and-gear/brian-mays-red-special-guitar/'],
      ['Brian May with the Red Special. Via Guitar World, “Brian May: the ultimate interview”', 'https://www.guitarworld.com/features/brian-may-queen-the-ultimate-interview'],
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
          { type: 'pair', small: { src: 'evh-live-1978.jpg', alt: 'Van Halen playing the striped Frankenstein on stage under blue light' }, big: { src: 'evh-dance-1979.jpg', alt: 'Van Halen with the red, white and black Frankenstein in the “Dance the Night Away” video, 1979' } },
          'text',
          { type: 'center', size: 'mid', img: { src: 'evh-jump-1984.jpg', alt: 'Van Halen with Frankenstein in the “Jump” video, 1984' } },
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
      ['Eddie Van Halen with Frankenstein, 1978. Via Guitar World, “The true origins and evolution of Eddie Van Halen’s legendary Frankenstein guitar”', 'https://www.guitarworld.com/news/david-lee-roth-eddie-van-halen-frankenstrat-stripes'],
      ['Frankenstein on stage. Via Guitar World, “Eddie Van Halen’s Frankenstein, 1978 audio”', 'https://www.guitarworld.com/news/eddie-van-halen-frankenstein-1978-audio'],
      ['Van Halen (1978) cover; “Dance the Night Away”; “Jump.” Via Ground Guitar', 'https://www.groundguitar.com/eddie-van-halen-guitars-and-gear/eddie-van-halens-frankenstein-frankenstrat/'],
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
          { type: 'pair', flip: true, big: { src: 'cobain-mustang-mopop.jpg', alt: 'The Teen Spirit Mustang in a case at the Experience Music Project, Seattle' }, small: { src: 'cobain-mustang-mopop-2.jpg', alt: 'The Mustang’s racing stripe and body, Museum of Pop Culture' } },
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
      ['Kurt Cobain journal pages, 1993. Fender press images', 'https://www.fender.com/newsroom/272095-fender-revives-kurt-cobain-s-legendary-jag-stang-guitar-designed-by-the-icon-himself/'],
      ['Kurt Cobain on stage. Via MusicRadar, “The story of Kurt Cobain’s Fender Jaguar”', 'https://www.musicradar.com/news/the-story-behind-kurt-cobains-fender-jaguar'],
      ['Cobain with the Jag-Stang. Via Mixdown, “The story of Kurt Cobain’s signature Fender Jag-stang”', 'https://mixdownmag.com.au/features/the-story-of-kurt-cobains-signature-fender-jag-stang'],
    ],
  },
};

// 띠 사진의 표지 출처 — 지금은 연주자마다 credits에 함께 적는다
const COVER_CREDITS = [];

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
  stopStrip = runStrip(view.querySelector('.strip'), view.querySelector('.strip-track'));
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
}

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
route();
