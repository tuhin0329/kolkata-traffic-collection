const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const ExcelJS = require("exceljs");

let globalForcedSlot = null;
const forceSlotIdx = process.argv.indexOf("--force-slot");
if (forceSlotIdx !== -1 && process.argv[forceSlotIdx + 1]) {
  globalForcedSlot = process.argv[forceSlotIdx + 1];
}

let globalForcedDate = null;
const forceDateIdx = process.argv.indexOf("--force-date");
if (forceDateIdx !== -1 && process.argv[forceDateIdx + 1]) {
  globalForcedDate = process.argv[forceDateIdx + 1];
}

puppeteer.use(StealthPlugin());

// ─── ROUTES ──────────────────────────────────────────────────────────────────
const ROUTES = [
  {
    "id": "M1",
    "section": "Major Road",
    "from": "22.526862452154507, 88.32590541146433",
    "to": "22.36778626722586, 88.27186102336613",
    "label": "DH Road",
    "originAddress": "Mominpore, Kolkata, West Bengal, India",
    "destAddress": "Amtala, Kolkata, West Bengal, India",
    "viaCoord": "22.486969536997208, 88.31331015977956|22.453335909381124, 88.30261516019884",
    "preferredBuses": [
      "235",
      "83",
      "AC-52"
    ]
  },
  {
    "id": "M2",
    "section": "Major Road",
    "from": "22.60157745671817, 88.37273219043222",
    "to": "22.653231538993165, 88.37720499706744",
    "label": "B T Road",
    "originAddress": "Shyambazar, Kolkata, West Bengal, India",
    "destAddress": "Dunlop, Kolkata, West Bengal, India",
    "viaCoord": "22.632358132193776, 88.37835292777488|22.645954770091013, 88.37760189468997",
    "preferredBuses": [
      "S-9A",
      "78",
      "214",
      "AC-20",
      "S-185",
      "S-57",
      "ACT-32"
    ]
  },
  {
    "id": "M3",
    "section": "Major Road",
    "from": "22.65322731143445, 88.37714552317215",
    "to": "22.76184358966365, 88.36553558285678",
    "label": "B T Road",
    "originAddress": "Dunlop, Kolkata, West Bengal, India",
    "destAddress": "Barrackpore, Kolkata, West Bengal, India",
    "viaCoord": "22.700854419025376, 88.37475601556763|22.738588435405088, 88.37276925613345",
    "preferredBuses": [
      "Barrackpore Chiriamore - Salap More",
      "78",
      "AC-20"
    ]
  },
  {
    "id": "M4",
    "section": "Major Road",
    "from": "22.594576599778836, 88.38327634915908",
    "to": "22.641482246133076, 88.43136027565988",
    "label": "VIP Road",
    "originAddress": "Ultadanga, Kolkata, West Bengal, India",
    "destAddress": "Airport (NSCBI Airport), Kolkata, West Bengal, India",
    "viaCoord": "22.591510818252626, 88.39335462020657|22.603363362498907, 88.42352512912707|22.613979078954333, 88.43001259355401",
    "preferredBuses": [
      "L238"
    ]
  },
  {
    "id": "M5",
    "section": "Major Road",
    "from": "22.642229674768757, 88.43119115662317",
    "to": "22.720270572226145, 88.48663803272736",
    "label": "Jessore Road",
    "originAddress": "Airport (NSCBI Airport), Kolkata, West Bengal, India",
    "destAddress": "Barasat, Kolkata, West Bengal, India",
    "viaCoord": "22.659349299790406, 88.44146370339267|22.69239331168592, 88.46535187631933|22.71321312857641, 88.48130313658922",
    "preferredBuses": [
      "79B",
      "AC-2",
      "C-8",
      "DN-9/1",
      "DN-17"
    ]
  },
  {
    "id": "M6",
    "section": "Major Road",
    "from": "22.64150573693621, 88.43086159528802",
    "to": "22.62008068521284, 88.39502383574728",
    "label": "Airport Road",
    "originAddress": "Airport (NSCBI Airport), Kolkata, West Bengal, India",
    "destAddress": "Dum Dum Railway Station, Kolkata, West Bengal, India",
    "viaCoord": "22.62278457693161, 88.4143981983047",
    "preferredBuses": [
      "DN-9/1",
      "30B",
      "AC-38"
    ]
  },
  {
    "id": "M7",
    "section": "Major Road",
    "from": "22.60157961913879, 88.37273156156854",
    "to": "22.54155151491483, 88.34784315206437",
    "label": "APC Bose Rd",
    "originAddress": "Shyambazar, Kolkata, West Bengal, India",
    "destAddress": "Rabindra Sadan, Kolkata, West Bengal, India",
    "viaCoord": "22.586478170538157, 88.36785513403866|22.564365384356854, 88.36828978015252|22.54254537431056, 88.35998562511485",
    "preferredBuses": [
      "230",
      "227"
    ]
  },
  {
    "id": "M8",
    "section": "Major Road",
    "from": "22.600237959088595, 88.37309662256553",
    "to": "22.56464030708927, 88.35157682988891",
    "label": "Bidhan Sarani",
    "originAddress": "Shyambazar, Kolkata, West Bengal, India",
    "destAddress": "Esplanade, Kolkata, West Bengal, India",
    "viaCoord": "22.58574243123134, 88.36755532294626|22.577890081453138, 88.36931070591673|22.56824968754297, 88.36501609623691",
    "preferredBuses": [
      "234/1",
      "47B",
      "S-10",
      "AC-20",
      "S-11N",
      "30C",
      "214A"
    ]
  },
  {
    "id": "M9",
    "section": "Major Road",
    "from": "22.601240174118814, 88.37214685775855",
    "to": "22.5646441008044, 88.35157695193628",
    "label": "Central Avenue (C R Avenue)",
    "originAddress": "Shyambazar, Kolkata, West Bengal, India",
    "destAddress": "Esplanade, Kolkata, West Bengal, India",
    "viaCoord": "22.586488630379588, 88.36286559862576|22.577610115623404, 88.36044301521393",
    "preferredBuses": [
      "AC-20",
      "30C",
      "214A",
      "222",
      "S-10"
    ]
  },
  {
    "id": "M10",
    "section": "Major Road",
    "from": "22.56533292976866, 88.37017968268825",
    "to": "22.56279301329408, 88.351202325141",
    "label": "S N Banerjee Road",
    "originAddress": "Sealdah, Kolkata, West Bengal, India",
    "destAddress": "Esplanade, Kolkata, West Bengal, India",
    "viaCoord": "22.56035886787411, 88.36197075899068|22.561790717826575, 88.35662776123334",
    "preferredBuses": [
      "S-12N"
    ]
  },
  {
    "id": "M11",
    "section": "Major Road",
    "from": "22.565250461301765, 88.37014706506632",
    "to": "22.58495016168921, 88.34178252501448",
    "label": "M G Road",
    "originAddress": "Sealdah, Kolkata, West Bengal, India",
    "destAddress": "Howrah, Kolkata, West Bengal, India",
    "viaCoord": "22.578667254204134, 88.3606741586771|22.582371283202296, 88.3496606173083"
  },
  {
    "id": "M12",
    "section": "Major Road",
    "from": "22.560942770266077, 88.36791612740903",
    "to": "22.543454352238612, 88.36682680037448",
    "label": "C I T Road",
    "originAddress": "Moulali, Kolkata, West Bengal, India",
    "destAddress": "Park Circus, Kolkata, West Bengal, India",
    "viaCoord": "22.554595613028884, 88.37214939399904|22.545395813526955, 88.37059798285668",
    "preferredBuses": [
      "45"
    ]
  },
  {
    "id": "M13",
    "section": "Major Road",
    "from": "22.542976674721288, 88.36018590570482",
    "to": "22.512272909067946, 88.35385507955782",
    "label": "Sarat Bose Road",
    "originAddress": "Beckbagan, Kolkata, West Bengal, India",
    "destAddress": "Rabindra Sarobor, Kolkata, West Bengal, India",
    "viaCoord": "22.540735819973026, 88.35499586195047|22.532280307933853, 88.35314809314661",
    "preferredBuses": [
      "221",
      "Ecospace Amity University"
    ]
  },
  {
    "id": "M14",
    "section": "Major Road",
    "from": "22.564645713064767, 88.35158046049455",
    "to": "22.467143293223113, 88.40208140550527",
    "label": "S P Mukherjee Road",
    "originAddress": "Esplanade, Kolkata, West Bengal, India",
    "destAddress": "Garia, Kolkata, West Bengal, India",
    "viaCoord": "22.52817115841846, 88.34581932128404|22.487953350919998, 88.35025927646016",
    "preferredBuses": [
      "222",
      "S-112"
    ]
  },
  {
    "id": "M15",
    "section": "Major Road",
    "from": "22.527079059759775, 88.36556008306101",
    "to": "22.52179187546706, 88.32469649801426",
    "label": "Hazra Road / S P Mukherjee Road connector",
    "originAddress": "Ballygunge, Kolkata, West Bengal, India",
    "destAddress": "DH Road, Kolkata, West Bengal, India",
    "viaCoord": "22.523865137447483, 88.33981461622014",
    "preferredBuses": [
      "42A",
      "13A"
    ]
  },
  {
    "id": "M16",
    "section": "Major Road",
    "from": "22.51940616763569, 88.36453630385411",
    "to": "22.5175223871419, 88.33658733140382",
    "label": "Gariahat Road / Rashbehari Avenue",
    "originAddress": "Gariahat, Kolkata, West Bengal, India",
    "destAddress": "Chetla, Kolkata, West Bengal, India",
    "viaCoord": "22.516795226720355, 88.34140274083758",
    "preferredBuses": [
      "S-3W",
      "M-14"
    ]
  },
  {
    "id": "M18",
    "section": "Major Road",
    "from": "22.517460530723888, 88.3365739418487",
    "to": "22.511973693746853, 88.32208180677958",
    "label": "Chetla Road",
    "originAddress": "Chetla, Kolkata, West Bengal, India",
    "destAddress": "DH Road, Kolkata, West Bengal, India",
    "viaCoord": "22.516932912911205, 88.33912820348779|22.516826401074105, 88.33992644410576|22.511651844862076, 88.33986117115793|22.512362564926676, 88.32884891746347",
    "preferredBuses": [
      "S-22",
      "S-3W",
      "SD76"
    ]
  },
  {
    "id": "M19",
    "section": "Major Road",
    "from": "22.49390283116308, 88.34526778991841",
    "to": "22.511962015261304, 88.3220688798639",
    "label": "Tollygunge Road",
    "originAddress": "Tollygunge, Kolkata, West Bengal, India",
    "destAddress": "Taratala, Kolkata, West Bengal, India",
    "viaCoord": "22.509790617362288, 88.33231180950128",
    "preferredBuses": [
      "SD5"
    ]
  },
  {
    "id": "M20",
    "section": "Major Road",
    "from": "22.49194776974465, 88.34483112331563",
    "to": "22.504629758104123, 88.40076347979667",
    "label": "Prince Anwar Shah Rd",
    "originAddress": "Tollygunge, Kolkata, West Bengal, India",
    "destAddress": "Avishikta Crossing, Kolkata, West Bengal, India",
    "viaCoord": "22.503072120538132, 88.36813445657324",
    "preferredBuses": [
      "ST-6"
    ]
  },
  {
    "id": "M21",
    "section": "Major Road",
    "from": "22.57920822201556, 88.41419893752192",
    "to": "22.585077302935726, 88.4212283116677",
    "label": "Broadway Road",
    "originAddress": "Bidhannagar (Salt Lake), Kolkata, West Bengal, India",
    "destAddress": "Karunamoyee, Kolkata, West Bengal, India",
    "viaCoord": "22.58351812520808, 88.4184565809301",
    "preferredBuses": [
      "S-14",
      "S-12NA"
    ]
  },
  {
    "id": "M22",
    "section": "Major Road",
    "from": "22.585219036751344, 88.42233724825942",
    "to": "22.55660195313387, 88.41234886480974",
    "label": "Karunamoyee - Biswa Bangla Sarani",
    "originAddress": "Karunamoyee, Kolkata, West Bengal, India",
    "destAddress": "Chingrighata, Kolkata, West Bengal, India",
    "viaCoord": "22.579750524176504, 88.42614436985471|22.574423205051904, 88.42177785377037",
    "preferredBuses": [
      "S-22"
    ]
  },
  {
    "id": "M23",
    "section": "Major Road",
    "from": "22.585938023125205, 88.42112360649838",
    "to": "22.591775016712575, 88.39386495368447",
    "label": "3rd Avenue",
    "originAddress": "Karunamoyee, Kolkata, West Bengal, India",
    "destAddress": "VIP Road, Kolkata, West Bengal, India",
    "viaCoord": "22.58575696050989, 88.4036713437886",
    "preferredBuses": [
      "Berachampa - Karunamoyee"
    ]
  },
  {
    "id": "S1",
    "section": "Local Connector Segment",
    "from": "22.471408, 88.377338",
    "to": "22.471887032855122, 88.3896818663446",
    "label": "Baishnabghata \u2192 Patuli",
    "originAddress": "Baishnabghata Crossing, SH 1, Dakshin Raipur, Garia, Kolkata, West Bengal 700084",
    "destAddress": "Arindam Maitra, J-3, Baishnabghata Patuli Township, P S Jadavpur, Panchasayer, Kolkata, West Bengal 700094",
    "preferredBuses": [
      "Kamal Gazi Bypass - Dankuni Housing"
    ]
  },
  {
    "id": "S2",
    "section": "Local Connector Segment",
    "from": "22.471887032855122, 88.3896818663446",
    "to": "22.47989072462562, 88.38979518188575",
    "label": "Patuli \u2192 Baghajatin Canal Bridge",
    "originAddress": "Arindam Maitra, J-3, Baishnabghata Patuli Township, P S Jadavpur, Panchasayer, Kolkata, West Bengal 700094",
    "destAddress": "Baghajatin Station Road Canal Bridge 1, F9HQ+WR3, Baghajatin Station Rd, Baghajatin Place, Patuli, Kolkata, West Bengal 700086",
    "preferredBuses": [
      "S-9C",
      "S-24",
      "AC-50A"
    ]
  },
  {
    "id": "S3",
    "section": "Local Connector Segment",
    "from": "22.47989072462562, 88.38979518188575",
    "to": "22.489795, 88.395225",
    "label": "Baghajatin Canal \u2192 Ajaynagar Crossing",
    "originAddress": "Baghajatin Station Road Canal Bridge 1, F9HQ+WR3, Baghajatin Station Rd, Baghajatin Place, Patuli, Kolkata, West Bengal 700086",
    "destAddress": "Ajaynagar 4-Point Crossing, F9QW+V4Q, Ajoy Nagar, Santoshpur, Kolkata, West Bengal 700099",
    "preferredBuses": [
      "AC-37A",
      "Bagbazar - Garia Station",
      "Shyambazar Bata - 45B No. Bus Stand",
      "45A",
      "AC-24A"
    ]
  },
  {
    "id": "S4",
    "section": "Local Connector Segment",
    "from": "22.489795, 88.395225",
    "to": "22.504459553948617, 88.40073511237466",
    "label": "Ajaynagar \u2192 EM Bypass (Kalikapur)",
    "originAddress": "Ajaynagar 4-Point Crossing, F9QW+V4Q, Ajoy Nagar, Santoshpur, Kolkata, West Bengal 700099",
    "destAddress": "E.M. Bypass (Kalikapur), North Purbachal, Haltu, Kolkata, West Bengal 700078",
    "preferredBuses": [
      "Garia No.6 Bus Terminus - Barasat",
      "Paikpara Bus Terminus - 45B No. Bus Stand",
      "AC-37",
      "S-14",
      "S-21"
    ],
    "viaCoord": "22.493409930238286, 88.39720416569472"
  },
  {
    "id": "S5",
    "section": "Local Connector Segment",
    "from": "22.504459553948617, 88.40073511237466",
    "to": "22.513605424895417, 88.40163813624706",
    "label": "EM Bypass \u2192 Kasba Golpark",
    "originAddress": "E.M. Bypass (Kalikapur), North Purbachal, Haltu, Kolkata, West Bengal 700078",
    "destAddress": "Kasba Gol Park, GC72+9PF, Anandapur Main Rd, Sector I, East Kolkata Twp, Kolkata, West Bengal 700107",
    "preferredBuses": [
      "Bagbazar - Garia Station",
      "Garia No. 6 - Ultadanga",
      "Garia No.6 Bus Terminus - Barasat",
      "Shyambazar Bata - 45B No. Bus Stand",
      "AC-37"
    ]
  },
  {
    "id": "S6",
    "section": "Local Connector Segment",
    "from": "22.513605424895417, 88.40163813624706",
    "to": "22.543215599504876, 88.39854568204892",
    "label": "Kasba Golpark \u2192 Parama (Traffic Barrack)",
    "originAddress": "Kasba Gol Park, GC72+9PF, Anandapur Main Rd, Sector I, East Kolkata Twp, Kolkata, West Bengal 700107",
    "destAddress": "Traffic Barrack, G9VX+4HM, Parama Cir, Dhapa, Kolkata, West Bengal 700105",
    "preferredBuses": [
      "EB-16"
    ]
  },
  {
    "id": "S7",
    "section": "Local Connector Segment",
    "from": "22.54321501141463, 88.39855834796509",
    "to": "22.55865275587551, 88.41103526552334",
    "label": "Parama \u2192 Chingrighata",
    "originAddress": "Traffic Barrack, G9VX+4HM, Parama Cir, Dhapa, Kolkata, West Bengal 700105",
    "destAddress": "Maa Tripura Fastfood, C6VH, 7MJCHC54, Canal S Rd, Sec-B, Chingrighata, Ward Number 57, Kolkata, West Bengal 700107",
    "preferredBuses": [
      "EB-16"
    ]
  },
  {
    "id": "S8",
    "section": "Local Connector Segment",
    "from": "22.558657139516853, 88.41102767178542",
    "to": "22.565486, 88.369782",
    "label": "Chingrighata \u2192 Sealdah",
    "originAddress": "Maa Tripura Fastfood, C6VH, 7MJCHC54, Canal S Rd, Sec-B, Chingrighata, Ward Number 57, Kolkata, West Bengal 700107",
    "destAddress": "Suraj Store, 121, AJC Bose Rd, Sealdah, Raja Bazar, Kolkata, West Bengal 700014",
    "viaCoord": "22.565973280132788, 88.3805302160212",
    "preferredBuses": [
      "S-12",
      "239",
      "S-12N"
    ]
  },
  {
    "id": "S9",
    "section": "Local Connector Segment",
    "from": "22.565486, 88.369782",
    "to": "22.54667, 88.361556",
    "label": "Sealdah \u2192 Park Street",
    "originAddress": "Suraj Store, 121, AJC Bose Rd, Sealdah, Raja Bazar, Kolkata, West Bengal 700014",
    "destAddress": "141, Park St, near Institute of Neurosciences, Mullick Bazar, Beniapukur, Kolkata, West Bengal 700017",
    "preferredBuses": [
      "Santragachhi - Sealdah - B.R. Singh Hospital",
      "24A",
      "45B",
      "DN-17",
      "S-12",
      "202",
      "39A/2"
    ]
  },
  {
    "id": "S10",
    "section": "Local Connector Segment",
    "from": "22.54667, 88.361556",
    "to": "22.543215599504876, 88.39854568204892",
    "label": "Park Street \u2192 Parama (via EM Bypass)",
    "originAddress": "141, Park St, near Institute of Neurosciences, Mullick Bazar, Beniapukur, Kolkata, West Bengal 700017",
    "destAddress": "Traffic Barrack, G9VX+4HM, Parama Cir, Dhapa, Kolkata, West Bengal 700105",
    "preferredBuses": [
      "EB-14",
      "K-4"
    ],
    "viaCoord": "22.54105349403992, 88.36817957678178"
  },
  {
    "id": "S11",
    "section": "Local Connector Segment",
    "from": "22.54667, 88.361556",
    "to": "22.519769, 88.365395",
    "label": "Park Street \u2192 Gariahat (Rashbehari)",
    "originAddress": "141, Park St, near Institute of Neurosciences, Mullick Bazar, Beniapukur, Kolkata, West Bengal 700017",
    "destAddress": "Usha Cosmetics, 100, Rash Behari Ave, Ballygunge Gardens, Gariahat, Kolkata, West Bengal 700019",
    "viaCoord": "22.528794536803037, 88.35651883221536",
    "preferredBuses": [
      "45A"
    ]
  },
  {
    "id": "S12",
    "section": "Local Connector Segment",
    "from": "22.519769, 88.365395",
    "to": "22.513605424895417, 88.40163813624706",
    "label": "Gariahat \u2192 Kasba Golpark",
    "originAddress": "Usha Cosmetics, 100, Rash Behari Ave, Ballygunge Gardens, Gariahat, Kolkata, West Bengal 700019",
    "destAddress": "Kasba Gol Park, GC72+9PF, Anandapur Main Rd, Sector I, East Kolkata Twp, Kolkata, West Bengal 700107",
    "preferredBuses": [
      "45A"
    ]
  },
  {
    "id": "S13",
    "section": "Local Connector Segment",
    "from": "22.519769, 88.365395",
    "to": "22.503099, 88.367808",
    "label": "Gariahat \u2192 Jadavpur PS",
    "originAddress": "Usha Cosmetics, 100, Rash Behari Ave, Ballygunge Gardens, Gariahat, Kolkata, West Bengal 700019",
    "destAddress": "Jadavpur Police Station 4-Point Crossing, University Campus Area, SH 1, Jadavpur, Kolkata, West Bengal 700032",
    "preferredBuses": [
      "13C",
      "45",
      "AC-5",
      "S-101"
    ],
    "viaCoord": "22.514734035632127, 88.3671200632832"
  },
  {
    "id": "S14",
    "section": "Local Connector Segment",
    "from": "22.503099, 88.367808",
    "to": "22.504459553948617, 88.40073511237466",
    "label": "Jadavpur PS \u2192 EM Bypass (Kalikapur)",
    "originAddress": "Jadavpur Police Station 4-Point Crossing, University Campus Area, SH 1, Jadavpur, Kolkata, West Bengal 700032",
    "destAddress": "E.M. Bypass (Kalikapur), North Purbachal, Haltu, Kolkata, West Bengal 700078",
    "preferredBuses": [
      "S-4D"
    ]
  },
  {
    "id": "S15",
    "section": "Local Connector Segment",
    "from": "22.503099, 88.367808",
    "to": "22.491648511822472, 88.37243350245176",
    "label": "Jadavpur PS \u2192 Jadavpur Sulekha",
    "originAddress": "Jadavpur Police Station 4-Point Crossing, University Campus Area, SH 1, Jadavpur, Kolkata, West Bengal 700032",
    "destAddress": "Jadavpur Sulekha 4-Point Crossing, 53, Anandapally Rd, Anandapally, Bidhanpally, Jadavpur, Kolkata, West Bengal 700032",
    "preferredBuses": [
      "1A"
    ]
  },
  {
    "id": "S16",
    "section": "Local Connector Segment",
    "from": "22.491648511822472, 88.37243350245176",
    "to": "22.489795, 88.395225",
    "label": "Jadavpur Sulekha \u2192 Ajaynagar Crossing",
    "originAddress": "Jadavpur Sulekha 4-Point Crossing, 53, Anandapally Rd, Anandapally, Bidhanpally, Jadavpur, Kolkata, West Bengal 700032",
    "destAddress": "Ajaynagar 4-Point Crossing, F9QW+V4Q, Ajoy Nagar, Santoshpur, Kolkata, West Bengal 700099",
    "preferredBuses": [
      "S-9"
    ]
  },
  {
    "id": "S17",
    "section": "Local Connector Segment",
    "from": "22.491663328585012, 88.37240626299364",
    "to": "22.483895156021173, 88.3755286267775",
    "label": "Jadavpur Sulekha \u2192 Baghajatin Station Rd",
    "originAddress": "Jadavpur Sulekha 4-Point Crossing, 53, Anandapally Rd, Anandapally, Bidhanpally, Jadavpur, Kolkata, West Bengal 700032",
    "destAddress": "Baghajatin 4-Point Crossing, F9MG+H66, Baghajatin C Block, Chittaranjan Colony 6, Baghajatin Colony, Kolkata, West Bengal 700047",
    "preferredBuses": [
      "13C",
      "45B",
      "AC-5",
      "S-5"
    ]
  },
  {
    "id": "S19",
    "section": "Local Connector Segment",
    "from": "22.483895156021173, 88.3755286267775",
    "to": "22.471408, 88.377338",
    "label": "Baghajatin \u2192 Baishnabghata (South)",
    "originAddress": "Baghajatin 4-Point Crossing, F9MG+H66, Baghajatin C Block, Chittaranjan Colony 6, Baghajatin Colony, Kolkata, West Bengal 700047",
    "destAddress": "Baishnabghata Crossing, SH 1, Dakshin Raipur, Garia, Kolkata, West Bengal 700084",
    "preferredBuses": [
      "45B",
      "45"
    ]
  }
];

