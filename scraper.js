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
    "from": "22.527158250575937, 88.32629182603299",
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
    "viaCoord": "22.632358132193776, 88.37835292777488",
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
    "from": "22.601056846335993, 88.37402034340928",
    "to": "22.541558358873257, 88.34785101804736",
    "label": "APC Bose Rd",
    "originAddress": "Shyambazar, Kolkata, West Bengal, India",
    "destAddress": "Rabindra Sadan, Kolkata, West Bengal, India",
    "viaCoord": "22.569642688737137, 88.37075116233869|22.541061188874014, 88.35908802998323",
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
    "from": "22.564973995769705, 88.36867828609434",
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
    "to": "22.584307224238653, 88.34357211013575",
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
    "to": "22.513359349485555, 88.35320781629815",
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
    "to": "22.46736996509972, 88.40194386708289",
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
    "destAddress": "DH Road, Kolkata, West Bengal, India  Thyrocare Diagnostic Lab | Blood Test Centre - JULPIA, WEST BENGAL, GROUND FLOOR, REGENT SUPER MARKET, BUS STAND, NH-12, Diamond Harbour Rd, near AMTALA CTC, KANYANAGAR, BISHNUPUR, JULPIA, West Bengal 700027",
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
    "viaCoord": "22.512715830851768, 88.32730227477536",
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
    "label": "Tollygunge - Taratala Road",
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
    "to": "22.58593474320461, 88.42114053652573",
    "label": "Karunamoyee Road",
    "originAddress": "Bidhannagar (Salt Lake), Kolkata, West Bengal, India",
    "destAddress": "Karunamoyee, Kolkata, West Bengal, India",
    "viaCoord": "22.588525816330684, 88.41015859073889",
    "preferredBuses": [
      "S-14",
      "S-12NA"
    ]
  },
  {
    "id": "M22",
    "section": "Major Road",
    "from": "22.58483279068582, 88.42275741933018",
    "to": "22.55660195313387, 88.41234886480974",
    "label": "Canal South Road",
    "originAddress": "Karunamoyee, Kolkata, West Bengal, India",
    "destAddress": "Chingrighata, Kolkata, West Bengal, India",
    "viaCoord": "22.576888446531054, 88.42931835539572|22.57090383415109, 88.4260689441617",
    "preferredBuses": [
      "S-22"
    ]
  },
  {
    "id": "M23",
    "section": "Major Road",
    "from": "22.585938023125205, 88.42112360649838",
    "to": "22.591775016712575, 88.39386495368447",
    "label": "VIP Road connector",
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
    "from": "22.47111844588178, 88.37733766229421",
    "to": "22.472441172210633, 88.38940268338776",
    "label": "Baishnabghata-Patuli",
    "originAddress": "Baishnabghata Crossing, SH 1, Dakshin Raipur, Garia, Kolkata, West Bengal 700084",
    "destAddress": "Arindam Maitra, J-3, Baishnabghata Patuli Township, P S Jadavpur, Panchasayer, Kolkata, West Bengal 700094",
    "viaCoord": "22.471759429057638, 88.38280156319036",
    "preferredBuses": [
      "Kamal Gazi Bypass - Dankuni Housing"
    ]
  },
  {
    "id": "S2",
    "section": "Local Connector Segment",
    "from": "22.472361401316498, 88.38919163643398",
    "to": "22.483209972897573, 88.39160731582483",
    "label": "Patuli - Highland Park",
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
    "from": "22.483238597773603, 88.39157582605505",
    "to": "22.490218942129033, 88.39539974352829",
    "label": "Highland Park - Ajaynagar",
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
    "from": "22.490238916385433, 88.39539761773155",
    "to": "22.50463376654986, 88.40069909900949",
    "label": "Ajaynagar - Kalikapur",
    "originAddress": "Ajaynagar 4-Point Crossing, F9QW+V4Q, Ajoy Nagar, Santoshpur, Kolkata, West Bengal 700099",
    "destAddress": "E.M. Bypass (Kalikapur), North Purbachal, Haltu, Kolkata, West Bengal 700078",
    "preferredBuses": [
      "Garia No.6 Bus Terminus - Barasat",
      "Paikpara Bus Terminus - 45B No. Bus Stand",
      "AC-37",
      "S-14",
      "S-21"
    ]
  },
  {
    "id": "S5",
    "section": "Local Connector Segment",
    "from": "22.504629632757013, 88.40070408309158",
    "to": "22.515015506248922, 88.40121304462548",
    "label": "Kalikapur - Ruby",
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
    "from": "22.51500841172067, 88.40121767911239",
    "to": "22.548629502372947, 88.40044220056303",
    "label": "Ruby - Science City",
    "originAddress": "Kasba Gol Park, GC72+9PF, Anandapur Main Rd, Sector I, East Kolkata Twp, Kolkata, West Bengal 700107",
    "destAddress": "Traffic Barrack, G9VX+4HM, Parama Cir, Dhapa, Kolkata, West Bengal 700105",
    "viaCoord": "22.548321797908233, 88.4002551595529",
    "preferredBuses": [
      "EB-16"
    ]
  },
  {
    "id": "S7",
    "section": "Local Connector Segment",
    "from": "22.548628109045932, 88.40044376011365",
    "to": "22.558998174636194, 88.41055440059681",
    "label": "Science City - Chingrighata",
    "originAddress": "Traffic Barrack, G9VX+4HM, Parama Cir, Dhapa, Kolkata, West Bengal 700105",
    "destAddress": "Maa Tripura Fastfood, C6VH, 7MJCHC54, Canal S Rd, Sec-B, Chingrighata, Ward Number 57, Kolkata, West Bengal 700107",
    "viaCoord": "22.552651634410633, 88.40768107350975",
    "preferredBuses": [
      "EB-16"
    ]
  },
  {
    "id": "S8",
    "section": "Local Connector Segment",
    "from": "22.559072808494104, 88.41063802086141",
    "to": "22.56533700908961, 88.37018480530206",
    "label": "Chingrighata - Sealdah",
    "originAddress": "Maa Tripura Fastfood, C6VH, 7MJCHC54, Canal S Rd, Sec-B, Chingrighata, Ward Number 57, Kolkata, West Bengal 700107",
    "destAddress": "Suraj Store, 121, AJC Bose Rd, Sealdah, Raja Bazar, Kolkata, West Bengal 700014",
    "viaCoord": "22.564439484187115, 88.38848599581354",
    "preferredBuses": [
      "S-12",
      "239",
      "S-12N"
    ]
  },
  {
    "id": "S9",
    "section": "Local Connector Segment",
    "from": "22.565334347093035, 88.37018443948199",
    "to": "22.54399697708432, 88.36520044431275",
    "label": "Sealdah - Park Circus",
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
    "from": "22.5430530030704, 88.3653112954543",
    "to": "22.541384705117025, 88.39842862077691",
    "label": "Park Circus - Science City",
    "originAddress": "141, Park St, near Institute of Neurosciences, Mullick Bazar, Beniapukur, Kolkata, West Bengal 700017",
    "destAddress": "Traffic Barrack, G9VX+4HM, Parama Cir, Dhapa, Kolkata, West Bengal 700105",
    "preferredBuses": [
      "EB-14",
      "K-4"
    ]
  },
  {
    "id": "S11",
    "section": "Local Connector Segment",
    "from": "22.542674975895174, 88.36605559055536",
    "to": "22.520039211567354, 88.36614666255528",
    "label": "Park Circus - Gariahat",
    "originAddress": "141, Park St, near Institute of Neurosciences, Mullick Bazar, Beniapukur, Kolkata, West Bengal 700017",
    "destAddress": "Usha Cosmetics, 100, Rash Behari Ave, Ballygunge Gardens, Gariahat, Kolkata, West Bengal 700019",
    "viaCoord": "22.528559348563704, 88.36606868798494",
    "preferredBuses": [
      "45A"
    ]
  },
  {
    "id": "S12",
    "section": "Local Connector Segment",
    "from": "22.520027866716475, 88.36614376573124",
    "to": "22.515017428359968, 88.40115038506943",
    "label": "Gariahat - Ruby",
    "originAddress": "Usha Cosmetics, 100, Rash Behari Ave, Ballygunge Gardens, Gariahat, Kolkata, West Bengal 700019",
    "destAddress": "Kasba Gol Park, GC72+9PF, Anandapur Main Rd, Sector I, East Kolkata Twp, Kolkata, West Bengal 700107",
    "preferredBuses": [
      "45A"
    ]
  },
  {
    "id": "S13",
    "section": "Local Connector Segment",
    "from": "22.519345508325756, 88.36557930294695",
    "to": "22.502239007405652, 88.36830162732512",
    "label": "Gariahat - Mallick Road",
    "originAddress": "Usha Cosmetics, 100, Rash Behari Ave, Ballygunge Gardens, Gariahat, Kolkata, West Bengal 700019",
    "destAddress": "Jadavpur Police Station 4-Point Crossing, University Campus Area, SH 1, Jadavpur, Kolkata, West Bengal 700032",
    "preferredBuses": [
      "13C",
      "45",
      "AC-5",
      "S-101"
    ]
  },
  {
    "id": "S14",
    "section": "Local Connector Segment",
    "from": "22.50306629533544, 88.36813682334592",
    "to": "22.504635861203088, 88.40069806959247",
    "label": "Jadavpur Police St. - Kalikapur",
    "originAddress": "Jadavpur Police Station 4-Point Crossing, University Campus Area, SH 1, Jadavpur, Kolkata, West Bengal 700032",
    "destAddress": "E.M. Bypass (Kalikapur), North Purbachal, Haltu, Kolkata, West Bengal 700078",
    "preferredBuses": [
      "S-4D"
    ]
  },
  {
    "id": "S15",
    "section": "Local Connector Segment",
    "from": "22.502231902553437, 88.36830005407667",
    "to": "22.491603024125503, 88.37260168803094",
    "label": "Mallick Road - Jadavpur Sulekha",
    "originAddress": "Jadavpur Police Station 4-Point Crossing, University Campus Area, SH 1, Jadavpur, Kolkata, West Bengal 700032",
    "destAddress": "Jadavpur Sulekha 4-Point Crossing, 53, Anandapally Rd, Anandapally, Bidhanpally, Jadavpur, Kolkata, West Bengal 700032",
    "preferredBuses": [
      "1A"
    ]
  },
  {
    "id": "S16",
    "section": "Local Connector Segment",
    "from": "22.491649826180957, 88.37260244927064",
    "to": "22.490231691118016, 88.3953971050448",
    "label": "Jadavpur Sulekha - Ajay Nagar",
    "originAddress": "Jadavpur Sulekha 4-Point Crossing, 53, Anandapally Rd, Anandapally, Bidhanpally, Jadavpur, Kolkata, West Bengal 700032",
    "destAddress": "Ajaynagar 4-Point Crossing, F9QW+V4Q, Ajoy Nagar, Santoshpur, Kolkata, West Bengal 700099",
    "preferredBuses": [
      "S-9"
    ]
  },
  {
    "id": "S17",
    "section": "Local Connector Segment",
    "from": "22.49080563345136, 88.3724040440187",
    "to": "22.483337435034223, 88.37566853272418",
    "label": "Jadavpur Sulekha - Bagha Jatin",
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
    "from": "22.483335096377978, 88.37566811394672",
    "to": "22.47152565348505, 88.37785984412885",
    "label": "Bagha Jatin - Baishnabghata",
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

  // Google Maps returns distances like "800 m" or "1.2 km"
  // If the unit is exactly "m", convert it to kilometers
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
// ALL THREE MODES use the same Origin → Destination from Roads.xlsx.
// No intermediate waypoints are applied to ANY mode — this ensures the car,
// bike and bus are all measured on an identical basis (same A→B endpoints).
// Google Maps routes each mode on the real road network between those points.
// The routes are valid per the Roads.xlsx because the endpoints (from/to) come
// directly from the coordinates defined in Coordinates.xlsx for each road.

function buildMapsUrl(route, mode) {
  const origin = encodeURIComponent(route.from);
  const dest   = encodeURIComponent(route.to);
  
  // Force Car and Bike to use the EXACT coordinates from the Excel sheet
  let viaParam = '';
  if (route.viaCoord) {
    viaParam = `&waypoints=${encodeURIComponent(route.viaCoord)}`;
  }
  
  if (mode === "bike") {
    return `https://www.google.co.in/maps/dir/?api=1&origin=${origin}&destination=${dest}${viaParam}&travelmode=two-wheeler&gl=in&hl=en`;
  }
  return `https://www.google.co.in/maps/dir/?api=1&origin=${origin}&destination=${dest}${viaParam}&travelmode=driving&gl=in&hl=en`;
}

// Bus OD URL
function buildBusTransitUrl(route) {
  const origin = encodeURIComponent(route.from);
  const dest   = encodeURIComponent(route.to);
  let pref = ""; // Defaults to Google Maps 'Best Route' (Fastest) for all routes
  if (route.id === "M12" || route.id === "M13") {
    pref = "&transit_routing_preference=less_walking";
  }
  return `https://www.google.co.in/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit&transit_mode=bus${pref}&gl=in&hl=en`;
}

// Bus Segment URL for intersection checking
function buildBusSegmentUrl(from, to) {
  const o = encodeURIComponent(from);
  const d = encodeURIComponent(to);
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=transit&transit_mode=bus&transit_routing_preference=less_walking`;
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

const earlyOutDir = path.join(__dirname, "output");
if (!fs.existsSync(earlyOutDir)) {
  fs.mkdirSync(earlyOutDir, { recursive: true });
}

function log(msg) {
  const ts = nowIST();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(__dirname, "output", "scraper.log"), line + "\n");
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

async function saveRouteScreenshot(page, route, mode) {
  try {
    const safeLabel = (route.label || "route").replace(/[^a-z0-9]/gi, '_');
    const roadDir = path.join(__dirname, "output", "screenshots", `${route.id}_${safeLabel}`);
    if (!fs.existsSync(roadDir)) fs.mkdirSync(roadDir, { recursive: true });
    const imgName = `${mode}_${Date.now()}.jpg`;
    const screenshotPath = path.join(roadDir, imgName);
    
    // Ensure viewport is set to wide Full HD
    try {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    } catch(e) {}

    // Trigger full canvas resize and dismiss any modal banners so 100% of tiles render
    await page.evaluate(() => {
      window.dispatchEvent(new Event('resize'));
      const activeCard = document.querySelector('.section-directions-trip-duration, .MespJc, [data-trip-index="0"]');
      if (activeCard) activeCard.click();
      
      const dismissBtns = Array.from(document.querySelectorAll('button')).filter(b => {
        const t = (b.innerText || '').toLowerCase();
        return t === 'dismiss' || t === 'close' || t === 'accept all' || t === 'reject all' || t === 'stay in web';
      });
      dismissBtns.forEach(b => b.click());
    });
    
    // Wait for all vector tiles, road labels, ETA boxes, and traffic colors to stream completely
    await new Promise(r => setTimeout(r, 2200));

    // High quality JPEG (90) ensures razor-sharp road labels, bus badges, and traffic colors
    await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 90 });
    return screenshotPath;
  } catch (err) {
    return null;
  }
}

async function extractTravelData(page, url, mode, route) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    
    // Give it a moment to render the map & routes
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

      // Define keywords for fuzzy matching for all modes
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

      if (evalMode === "bus") {
        const cards = document.querySelectorAll('.MespJc');
        let selectedCard = null;
        
        for (const card of cards) {
          const imgs = card.querySelectorAll('img');
          let hasMetro = false;
          for (const img of imgs) {
            const alt = (img.getAttribute('alt') || '').toLowerCase();
            const src = (img.getAttribute('src') || '').toLowerCase();
            if (alt.includes('metro') || alt.includes('subway') || alt.includes('train') || alt.includes('rail') || alt.includes('tram') ||
                src.includes('metro') || src.includes('subway') || src.includes('train') || src.includes('rail') || src.includes('tram')) {
              hasMetro = true;
              break;
            }
          }
          const txt = card.innerText.toLowerCase();
          const ariaEls = card.querySelectorAll('[aria-label*="Metro"], [aria-label*="Train"], [aria-label*="Subway"], [class*="train"], [class*="subway"], [class*="metro"]');
          if (ariaEls.length > 0 || /blue line|green line|purple line|orange line|local train|ferry|vessel|tram/i.test(txt)) {
            hasMetro = true;
          }
          
          if (hasMetro) continue;

          if (hasMetro) continue;

          selectedCard = card;
          break;
        }
        
        if (!selectedCard) return null; 
        
        selectedCard.click(); 

        const transitEl = selectedCard.querySelector('.Fk3sm, [class*="fontHeadlineSmall"], .UgZKXd .Fk3sm');
        let transitRoute = "Unknown";
        const spans = Array.from(selectedCard.querySelectorAll('span, div')).map(el => el.textContent.trim());
        const busNumbers = [...new Set(spans.filter(t => t.length > 0 && t.length < 15 && !t.includes('min') && !t.includes('hr') && !t.includes(':') && !t.includes('Details') && !t.includes('every')))];
        transitRoute = busNumbers.join(" + ");
        
        let transitDist = null;
        const distMatch = selectedCard.innerText.match(/(\d+\.?\d*\s*km|\d+\s*m(?!\w))/i);
        if (distMatch) {
          transitDist = distMatch[0].trim();
        }
        
        if (transitEl) {
          let name = transitRoute || "Bus Route";
          let totalTimeText = transitEl.textContent.trim();
          
          // Helper functions to do time math
          function timeToMinutes(t) {
            let m = 0;
            const hrMatch = t.match(/(\d+)\s*(hr|hour|h)/i);
            if (hrMatch) m += parseInt(hrMatch[1], 10) * 60;
            const minMatch = t.match(/(\d+)\s*min/i);
            if (minMatch) m += parseInt(minMatch[1], 10);
            return m;
          }
          function minutesToTime(m) {
            if (m < 60) return m + " min";
            const h = Math.floor(m / 60);
            const mins = m % 60;
            return mins > 0 ? `${h} hr ${mins} min` : `${h} hr`;
          }

          let totalMins = timeToMinutes(totalTimeText);
          
          // Find walk time from the card summary
          let walkMins = 0;
          const walkIcons = selectedCard.querySelectorAll('[aria-label="Walking"]');
          for (const icon of walkIcons) {
            const parent = icon.parentElement;
            if (parent) {
              const walkText = parent.innerText;
              const wMatch = walkText.match(/(\d+)\s*min/i);
              if (wMatch) {
                walkMins += parseInt(wMatch[1], 10);
              }
            }
          }
          
          // Pure bus travel time
          let busMins = totalMins - walkMins;
          if (busMins < 0) busMins = totalMins; // fallback safety
          
          let finalTime = minutesToTime(busMins);
          
          return { time: finalTime, dist: transitDist, routeName: name };
        }
      }

      // Attempt to find a route that matches our keywords
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
          
          // Save the very first valid route as a fallback
          if (!fallbackMatch) fallbackMatch = resultObj;
          
          // If we have keywords, check if this route's name matches ANY keyword
          if (keywords.length > 0 && expectedLower !== "") {
             const nameLower = routeName.toLowerCase();
             const isMatch = keywords.some(kw => nameLower.includes(kw));
             if (isMatch) {
                bestMatch = resultObj;
                break; // Found our exact road!
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

      const bodyWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = bodyWalker.nextNode())) {
        const t = node.textContent?.trim();
        if (!t || !isTimeText(t)) continue;
        const parent = node.parentElement;
        if (!parent) continue;
        const style = window.getComputedStyle(parent);
        if (style.display !== "none" && style.visibility !== "hidden") {
          return { time: t, dist: null, routeName: "Unknown" };
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

    // -- Take a screenshot for visual verification --
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

// Helper to set "Depart at" time on Google Maps
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
      
      let busRaw = null;
      try {
        // 2. Fetch Bus data — STRICLY ORIGIN TO DESTINATION ONLY (No Middle Locations)
        const busUrl = buildBusTransitUrl(route);
        await page.goto(busUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForSelector('.MespJc, button[aria-label*="transit"], [data-value="transit"]', { timeout: 6000 }).catch(() => {});
        
        try {
          await page.evaluate(() => {
            const t = Array.from(document.querySelectorAll('button')).find(b => (b.getAttribute('aria-label')||'').toLowerCase().includes('transit') || (b.getAttribute('data-value')||'')==='transit');
            if (t) t.click();
          });
        } catch (e) {}
        await new Promise(r => setTimeout(r, 800));
        
        // Apply Google Maps Route Options (Prefer Bus, Fewer transfers)
        await applyTransitOptions(page);
        
        const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        let h = nowIST.getHours();
        let m = nowIST.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        const currentTimeStr = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
        const targetSlotTime = getClosestTargetSlot(currentTimeStr);
        log(`      📅 Adjusting Google Maps 'Depart at' to closest target slot: ${targetSlotTime}`);
        
        await setDepartAtTime(page, targetSlotTime);
        const timeAttempts = [targetSlotTime];

        for (const tryTime of timeAttempts) {
          const prefBuses = route.preferredBuses || [];
          const roadLabel = route.label || '';
          const carRouteName = carData.routeName || '';
          const currentRouteId = route.id;
          const res = await page.evaluate((prefBuses, roadLabel, carRouteName, routeId) => {
            function timeToMin(s) {
              let m = 0;
              const h = s.match(/(\d+)\s*(hr|hour|h)/i); if (h) m += parseInt(h[1]) * 60;
              const mn = s.match(/(\d+)\s*min/i); if (mn) m += parseInt(mn[1]);
              return m || null;
            }
            let bestCard = null;
            const cardsRaw = Array.from(document.querySelectorAll('.MespJc'));
            const clean = (str) => (str || '').toLowerCase().replace(/[\s\-\._]/g, '');
            
            const isMetroOrTrain = (cardEl) => {
              const txt = (cardEl.innerText || '').toLowerCase();
              if (/blue line|green line|purple line|orange line|local train|ferry|vessel|tram/i.test(txt)) return true;
              const ariaEls = cardEl.querySelectorAll('[aria-label*="Metro"], [aria-label*="Train"], [aria-label*="Subway"], [class*="train"], [class*="subway"], [class*="metro"]');
              return ariaEls.length > 0;
            };

            const isWalkOnlyCard = (cardEl) => {
              const txt = (cardEl.innerText || '').toLowerCase();
              if (txt.includes('via ')) return true;
              
              const hasBusImg = Array.from(cardEl.querySelectorAll('img')).some(i => (i.getAttribute('alt') || i.getAttribute('src') || '').toLowerCase().includes('bus'));
              const hasBusAria = cardEl.querySelector('[aria-label*="Bus"], [aria-label*="bus"]') !== null;
              const hasBusBadge = cardEl.querySelector('.ivN21e, [class*="badge"], span[style*="background-color"]') !== null;
              
              if (!hasBusImg && !hasBusAria && !hasBusBadge) {
                return true;
              }
              if (txt.includes('') && !hasBusImg && !hasBusBadge) {
                return true;
              }
              return false;
            };

            const validCards = cardsRaw.filter(c => !isMetroOrTrain(c));
            const busOnlyCards = validCards.filter(c => !isWalkOnlyCard(c));
            if (busOnlyCards.length === 0) {
              return null; // NEVER return walking cards
            }
            const cards = busOnlyCards;
            
            let scoredCards = [];
            for (const card of cards) {
              const txt = card.innerText || '';
              let timeMin = 999;
              const h = txt.match(/(\d+)\s*(?:hr|hour|h)/i);
              let totalM = 0;
              if (h) totalM += parseInt(h[1], 10) * 60;
              const mn = txt.match(/(\d+)\s*min/i);
              if (mn) totalM += parseInt(mn[1], 10);
              if (totalM > 0) timeMin = totalM;

              const badgeEls = card.querySelectorAll('[class*="fontBodyMedium"] span, .ivN21e span, [class*="badge"], span[style*="background"], span');
              let busNums = Array.from(badgeEls).map(el => el.textContent.trim()).filter(t => t.length > 0 && t.length < 15 && !/min|hr|:|km|walk|from|to||every/i.test(t));
              busNums = [...new Set(busNums)];
              const transferCount = Math.max(0, busNums.length - 1);

              let walkMin = 0;
              const walkMatch = txt.match(/walk\s*(\d+)\s*min/i) || txt.match(/(\d+)\s*min\s*(?:walk|)/i) || txt.match(/\s*(\d+)\s*min/i);
              if (walkMatch) walkMin = parseInt(walkMatch[1], 10);

              let score = 100000 - (timeMin * 10) - (transferCount * 5000) - (walkMin * 25);
              
              if (prefBuses && prefBuses.length > 0 && prefBuses.some(pb => txt.toUpperCase().includes(pb.toUpperCase()))) {
                score += 50000;
              }

              scoredCards.push({ card, score, transferCount, timeMin, txt });
            }

            if (routeId === "M13") {
              scoredCards.sort((a, b) => {
                const aHas221 = a.txt.includes("221") ? 1 : 0;
                const bHas221 = b.txt.includes("221") ? 1 : 0;
                if (aHas221 !== bHas221) return bHas221 - aHas221;
                return a.timeMin - b.timeMin;
              });
            } else if (routeId === "M22") {
              scoredCards.sort((a, b) => {
                const aHas = a.txt.includes("s-22") || a.txt.includes("s22") ? 1 : 0;
                const bHas = b.txt.includes("s-22") || b.txt.includes("s22") ? 1 : 0;
                if (aHas !== bHas) return bHas - aHas;
                return a.timeMin - b.timeMin;
              });
            } else {
              scoredCards.sort((a, b) => b.score - a.score);
            }

            if (scoredCards.length > 0) {
              bestCard = scoredCards[0].card;
            }
            
            if (bestCard) {
              if (isWalkOnlyCard(bestCard)) {
                return null;
              }
              const timeEl = bestCard.querySelector('.Fk3sm, [class*="fontHeadlineSmall"]');
              const timeRaw = timeEl ? timeEl.textContent.trim() : null;
              const distEl = Array.from(bestCard.querySelectorAll('div,span')).find(el => el.textContent.includes('km') || el.textContent.includes(' m'));
              const distM = distEl ? distEl.textContent.match(/[\d.]+\s*(km|m)/i) : null;
              const numEls = bestCard.querySelectorAll('[class*="fontBodyMedium"] span, .ivN21e span, [class*="badge"], [class*="transit"]');
              let busNums = Array.from(numEls).map(el => el.textContent.trim()).filter(t => t.length > 0 && t.length < 15 && !/min|hr|:|km|walk|/i.test(t)).join(', ');
              if (!busNums || busNums.trim() === '' || busNums === '') {
                const parts = bestCard.innerText.split('\n').map(s => s.trim()).filter(s => s.length > 0 && !/min|hr|km|m$|walk||•|details|preview|every|from|to/i.test(s));
                busNums = parts.slice(0, 2).join(', ');
              }
              if (!busNums || busNums.trim() === '') busNums = "Matched Bus Route";
              const walkMatch = bestCard.innerText.match(/(?:|walk)\s*(\d+)\s*min/i);
              const walkTime = walkMatch ? walkMatch[1] + " min" : "0 min";
              const rawDetails = bestCard.innerText;
              bestCard.click();
              return { timeRaw, timeMin: timeToMin(timeRaw), distRaw: distM ? distM[0] : null, routeName: busNums, walkTime, rawDetails, exactMatch: true };
            }
            return null;
          }, prefBuses, roadLabel, carRouteName, currentRouteId);

          if (res) {
            busRaw = res;
            log(`      ✅ Found matching bus [${busRaw.routeName}] at Depart at [${tryTime}]`);
            break;
          }
        }

        // Robust Fallback: If Depart at returned no genuine bus, grab the active bus route directly from live timetable
        if (!busRaw) {
          try {
            await page.goto(busUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
            await page.waitForSelector('.MespJc', { timeout: 8000 }).catch(() => {});
            const prefBuses = route.preferredBuses || [];
            const roadLabel = route.label || '';
            const carRouteName = carData.routeName || '';
            const currentRouteId = route.id;
            const fallbackRes = await page.evaluate((prefBuses, roadLabel, carRouteName, routeId) => {
              function timeToMin(s) {
                let m = 0;
                const h = s.match(/(\d+)\s*(hr|hour|h)/i); if (h) m += parseInt(h[1]) * 60;
                const mn = s.match(/(\d+)\s*min/i); if (mn) m += parseInt(mn[1]);
                return m || null;
              }
              const isMetroOrTrain = (cardEl) => {
                const txt = (cardEl.innerText || '').toLowerCase();
                if (/blue line|green line|purple line|orange line|local train|ferry|vessel|tram/i.test(txt)) return true;
                const ariaEls = cardEl.querySelectorAll('[aria-label*="Metro"], [aria-label*="Train"], [aria-label*="Subway"], [class*="train"], [class*="subway"], [class*="metro"]');
                return ariaEls.length > 0;
              };
              const isWalkOnlyCard = (cardEl) => {
                const txt = (cardEl.innerText || '').toLowerCase();
                if (txt.includes('via ')) return true;
                const hasBusImg = Array.from(cardEl.querySelectorAll('img')).some(i => (i.getAttribute('alt') || i.getAttribute('src') || '').toLowerCase().includes('bus'));
                const hasBusAria = cardEl.querySelector('[aria-label*="Bus"], [aria-label*="bus"]') !== null;
                const hasBusBadge = cardEl.querySelector('.ivN21e, [class*="badge"], span[style*="background-color"]') !== null;
                if (!hasBusImg && !hasBusAria && !hasBusBadge) return true;
                if (txt.includes('') && !hasBusImg && !hasBusBadge) return true;
                return false;
              };
              const cardsRaw = Array.from(document.querySelectorAll('.MespJc'));
              const validCards = cardsRaw.filter(c => !isMetroOrTrain(c));
              const busOnlyCards = validCards.filter(c => !isWalkOnlyCard(c));
              if (busOnlyCards.length > 0) {
                const bestCard = busOnlyCards[0];
                const timeEl = bestCard.querySelector('.Fk3sm, [class*="fontHeadlineSmall"]');
                const timeRaw = timeEl ? timeEl.textContent.trim() : null;
                const distEl = Array.from(bestCard.querySelectorAll('div,span')).find(el => el.textContent.includes('km') || el.textContent.includes(' m'));
                const distM = distEl ? distEl.textContent.match(/[\d.]+\s*(km|m)/i) : null;
                const numEls = bestCard.querySelectorAll('[class*="fontBodyMedium"] span, .ivN21e span, [class*="badge"], [class*="transit"]');
                let busNums = Array.from(numEls).map(el => el.textContent.trim()).filter(t => t.length > 0 && t.length < 15 && !/min|hr|:|km|walk|/i.test(t)).join(', ');
                if (!busNums || busNums.trim() === '' || busNums === '') {
                  const parts = bestCard.innerText.split('\n').map(s => s.trim()).filter(s => s.length > 0 && !/min|hr|km|m$|walk||•|details|preview|every|from|to/i.test(s));
                  busNums = parts.slice(0, 2).join(', ');
                }
                if (!busNums || busNums.trim() === '') busNums = "Matched Bus Route";
                const walkMatch = bestCard.innerText.match(/(?:|walk)\s*(\d+)\s*min/i);
                const walkTime = walkMatch ? walkMatch[1] + " min" : "0 min";
                const rawDetails = bestCard.innerText;
                bestCard.click();
                return { timeRaw, timeMin: timeToMin(timeRaw), distRaw: distM ? distM[0] : null, routeName: busNums, walkTime, rawDetails, exactMatch: true };
              }
              return null;
            }, prefBuses, roadLabel, carRouteName, currentRouteId);

            if (fallbackRes) {
              busRaw = fallbackRes;
              log(`      ✅ Found active bus route [${busRaw.routeName}] (Live Transit Timetable)`);
            }
          } catch (e) {}
        }
      } catch(e) {}

      if (busRaw) {
        await new Promise(r => setTimeout(r, 800));
      }

      const busData = {
        timeMin:  busRaw ? busRaw.timeMin  : null,
        timeRaw:  busRaw ? busRaw.timeRaw  : null,
        distRaw:  (busRaw && busRaw.distRaw) ? busRaw.distRaw : carData.distRaw || null,
        routeName: busRaw ? busRaw.routeName : '',
        walkTime: busRaw ? busRaw.walkTime : '',
        rawDetails: busRaw ? busRaw.rawDetails : 'N/A',
        exactMatch: busRaw ? busRaw.exactMatch : false
      };
      if (carData.distRaw) busData.distRaw = carData.distRaw;
      const busImgPath = await saveRouteScreenshot(page, route, "bus");

      await new Promise(r => setTimeout(r, 600));
      
      // 3. Fetch Bike data
      const bikeUrl = buildMapsUrl(route, "bike");
      const bikeData = (await extractTravelData(page, bikeUrl, "bike", route)) || {};
      if (carData.distRaw) bikeData.distRaw = carData.distRaw;
      
      // 4. Calculate Reason if Bus is faster than Car or Bike
      let busAdvantageReason = "";
      if (busData.timeMin) {
        const busFasterThanCar = carData.timeMin && busData.timeMin < carData.timeMin;
        const busFasterThanBike = bikeData.timeMin && busData.timeMin < bikeData.timeMin;
        
        if (busFasterThanCar || busFasterThanBike) {
          const reasons = [];
          
          if (busData.walkTime === "0 min" || !busData.walkTime) {
            reasons.push("0 Min Walk Time (Direct Boarding)");
          }
          if (busData.routeName && !busData.routeName.includes(",")) {
            reasons.push("Direct Route (No Transfers)");
          }
          if (carData.trafficCondition && (carData.trafficCondition.includes("Heavy") || carData.trafficCondition.includes("Red"))) {
            reasons.push("Heavy Car Traffic Route");
          }
          
          if (reasons.length > 0) {
            busAdvantageReason = reasons.join(" + ");
          } else {
            busAdvantageReason = "More direct path or faster lane access";
          }
        }
      }

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
        busTimeRaw: busData.timeRaw,
        busTimeMin: busData.timeMin,
        busDistRaw: busData.distRaw,
        busRoute: busData.routeName || "",
        busWalkTime: busData.walkTime || "",
        rawDetails: busData.rawDetails || "",
        busReason: busAdvantageReason,
        busExactMatch: busData.exactMatch,
        bikeTimeRaw: bikeData.timeRaw,
        bikeTimeMin: bikeData.timeMin,
        bikeDistRaw: bikeData.distRaw,
        bikeRoute: bikeData.routeName || "",
        timeSlot: slotLabel(),
        carImagePath: carData.imagePath,
        bikeImagePath: bikeData.imagePath,
        busImagePath: busImgPath
      };
      
      results.push(resultObj);

      log(`  🚙 Car: ${carData.timeRaw || "N/A"} (${carData.timeMin || "?"} min) | dist: ${carData.distRaw || "?"} | traffic: ${carData.trafficCondition || "?"}`);
      log(`  🚌 Bus: ${busData.timeRaw || "N/A"} (${busData.timeMin || "?"} min) | dist: ${busData.distRaw || "?"}`);
      log(`  🛵 Bike: ${bikeData.timeRaw || "N/A"} (${bikeData.timeMin || "?"} min) | dist: ${bikeData.distRaw || "?"}`);

      await new Promise(r => setTimeout(r, 800));
    }

    log(`\nSession complete! Saving to Excel...`);
    await saveExcel(results, outDir);

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
  const xlsxFile = path.join(outDir, `Kolkata_Traffic_Data_${fileDate}.xlsx`);
  
  let wb = new ExcelJS.Workbook();
  if (fs.existsSync(xlsxFile)) {
    try { await wb.xlsx.readFile(xlsxFile); } catch { wb = new ExcelJS.Workbook(); }
  }

  // Get current slot from the first result
  const currentSlot = results[0].timeSlot || "Data_Run"; 
  const generalSlot = getGeneralSlotName(currentSlot);
  const sheetName = generalSlot.replace(/[:\/]/g, "_"); // e.g. "10_00 AM"

  // Fetch existing sheet or create it
  let sheet = wb.getWorksheet(sheetName);
  if (!sheet) {
    sheet = wb.addWorksheet(sheetName);
    
    // Create Header
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
    
    // Seed 40 placeholders exactly in ROUTES order
    for (const r of ROUTES) {
      sheet.addRow([r.id, r.section, r.label, currentSlot, getPeakClassification(generalSlot), "N/A", "", "N/A", "N/A", "", "N/A", "N/A", "N/A", "", "", 0, "N/A", "N/A", "N/A", "", "", "", "", ""]);
    }
  }

  // Iterate exactly by scraping results and push them directly to their strictly indexed row
  for (const rData of results) {
    const routeIndex = ROUTES.findIndex(r => r.id === rData.routeId);
    if (routeIndex === -1) continue;
    
    const r = ROUTES[routeIndex];
    const targetRowNumber = routeIndex + 2; // header is row 1
    const addedRow = sheet.getRow(targetRowNumber);
    
    const distVal = rData.carDistRaw || rData.busDistRaw || "N/A";
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
      distVal,
      carMinVal || "",
      calcSpeed(distVal, carMinVal),
      distVal,
      bikeMinVal || "",
      calcSpeed(distVal, bikeMinVal),
      calcBikeDiff(bikeMinVal, carMinVal),
      distVal,
      busMinVal || "",
      inVehVal || "",
      walkMinVal || 0,
      calcSpeed(distVal, busMinVal),
      rData.busRoute || "N/A",
      rData.rawDetails || "N/A",
      calcTransitRatio(busMinVal, carMinVal),
      `Walk: ${rData.busWalkTime || "N/A"}`,
      rData.busReason || "",
      "", // Car Image
      "", // Bike Image
      ""  // Bus Image
    ];
    
    // Embed images if captured
   // Images are saved in output/screenshots folder to keep Excel lightweight (<1MB)
    /*
    const imagesToEmbed = [rData.carImagePath, rData.bikeImagePath, rData.busImagePath];
    */

    // Color-code Car Time based on traffic
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

    // Highlight discrepancies
    if (rData.busReason && (rData.busReason.includes("⚠️") || rData.busReason.includes("DISCREPANCY") || rData.busReason.includes("ANOMALY"))) {
      const reasonCell = addedRow.getCell(21);
      reasonCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC000" } };
      reasonCell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF9C0006" } };
    }
  }

  // ─── STYLING & FORMATTING ──────────────────────────────────────────────────
  sheet.views = [{ state: 'frozen', ySplit: 1 }]; // Freeze the header row
  
  // Set Image Column Widths
  sheet.getColumn(22).width = 60;
  sheet.getColumn(23).width = 60;
  sheet.getColumn(24).width = 60;
  
  // Make the spreadsheet highly interactive
  sheet.autoFilter = {
    from: 'A1',
    to: sheet.getColumn(sheet.columnCount).letter + '1'
  };
  
  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' } // Modern Dark Navy
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

  // Style data rows
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    row.height = 20;
    const isEven = r % 2 === 0;
    const defaultBg = isEven ? 'F9FAFB' : 'FFFFFF'; // Elegant off-white stripe
    
    row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      // Set default font properties
      cell.font = cell.font || {};
      cell.font.name = 'Segoe UI';
      cell.font.size = cell.font.size || 10;
      if (!cell.font.color) cell.font.color = { argb: '333333' }; // Softer text color
      
      // Zebra striping for columns 1-5 and route names columns (c2, c4, etc.)
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
      
      // Borders
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
      
      // Alignments
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
      
      // Formatting for warnings
      const cellText = String(cell.value || '');
      if (cellText.includes('[METRO USED!]')) {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'C00000' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } };
      }
    });
  }

  // Adjust column widths automatically
  sheet.columns.forEach((col, colIdx) => {
    let maxLen = 12;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const val = String(cell.value || '');
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(maxLen + 4, 45); // Pad and cap at 45
  });

  // Enforce specific base column widths
  sheet.getColumn(1).width = 10; // Route ID
  sheet.getColumn(2).width = 12; // Category
  sheet.getColumn(3).width = 40; // Route Name

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
    // UTC offsets
    cron.schedule("30 18 * * *", () => runFetchSession("12:00 AM IST")); // 00:00 IST -> 18:30 UTC
    cron.schedule("30 4 * * *", () => runFetchSession("10:00 AM IST"));  // 10:00 IST -> 04:30 UTC
    cron.schedule("30 7 * * *", () => runFetchSession("1:00 PM IST"));   // 13:00 IST -> 07:30 UTC
    cron.schedule("30 13 * * *", () => runFetchSession("7:00 PM IST"));  // 19:00 IST -> 13:30 UTC
  }
}

if (require.main === module) {
  const arg = process.argv[2];
  if (arg === "schedule") {
    startScheduler();
  } else if (arg === "test") {
    log("Running TEST with first 2 routes...");
    ROUTES.splice(2); // Keep only first 2 routes for test
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