// Helper: Calculate Average Speed in km/h
function calcSpeed(distStr, timeMin) {
  if (!distStr || !timeMin || timeMin <= 0) return "N/A";
  
  const distText = String(distStr).toLowerCase().trim();
  let numDist = parseFloat(distText.replace(/[^0-9.]/g, ""));
  if (isNaN(numDist) || numDist <= 0) return "N/A";

  if (/\bm\b/.test(distText)) {
    numDist = numDist / 1000;
  }

  const timeHours = timeMin / 60;
  return (numDist / timeHours).toFixed(1);
}

// Helper: Extract Numeric Walk Minutes from text
function extractWalkMin(walkStr) {
  if (!walkStr) return 0;
  const match = String(walkStr).match(/(\d+)\s*(?:min|m)/i);
  return match ? parseInt(match[1], 10) : 0;
}

// Helper: Calculate Transit Competitiveness Ratio (Bus Time / Car Time)
function calcTransitRatio(busMin, carMin) {
  if (!busMin || !carMin || carMin <= 0) return "N/A";
  return (busMin / carMin).toFixed(2) + "x";
}

// Helper: Calculate Bike vs Car difference (Car Min - Bike Min)
function calcBikeDiff(bikeMin, carMin) {
  if (!bikeMin || !carMin) return "N/A";
  const diff = carMin - bikeMin;
  if (diff > 0) return `-${diff} min (Bike Faster)`;
  if (diff < 0) return `+${Math.abs(diff)} min (Car Faster)`;
  return "Equal";
}

// Helper: Get Peak Classification metadata
function getPeakClassification(slotStr) {
  const d = globalForcedDate ? new Date(globalForcedDate) : new Date();
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
  const dayType = isWeekend ? "Weekend" : "Weekday";
  if (String(slotStr).includes("10_00 AM") || String(slotStr).includes("10:00 AM")) return `${dayName} (${dayType}) - 10_00 AM`;
  if (String(slotStr).includes("01_00 PM") || String(slotStr).includes("1:00 PM") || String(slotStr).includes("01:00 PM")) return `${dayName} (${dayType}) - 01_00 PM`;
  if (String(slotStr).includes("07_00 PM") || String(slotStr).includes("7:00 PM") || String(slotStr).includes("07:00 PM")) return `${dayName} (${dayType}) - 07_00 PM`;
  if (String(slotStr).includes("12_00 AM") || String(slotStr).includes("12:00 AM")) return `${dayName} (${dayType}) - 12_00 AM`;
  return `${dayName} (${dayType}) - ${slotStr}`;
}

// ─── URL BUILDERS ──────────────────────────────────────────────────
function buildMapsUrl(route, mode) {
  const origin = encodeURIComponent(route.from);
  const dest   = encodeURIComponent(route.to);
  
  let viaParam = '';
  if (route.viaCoord) {
    viaParam = `&waypoints=${encodeURIComponent(route.viaCoord)}`;
  }
  
  if (mode === "bike") {
    return `https://www.google.co.in/maps/dir/?api=1&origin=${origin}&destination=${dest}${viaParam}&travelmode=two-wheeler&gl=in&hl=en`;
  }
  return `https://www.google.co.in/maps/dir/?api=1&origin=${origin}&destination=${dest}${viaParam}&travelmode=driving&gl=in&hl=en`;
}

function buildBusTransitUrl(route) {
  const origin = encodeURIComponent(route.from);
  const dest   = encodeURIComponent(route.to);
  let pref = ""; 
  if (route.id === "M12" || route.id === "M13") {
    pref = "&transit_routing_preference=less_walking";
  }
  return `https://www.google.co.in/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit&transit_mode=bus${pref}&gl=in&hl=en`;
}

function nowIST() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
}

function dateIST() {
  if (globalForcedDate) return globalForcedDate;
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 10);
}

function slotLabel() {
  if (globalForcedSlot) return globalForcedSlot;
  const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const h = ist.getHours();
  const m = ist.getMinutes();
  const s = ist.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${ampm}`;
}

const logsDir = path.join(__dirname, "output", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function log(msg) {
  const ts = nowIST();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(logsDir, "scraper.log"), line + "\n");
}

function parseMinutes(text) {
  if (!text) return null;
  text = text.toLowerCase().replace(/about|typically|usually/g, "").trim();
  let total = 0;
  const hrMatch = text.match(/(\d+)\s*h/);
  const minMatch = text.match(/(\d+)\s*m/);
  if (hrMatch) total += parseInt(hrMatch[1]) * 60;
  if (minMatch) total += parseInt(minMatch[1]);
  return total > 0 ? total : null;
}

// Nested Screenshots Organizer: output/screenshots/YYYY-MM-DD/TIME_SLOT/ROUTE_NAME/mode.jpg
async function saveRouteScreenshot(page, route, mode) {
  try {
    const fileDate = dateIST();
    const currentSlot = slotLabel();
    const generalSlot = getGeneralSlotName(currentSlot).replace(/[:\/]/g, '_');
    const safeLabel = (route.label || "route").replace(/[^a-z0-9]/gi, '_');
    const paddedId = String(route.id).replace(/^([MS])([1-9])$/, '$10$2');
    const routeFolder = `${paddedId}_${safeLabel}`;
    
    // Directory: output/screenshots/YYYY-MM-DD/SLOT/ROUTE_NAME/
    const targetDir = path.join(__dirname, "output", "screenshots", fileDate, generalSlot, routeFolder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    const imgName = `${mode}.png`;
    const screenshotPath = path.join(targetDir, imgName);
    const relativePath = `screenshots/${fileDate}/${generalSlot}/${routeFolder}/${imgName}`;
    
    try {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    } catch(e) {}

    await page.evaluate(() => {
      window.dispatchEvent(new Event('resize'));
      const dismissBtns = Array.from(document.querySelectorAll('button')).filter(b => {
        const t = (b.innerText || '').toLowerCase();
        return t === 'dismiss' || t === 'close' || t === 'accept all' || t === 'reject all' || t === 'stay in web';
      });
      dismissBtns.forEach(b => b.click());
    });
    
    await new Promise(r => setTimeout(r, 2200));
    await page.screenshot({ path: screenshotPath, type: 'png' });
    return relativePath;
  } catch (err) {
    return null;
  }
}

async function extractTravelData(page, url, mode, route) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    
    await page.waitForSelector(
      '[data-value="driving"], [data-value="transit"], [data-value="two-wheeler"], [data-travel_mode="8"], .section-directions-trip-duration,' +
      ' .section-trip-header-title, [jsan*="duration"], .MespJc, .Tkt0, .XWZjwc, .Fk3sm, [class*="fontHeadlineSmall"]',
      { timeout: 8000 }
    ).catch(() => {});

    await new Promise(r => setTimeout(r, 1200));

    const result = await page.evaluate((evalMode, expectedRoad) => {
      function isTimeText(t) {
        return /(\d+\s*(hr|hour|h)\s*)?(\d+\s*min)/i.test(t) || /^\d+\s*(hr|hour|h)s?$/i.test(t);
      }
      function isDistText(t) {
        return /\d+\.?\d*\s*km/i.test(t) || /^\d+\s*m$/i.test(t);
      }

      const expectedLower = expectedRoad ? expectedRoad.toLowerCase() : "";
      let keywords = [expectedLower];
      if (expectedLower.includes("bt road") || expectedLower.includes("b t road")) keywords = ["bt road", "b.t. road", "bt rd", "barrackpore trunk"];
      else if (expectedLower.includes("dh road")) keywords = ["dh road", "dh rd", "diamond harbour"];
      else if (expectedLower.includes("vip road")) keywords = ["vip road", "vip rd", "kazi nazrul islam"];
      else if (expectedLower.includes("apc bose") || expectedLower.includes("ajc bose")) keywords = ["apc bose", "ajc bose", "acharya jagadish", "acharya prafulla", "bose road", "ajc bose rd", "apc bose rd"];
      else if (expectedLower.includes("central avenue")) keywords = ["central ave", "chittaranjan ave", "c.r. ave", "cr ave", "central avenue"];
      else if (expectedLower.includes("s n banerjee")) keywords = ["s n banerjee", "s.n. banerjee", "sn banerjee", "surendra nath banerjee"];
      else if (expectedLower.includes("m g road")) keywords = ["m g road", "m.g. road", "mg road", "mahatma gandhi"];
      else if (expectedLower.includes("sarat bose") || expectedLower.includes("lansdowne")) keywords = ["sarat bose", "lansdowne"];
      else if (expectedLower.includes("s p mukherjee")) keywords = ["s p mukherjee", "s.p. mukherjee", "sp mukherjee", "ashutosh mukherjee", "shyamaprasad mukherjee"];
      else if (expectedLower.includes("hazra road")) keywords = ["hazra"];
      else if (expectedLower.includes("gariahat") || expectedLower.includes("rashbehari")) keywords = ["gariahat", "rash behari", "rashbehari"];
      else if (expectedLower.includes("tollygunge - taratala")) keywords = ["tollygunge circular", "taratala"];
      else if (expectedLower.includes("tollygunge - jadavpur")) keywords = ["anwar shah", "netaji subhash", "raja subodh", "jadavpur"];
      else if (expectedLower.includes("canal south")) keywords = ["canal s", "canal south"];



      const routeCards = document.querySelectorAll(
        '[data-index], [data-trip-index], .MespJc, .PB1zzf, [id^="section-directions-trip-"]'
      );
      
      let bestMatch = null;
      let fallbackMatch = null;
      
      for (const card of routeCards) {
        const label = card.getAttribute("aria-label") || card.innerText || "";
        const timeMatch = label.match(/(\d+\s*(?:hr|hour|h)\s*\d*\s*(?:min)?|\d+\s*min)/i);
        const distMatch = label.match(/(\d+\.?\d*\s*km|\d+\s*m(?!\w))/i);
        let routeName = "Unknown";
        const viaMatch = label.match(/via\s+([^·\n]+)/i);
        if (viaMatch) {
          routeName = viaMatch[1].trim();
        }
        
        if (timeMatch && distMatch) {
          const resultObj = { time: timeMatch[0].trim(), dist: distMatch[0].trim(), routeName: routeName };
          if (!fallbackMatch) fallbackMatch = resultObj;
          
          if (keywords.length > 0 && expectedLower !== "") {
             const nameLower = routeName.toLowerCase();
             const isMatch = keywords.some(kw => nameLower.includes(kw));
             if (isMatch) {
                bestMatch = resultObj;
                break;
             }
          }
        }
      }
      
      if (bestMatch) return bestMatch;
      if (fallbackMatch) return fallbackMatch;

      const allAria = document.querySelectorAll('[aria-label]');
      for (const el of allAria) {
        const label = el.getAttribute("aria-label") || "";
        const timeMatch = label.match(/(\d+\s*(?:hr|hour|h)\s*\d*\s*(?:min)?|\d+\s*min)/i);
        const distMatch = label.match(/(\d+\.?\d*\s*km|\d+\s*m(?!\w))/i);
        let routeName = "Unknown";
        const viaMatch = label.match(/via\s+([^·\n]+)/i);
        if (viaMatch) {
          routeName = viaMatch[1].trim();
        }
        if (timeMatch && distMatch) {
          return { time: timeMatch[0].trim(), dist: distMatch[0].trim(), routeName: routeName };
        }
      }

      return null;
    }, mode, route.expectedRoad);

    let traffic = "Unknown";
    if (mode === "car") {
      traffic = await page.evaluate(() => {
        const body = document.body.innerText.toLowerCase();
        if (body.includes("heavy traffic") || body.includes("severe traffic") || body.includes("traffic jam")) return "High";
        if (body.includes("moderate traffic") || body.includes("some traffic") || body.includes("slow traffic")) return "Moderate";
        if (body.includes("usual traffic") || body.includes("normal traffic") || body.includes("traffic is fine")) return "Good";
        const delayMatch = body.match(/\+(\d+)\s*min\s*(delay|slower|traffic)/);
        if (delayMatch) {
          const delay = parseInt(delayMatch[1]);
          if (delay > 15) return "High";
          if (delay > 5) return "Moderate";
          return "Good";
        }
        return "Unknown";
      });
    }

    const imgPath = await saveRouteScreenshot(page, route, mode);

    return {
      timeMin: result ? parseMinutes(result.time) : null,
      timeRaw: result ? result.time : null,
      distRaw: result ? result.dist : null,
      trafficCondition: traffic,
      routeName: result ? result.routeName : null,
      imagePath: imgPath
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function setDepartAtTime(page, timeStr) {
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"], span')).filter(e => {
        const t = (e.textContent||'').trim();
        return t === 'Leave now' || t === 'Depart at' || t === 'Arrive by';
      });
      if (btns.length > 0) btns[0].click();
    });
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('*')).filter(e => (e.textContent||'').trim() === 'Depart at' && e.children.length < 2);
      if (items.length > 0) items[0].click();
    });
    await new Promise(r => setTimeout(r, 400));

    const inputEl = await page.$('input[name="transit-time"], input[class*="LgGJQc"]');
    if (inputEl) {
      await inputEl.click({ clickCount: 3 });
      await inputEl.type(timeStr);
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1200));
      return true;
    }
  } catch (e) {}
  return false;
}

async function applyTransitOptions(page) {
  try {
    await page.evaluate(() => {
      const optionsBtn = Array.from(document.querySelectorAll('button')).find(b => {
        const text = (b.innerText || '').toLowerCase();
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        return text === 'options' || aria === 'route options';
      });
      if (optionsBtn) optionsBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const clickIfChecked = (lbl) => {
        const input = lbl.querySelector('input[type="checkbox"]');
        if (input && input.checked) lbl.click();
      };
      const checkIfNotChecked = (lbl) => {
        const input = lbl.querySelector('input[type="checkbox"]');
        if (input && !input.checked) lbl.click();
      };
      
      for (const lbl of labels) {
        const txt = (lbl.innerText || '').toLowerCase();
        if (txt === 'bus') checkIfNotChecked(lbl);
        else if (txt === 'subway' || txt === 'train' || txt.includes('tram') || txt.includes('ferry') || txt.includes('flight')) clickIfChecked(lbl);
        else if (txt === 'less walking') {
          const input = lbl.querySelector('input[type="radio"]');
          if (input && !input.checked) lbl.click();
        }
      }
      
      const closeBtns = Array.from(document.querySelectorAll('button')).filter(b => (b.innerText || '').toLowerCase() === 'close' || (b.getAttribute('aria-label')||'').toLowerCase() === 'close route options');
      if (closeBtns.length > 0) closeBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 600));
  } catch(e) {}
}

function getClosestTargetSlot(timeStr) {
  if (globalForcedSlot) return globalForcedSlot.replace('_', ':');
  const match = String(timeStr).match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  let totalMins = (h % 12) * 60 + m;
  if (ampm === 'PM') totalMins += 12 * 60;

  const targets = [
    { name: "10:00 AM", mins: 10 * 60 },
    { name: "01:00 PM", mins: 13 * 60 },
    { name: "07:00 PM", mins: 19 * 60 },
    { name: "12:00 AM", mins: 0 },
    { name: "12:00 AM", mins: 24 * 60 }
  ];
  let closest = targets[0];
  let minDiff = 9999;
  for (let t of targets) {
    let diff = Math.abs(totalMins - t.mins);
    if (diff < minDiff) {
      minDiff = diff;
      closest = t;
    }
  }
  return closest.name;
}

async function runFetchSession(label = "manual") {
  log(`\n${"═".repeat(60)}`);
  log(`STARTING FETCH SESSION: ${label}`);
  log(`Time (IST): ${nowIST()}`);
  log(`Routes: ${ROUTES.length}`);
  log(`${"═".repeat(60)}`);

  const outDir = path.join(__dirname, "output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let browser;
  try {
    const isCI = !!process.env.CI;
    browser = await puppeteer.launch({
      headless: isCI ? "new" : false,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1920,1080",
        "--lang=en-IN",
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-IN,en;q=0.9" });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");

    const results = [];
    
    for (let i = 0; i < ROUTES.length; i++) {
      const route = ROUTES[i];
      log(`[${i + 1}/${ROUTES.length}] ${route.label}`);

      // 1. Fetch Private Car data
      const carUrl = buildMapsUrl(route, "car");
      const carData = (await extractTravelData(page, carUrl, "car", route)) || {};
      
      await new Promise(r => setTimeout(r, 600));
      
      // 2. Fetch Bike data (Bus mode dropped per user specification)
      const bikeUrl = buildMapsUrl(route, "bike");
      const bikeData = (await extractTravelData(page, bikeUrl, "bike", route)) || {};
      if (carData.distRaw && !bikeData.distRaw) bikeData.distRaw = carData.distRaw;

      const resultObj = {
        routeId: route.id,
        section: route.section,
        from: route.from,
        to: route.to,
        label: route.label,
        carTimeRaw: carData.timeRaw,
        carTimeMin: carData.timeMin,
        carDistRaw: carData.distRaw,
        carTraffic: carData.trafficCondition,
        carRoute: carData.routeName || "",
        busTimeRaw: null,
        busTimeMin: null,
        busDistRaw: null,
        busRoute: "N/A (Bus Dropped)",
        busWalkTime: "",
        rawDetails: "N/A",
        busReason: "",
        busExactMatch: false,
        bikeTimeRaw: bikeData.timeRaw,
        bikeTimeMin: bikeData.timeMin,
        bikeDistRaw: bikeData.distRaw,
        bikeRoute: bikeData.routeName || "",
        timeSlot: slotLabel(),
        carImagePath: carData.imagePath,
        bikeImagePath: bikeData.imagePath,
        busImagePath: ""
      };
      
      results.push(resultObj);

      log(`  🚙 Car: ${carData.timeRaw || "N/A"} (${carData.timeMin || "?"} min) | dist: ${carData.distRaw || "?"} | traffic: ${carData.trafficCondition || "?"}`);
      log(`  🛵 Bike: ${bikeData.timeRaw || "N/A"} (${bikeData.timeMin || "?"} min) | dist: ${bikeData.distRaw || "?"}`);

      await new Promise(r => setTimeout(r, 800));
    }

    log(`\nSession complete! Saving to Excel...`);
    await saveExcel(results, outDir);

    try {
      const { execSync } = require('child_process');
      const verifierScript = path.join(__dirname, 'daily_end_of_day_verifier.js');
      if (fs.existsSync(verifierScript)) {
        log(`\n🔍 Automatically triggering daily verification audit...`);
        execSync(`node "${verifierScript}" --date "${dateIST()}"`, { stdio: 'inherit' });
      }
    } catch (e) {
      log(`⚠️ Auto-verification notice: ${e.message}`);
    }

    return results;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function getGeneralSlotName(timeStr) {
  let str = (globalForcedSlot || timeStr || '').trim();
  if (str.includes("10:00") || str.includes("10_00") || str.startsWith("10:")) return "10_00 AM";
  if (str.includes("01:00") || str.includes("1:00") || str.includes("01_00") || str.startsWith("01:") || str.startsWith("1:")) return "01_00 PM";
  if (str.includes("07:00") || str.includes("7:00") || str.includes("07_00") || str.startsWith("07:") || str.startsWith("7:")) return "07_00 PM";
  if (str.includes("12:00") || str.includes("12_00") || str.startsWith("12:")) return "12_00 AM";

  const match = timeStr.match(/(\d+):(\d+)(?::\d+)?\s*(AM|PM)?/i);
  if (!match) return "Data_Run";
  let h = parseInt(match[1]);
  const ampm = (match[3] || '').toUpperCase();
  if (h === 12 && ampm === "AM") h = 0;
  else if (h < 12 && ampm === "PM") h += 12;
  else if (h === 12 && ampm === "PM") h = 12;

  if (h >= 8 && h < 12) return "10_00 AM";
  if (h >= 12 && h < 16) return "01_00 PM";
  if (h >= 16 && h < 21) return "07_00 PM";
  return "12_00 AM";
}

async function saveExcel(results, outDir) {
  const fileDate = dateIST();
  const excelDir = path.join(outDir, "excel");
  if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
  const xlsxFile = path.join(excelDir, `Kolkata_Traffic_Data_${fileDate}.xlsx`);
  
  let wb = new ExcelJS.Workbook();
  if (fs.existsSync(xlsxFile)) {
    try { await wb.xlsx.readFile(xlsxFile); } catch { wb = new ExcelJS.Workbook(); }
  }

  const currentSlot = results[0].timeSlot || "Data_Run"; 
  const generalSlot = getGeneralSlotName(currentSlot);
  const sheetName = generalSlot.replace(/[:\/]/g, "_");

  let sheet = wb.getWorksheet(sheetName);
  if (!sheet) {
    sheet = wb.addWorksheet(sheetName);
    
    const headers = [
      "Route ID", "Category", "Road Name (Matches Coordinate Excel)",
      "Exact Collection Time", "Peak Classification",
      "Car Dist", "Car Time (min)", "Car Speed (km/h)",
      "Bike Dist", "Bike Time (min)", "Bike Speed (km/h)", "Bike vs Car Diff",
      "Bus Dist", "Bus Time (min)", "Bus In-Vehicle Time (min)", "Pedestrian Walk Time (min)", "Bus Speed (km/h)", "Which Bus Taken", "Raw Bus Card Details", "Bus vs Car Ratio",
      "Bus Walking Details",
      "Discrepancies & Reason (Why Bus Faster)",
      "Car Map Image", "Bike Map Image", "Bus Map Image"
    ];
    sheet.addRow(headers);
    
    for (const r of ROUTES) {
      sheet.addRow([r.id, r.section, r.label, currentSlot, getPeakClassification(generalSlot), "N/A", "", "N/A", "N/A", "", "N/A", "N/A", "N/A", "", "", 0, "N/A", "N/A", "N/A", "", "", "", "", "", ""]);
    }
  }

  for (const rData of results) {
    const routeIndex = ROUTES.findIndex(r => r.id === rData.routeId);
    if (routeIndex === -1) continue;
    
    const r = ROUTES[routeIndex];
    const targetRowNumber = routeIndex + 2;
    const addedRow = sheet.getRow(targetRowNumber);
    
    const carDistVal = rData.carDistRaw || "N/A";
    const bikeDistVal = rData.bikeDistRaw || rData.carDistRaw || "N/A";
    const carMinVal = rData.carTimeMin || 0;
    const bikeMinVal = rData.bikeTimeMin || 0;
    const busMinVal = rData.busTimeMin || 0;
    const walkMinVal = extractWalkMin(rData.busWalkTime);
    const inVehVal = (busMinVal && busMinVal > walkMinVal) ? (busMinVal - walkMinVal) : busMinVal;

    addedRow.values = [
      r.id,
      r.section || "Major Road",
      r.label || `${r.from} -> ${r.to}`,
      rData.timeSlot || currentSlot,
      getPeakClassification(generalSlot),
      carDistVal,
      carMinVal || "",
      calcSpeed(carDistVal, carMinVal),
      bikeDistVal,
      bikeMinVal || "",
      calcSpeed(bikeDistVal, bikeMinVal),
      calcBikeDiff(bikeMinVal, carMinVal),
      carDistVal,
      busMinVal || "",
      inVehVal || "",
      walkMinVal || 0,
      calcSpeed(carDistVal, busMinVal),
      rData.busRoute || "N/A",
      rData.rawDetails || "N/A",
      calcTransitRatio(busMinVal, carMinVal),
      `Walk: ${rData.busWalkTime || "N/A"}`,
      rData.busReason || "",
      rData.carImagePath || "",  // Column W (Car Image Path)
      rData.bikeImagePath || "", // Column X (Bike Image Path)
      rData.busImagePath || ""   // Column Y (Bus Image Path)
    ];

    const carMinCell = addedRow.getCell(7);
    if (rData.carTraffic === "High") {
      carMinCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD2D2' } };
      carMinCell.font = { name: 'Segoe UI', size: 10, color: { argb: '9C0006' }, bold: true };
    } else if (rData.carTraffic === "Moderate") {
      carMinCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE699' } };
      carMinCell.font = { name: 'Segoe UI', size: 10, color: { argb: '9C6500' }, bold: true };
    } else if (rData.carTraffic === "Good") {
      carMinCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D6F5D6' } };
      carMinCell.font = { name: 'Segoe UI', size: 10, color: { argb: '006100' }, bold: true };
    }

    if (rData.busReason && (rData.busReason.includes("⚠️") || rData.busReason.includes("DISCREPANCY") || rData.busReason.includes("ANOMALY"))) {
      const reasonCell = addedRow.getCell(21);
      reasonCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC000" } };
      reasonCell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF9C0006" } };
    }
  }

  // ─── STYLING & FORMATTING ──────────────────────────────────────────────────
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  
  sheet.getColumn(22).width = 40;
  sheet.getColumn(23).width = 45;
  sheet.getColumn(24).width = 45;
  sheet.getColumn(25).width = 45;
  
  sheet.autoFilter = {
    from: 'A1',
    to: sheet.getColumn(sheet.columnCount).letter + '1'
  };
  
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' }
    };
    cell.font = {
      name: 'Segoe UI',
      bold: true,
      color: { argb: 'FFFFFF' },
      size: 11
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      bottom: { style: 'medium', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: 'FFFFFF' } }
    };
  });

  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    row.height = 20;
    const isEven = r % 2 === 0;
    const defaultBg = isEven ? 'F9FAFB' : 'FFFFFF';
    
    row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      cell.font = cell.font || {};
      cell.font.name = 'Segoe UI';
      cell.font.size = cell.font.size || 10;
      if (!cell.font.color) cell.font.color = { argb: '333333' };
      
      const isStaticCol = colIdx <= 5;
      const isRouteCol = colIdx > 5 && ((colIdx - 6) % 4 === 1 || (colIdx - 6) % 4 === 3);
      const isTimeCol = colIdx > 5 && ((colIdx - 6) % 4 === 0 || (colIdx - 6) % 4 === 2);
      
      if (isStaticCol || isRouteCol) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: defaultBg }
        };
      } else if (isTimeCol) {
        if (!cell.fill || cell.fill.type !== 'pattern') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: defaultBg }
          };
        }
      }
      
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
      
      if (colIdx === 1 || colIdx === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colIdx === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (colIdx === 4 || colIdx === 5) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else {
        const val = cell.value;
        if (typeof val === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
    });
  }

  sheet.columns.forEach((col) => {
    let maxLen = 12;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const val = String(cell.value || '');
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(maxLen + 4, 45);
  });

  sheet.getColumn(1).width = 10;
  sheet.getColumn(2).width = 12;
  sheet.getColumn(3).width = 40;

  await wb.xlsx.writeFile(xlsxFile);
  log(`📊 Excel saved (styled & formatted): ${xlsxFile}`);
}

function startScheduler() {
  log("⏰ Scheduler started. Auto-fetch at: 12:00 AM, 10:00 AM, 1:00 PM, 7:00 PM IST");
  
  const isIST = Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata";
  log(`Machine timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

  if (isIST) {
    cron.schedule("0 0 * * *", () => runFetchSession("12:00 AM IST"));
    cron.schedule("0 10 * * *", () => runFetchSession("10:00 AM IST"));
    cron.schedule("0 13 * * *", () => runFetchSession("1:00 PM IST"));
    cron.schedule("0 19 * * *", () => runFetchSession("7:00 PM IST"));
  } else {
    cron.schedule("30 18 * * *", () => runFetchSession("12:00 AM IST"));
    cron.schedule("30 4 * * *", () => runFetchSession("10:00 AM IST"));
    cron.schedule("30 7 * * *", () => runFetchSession("1:00 PM IST"));
    cron.schedule("30 13 * * *", () => runFetchSession("7:00 PM IST"));
  }
}

if (require.main === module) {
  const arg = process.argv[2];
  if (arg === "schedule") {
    startScheduler();
  } else if (arg === "test") {
    log("Running TEST with first 2 routes...");
    ROUTES.splice(2);
    runFetchSession("test").then(() => process.exit(0));
  } else if (arg === "route" && process.argv[3]) {
    const targetId = process.argv[3].toUpperCase();
    log(`Running TEST for specific route ID: ${targetId}...`);
    const found = ROUTES.filter(r => r.id.toUpperCase() === targetId);
    if (found.length > 0) {
      ROUTES.length = 0;
      ROUTES.push(...found);
      runFetchSession("test").then(() => process.exit(0));
    } else {
      log(`❌ Route ID ${targetId} not found!`);
      process.exit(1);
    }
  } else {
    runFetchSession("manual").then(() => process.exit(0));
  }
}

module.exports = { ROUTES };
