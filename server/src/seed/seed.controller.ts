import { Controller, HttpCode, Post } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const L = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;

const ROASTERS: { name: string; location?: string; logoUrl?: string }[] = [
  // North America
  {
    name: 'Intelligentsia Coffee',
    location: 'Chicago, IL, US',
    logoUrl: L('intelligentsia.com'),
  },
  {
    name: 'Blue Bottle Coffee',
    location: 'Oakland, CA, US',
    logoUrl: L('bluebottlecoffee.com'),
  },
  {
    name: 'Stumptown Coffee Roasters',
    location: 'Portland, OR, US',
    logoUrl: L('stumptowncoffee.com'),
  },
  {
    name: 'Counter Culture Coffee',
    location: 'Durham, NC, US',
    logoUrl: L('counterculturecoffee.com'),
  },
  {
    name: 'Verve Coffee Roasters',
    location: 'Santa Cruz, CA, US',
    logoUrl: L('vervecoffee.com'),
  },
  {
    name: 'Ritual Coffee Roasters',
    location: 'San Francisco, CA, US',
    logoUrl: L('ritualcoffee.com'),
  },
  {
    name: 'Sightglass Coffee',
    location: 'San Francisco, CA, US',
    logoUrl: L('sightglasscoffee.com'),
  },
  {
    name: 'Equator Coffees',
    location: 'San Rafael, CA, US',
    logoUrl: L('equatorcoffees.com'),
  },
  {
    name: 'Coava Coffee Roasters',
    location: 'Portland, OR, US',
    logoUrl: L('coavacoffee.com'),
  },
  {
    name: 'Heart Coffee Roasters',
    location: 'Portland, OR, US',
    logoUrl: L('heartroasters.com'),
  },
  {
    name: 'George Howell Coffee',
    location: 'Acton, MA, US',
    logoUrl: L('georgehowellcoffee.com'),
  },
  {
    name: 'La Colombe Coffee Roasters',
    location: 'Philadelphia, PA, US',
    logoUrl: L('lacolombe.com'),
  },
  {
    name: 'Onyx Coffee Lab',
    location: 'Bentonville, AR, US',
    logoUrl: L('onyxcoffeelab.com'),
  },
  {
    name: 'Madcap Coffee',
    location: 'Grand Rapids, MI, US',
    logoUrl: L('madcapcoffee.com'),
  },
  {
    name: 'Metric Coffee Co.',
    location: 'Chicago, IL, US',
    logoUrl: L('metriccoffee.com'),
  },
  {
    name: 'Passenger Coffee',
    location: 'Lancaster, PA, US',
    logoUrl: L('passengercoffee.com'),
  },
  {
    name: 'Ruby Coffee Roasters',
    location: 'Nelsonville, WI, US',
    logoUrl: L('rubycoffeeroasters.com'),
  },
  {
    name: 'Colectivo Coffee',
    location: 'Milwaukee, WI, US',
    logoUrl: L('colectivocoffee.com'),
  },
  {
    name: 'Kickapoo Coffee Roasters',
    location: 'Viroqua, WI, US',
    logoUrl: L('kickapoocoffee.com'),
  },
  { name: 'JBC Coffee Roasters', location: 'Madison, WI, US' },
  {
    name: 'Stone Creek Coffee',
    location: 'Milwaukee, WI, US',
    logoUrl: L('stonecreekcoffee.com'),
  },
  { name: 'Valentine Coffee', location: 'Milwaukee, WI, US' },
  {
    name: 'Wrecking Ball Coffee Roasters',
    location: 'San Francisco, CA, US',
    logoUrl: L('wreckingballcoffee.com'),
  },
  {
    name: 'Chromatic Coffee',
    location: 'San Jose, CA, US',
    logoUrl: L('chromaticcoffee.com'),
  },
  {
    name: 'Temple Coffee Roasters',
    location: 'Sacramento, CA, US',
    logoUrl: L('templecoffee.com'),
  },
  {
    name: 'Kuma Coffee',
    location: 'Seattle, WA, US',
    logoUrl: L('kumacoffee.com'),
  },
  {
    name: 'Olympia Coffee Roasting',
    location: 'Olympia, WA, US',
    logoUrl: L('olympiacoffee.com'),
  },
  {
    name: 'Brandywine Coffee Roasters',
    location: 'Wilmington, DE, US',
    logoUrl: L('brandywinecoffeeroasters.com'),
  },
  { name: 'Portrait Coffee', location: 'Atlanta, GA, US' },
  { name: 'Conduit Coffee', location: 'Nashville, TN, US' },
  {
    name: 'Case Study Coffee',
    location: 'Portland, OR, US',
    logoUrl: L('casestudycoffee.com'),
  },
  { name: 'Public Domain Coffee', location: 'Portland, OR, US' },
  {
    name: 'Proud Mary Coffee',
    location: 'Portland, OR, US',
    logoUrl: L('proudmarycoffee.com'),
  },
  {
    name: 'Herkimer Coffee',
    location: 'Seattle, WA, US',
    logoUrl: L('herkimercoffee.com'),
  },
  { name: 'Broadcast Coffee', location: 'Seattle, WA, US' },
  { name: 'Slate Coffee Roasters', location: 'Seattle, WA, US' },
  {
    name: 'Anchorhead Coffee',
    location: 'Seattle, WA, US',
    logoUrl: L('anchorheadcoffee.com'),
  },
  {
    name: 'Victrola Coffee Roasters',
    location: 'Seattle, WA, US',
    logoUrl: L('victrolacoffee.com'),
  },
  {
    name: 'Caffe Vita',
    location: 'Seattle, WA, US',
    logoUrl: L('caffevita.com'),
  },
  {
    name: 'Zoka Coffee',
    location: 'Seattle, WA, US',
    logoUrl: L('zokacoffee.com'),
  },
  {
    name: 'Nossa Familia Coffee',
    location: 'Portland, OR, US',
    logoUrl: L('nossafamilia.com'),
  },
  {
    name: 'Water Avenue Coffee',
    location: 'Portland, OR, US',
    logoUrl: L('wateravenuecoffee.com'),
  },
  { name: 'Lighthouse Roasters', location: 'Seattle, WA, US' },
  { name: 'Velton Coffee Roasting', location: 'Everett, WA, US' },
  {
    name: 'Vivace Espresso',
    location: 'Seattle, WA, US',
    logoUrl: L('espressovivace.com'),
  },
  {
    name: 'Bird Rock Coffee Roasters',
    location: 'San Diego, CA, US',
    logoUrl: L('birdrockcoffee.com'),
  },
  {
    name: 'Panther Coffee',
    location: 'Miami, FL, US',
    logoUrl: L('panthercoffee.com'),
  },
  {
    name: 'Methodical Coffee',
    location: 'Greenville, SC, US',
    logoUrl: L('methodicalcoffee.com'),
  },
  {
    name: 'Spyhouse Coffee Roasters',
    location: 'Minneapolis, MN, US',
    logoUrl: L('spyhousecoffee.com'),
  },
  {
    name: 'Quills Coffee',
    location: 'Louisville, KY, US',
    logoUrl: L('quillscoffee.com'),
  },
  // Europe
  {
    name: 'Square Mile Coffee Roasters',
    location: 'London, GB',
    logoUrl: L('squaremilelondon.com'),
  },
  {
    name: 'Workshop Coffee',
    location: 'London, GB',
    logoUrl: L('workshopcoffee.com'),
  },
  {
    name: 'Monmouth Coffee Company',
    location: 'London, GB',
    logoUrl: L('monmouthcoffee.co.uk'),
  },
  {
    name: 'Has Bean Coffee',
    location: 'Stafford, GB',
    logoUrl: L('hasbean.co.uk'),
  },
  {
    name: 'Origin Coffee Roasting',
    location: 'Helston, GB',
    logoUrl: L('origincoffee.co.uk'),
  },
  {
    name: 'Caravan Coffee Roasters',
    location: 'London, GB',
    logoUrl: L('caravancoffeeroasters.co.uk'),
  },
  {
    name: 'Notes Coffee Roasters',
    location: 'London, GB',
    logoUrl: L('notescoffee.com'),
  },
  {
    name: 'Assembly Coffee',
    location: 'London, GB',
    logoUrl: L('assemblycoffee.co.uk'),
  },
  {
    name: 'Allpress Espresso',
    location: 'London, GB',
    logoUrl: L('allpressespresso.com'),
  },
  {
    name: 'Ozone Coffee Roasters',
    location: 'London, GB',
    logoUrl: L('ozonecoffee.co.uk'),
  },
  { name: 'WatchHouse', location: 'London, GB', logoUrl: L('watchhouse.com') },
  { name: 'The Barn', location: 'Berlin, DE', logoUrl: L('the-barn.de') },
  {
    name: 'Bonanza Coffee',
    location: 'Berlin, DE',
    logoUrl: L('bonanzacoffee.de'),
  },
  {
    name: 'Five Elephant',
    location: 'Berlin, DE',
    logoUrl: L('fiveelephant.com'),
  },
  {
    name: 'Tim Wendelboe',
    location: 'Oslo, NO',
    logoUrl: L('timwendelboe.no'),
  },
  {
    name: 'Fuglen Coffee Roasters',
    location: 'Oslo, NO',
    logoUrl: L('fuglen.com'),
  },
  { name: 'Kaffa Roastery', location: 'Helsinki, FI', logoUrl: L('kaffa.fi') },
  {
    name: 'Drop Coffee Roasters',
    location: 'Stockholm, SE',
    logoUrl: L('dropcoffee.com'),
  },
  {
    name: 'Koppi Roasters',
    location: 'Helsingborg, SE',
    logoUrl: L('koppi.se'),
  },
  { name: 'Da Matteo', location: 'Gothenburg, SE', logoUrl: L('damatteo.se') },
  {
    name: 'Coutume Café',
    location: 'Paris, FR',
    logoUrl: L('coutumecafe.com'),
  },
  {
    name: 'Terres de Café',
    location: 'Paris, FR',
    logoUrl: L('terresdecafe.com'),
  },
  {
    name: 'Manhattan Coffee Roasters',
    location: 'Rotterdam, NL',
    logoUrl: L('manhattancoffeeroasters.com'),
  },
  { name: 'Friedhats', location: 'Amsterdam, NL', logoUrl: L('friedhats.com') },
  { name: 'Lot Sixty One Coffee Roasters', location: 'Amsterdam, NL' },
  {
    name: 'White Label Coffee',
    location: 'Amsterdam, NL',
    logoUrl: L('whitelabelcoffee.nl'),
  },
  {
    name: 'Gardelli Specialty Coffees',
    location: 'Forlì, IT',
    logoUrl: L('gardelli.it'),
  },
  {
    name: 'Ditta Artigianale',
    location: 'Florence, IT',
    logoUrl: L('dittaartigianale.it'),
  },
  { name: 'Mok Coffee', location: 'Antwerp, BE', logoUrl: L('mokcoffee.be') },
  {
    name: 'Caffenation',
    location: 'Antwerp, BE',
    logoUrl: L('caffenation.be'),
  },
  { name: 'Fjord Coffee Roasters', location: 'Oslo, NO' },
  {
    name: 'Johan & Nyström',
    location: 'Stockholm, SE',
    logoUrl: L('johanochnystrom.se'),
  },
  { name: 'Löfbergs', location: 'Karlstad, SE', logoUrl: L('lofbergs.se') },
  {
    name: 'La Cabra Coffee Roasters',
    location: 'Aarhus, DK',
    logoUrl: L('lacabra.dk'),
  },
  {
    name: 'The Coffee Collective',
    location: 'Copenhagen, DK',
    logoUrl: L('coffeecollective.dk'),
  },
  {
    name: 'April Coffee Roasters',
    location: 'Copenhagen, DK',
    logoUrl: L('aprilcoffee.dk'),
  },
  {
    name: 'Prolog Coffee Bar',
    location: 'Copenhagen, DK',
    logoUrl: L('prologcoffee.dk'),
  },
  { name: 'Kurasu', location: 'Kyoto, JP', logoUrl: L('kurasu.com') },
  {
    name: 'Good Life Coffee',
    location: 'Helsinki, FI',
    logoUrl: L('goodlifecoffee.fi'),
  },
  { name: 'Kaffeina', location: 'Prague, CZ' },
  // Australia / NZ
  {
    name: 'Sample Coffee Roasters',
    location: 'Sydney, AU',
    logoUrl: L('samplecoffee.com.au'),
  },
  { name: 'Single O', location: 'Sydney, AU', logoUrl: L('singleo.com.au') },
  {
    name: "Toby's Estate Coffee",
    location: 'Sydney, AU',
    logoUrl: L('tobysestate.com.au'),
  },
  {
    name: 'Market Lane Coffee',
    location: 'Melbourne, AU',
    logoUrl: L('marketlane.com.au'),
  },
  { name: 'St. Ali', location: 'Melbourne, AU', logoUrl: L('stali.com.au') },
  { name: 'Patricia Coffee Brewers', location: 'Melbourne, AU' },
  {
    name: 'Mecca Coffee',
    location: 'Sydney, AU',
    logoUrl: L('meccacoffee.com.au'),
  },
  {
    name: 'Dukes Coffee Roasters',
    location: 'Melbourne, AU',
    logoUrl: L('dukescoffee.com.au'),
  },
  {
    name: 'Seven Seeds',
    location: 'Melbourne, AU',
    logoUrl: L('sevenseeds.com.au'),
  },
  {
    name: 'Ona Coffee',
    location: 'Canberra, AU',
    logoUrl: L('onacoffee.com.au'),
  },
  // Asia
  {
    name: 'Common Man Coffee Roasters',
    location: 'Singapore, SG',
    logoUrl: L('commonmancoffeeroasters.com'),
  },
  {
    name: 'PPP Coffee',
    location: 'Singapore, SG',
    logoUrl: L('pppcoffee.com'),
  },
  {
    name: 'Nylon Coffee Roasters',
    location: 'Singapore, SG',
    logoUrl: L('nyloncoffee.com'),
  },
  {
    name: 'Arabica % Coffee',
    location: 'Kyoto, JP',
    logoUrl: L('arabica.coffee'),
  },
  {
    name: 'Onibus Coffee',
    location: 'Tokyo, JP',
    logoUrl: L('onibuscoffee.com'),
  },
  {
    name: 'Bear Pond Espresso',
    location: 'Tokyo, JP',
    logoUrl: L('bear-pond.com'),
  },
];

const P = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

const ENTRIES = [
  {
    roaster: 'Onyx Coffee Lab',
    coffee: 'Monarch Blend',
    coffeePhoto: P('monarch-blend'),
    origin: 'Ethiopia / Colombia',
    process: 'Washed / Natural Blend',
    description:
      'A flagship espresso blend combining Ethiopian florals with Colombian sweetness. Designed for consistency and approachability across brew methods.',
    brewMethod: 'Espresso',
    dose: 18,
    waterMl: 36,
    notes: 'Dark chocolate and dried cherry. Incredibly balanced.',
    rating: 4.5,
    photo: 'espresso1',
    user: 'dev',
    flavorNotes: ['Dark Chocolate', 'Cherry', 'Balanced'],
  },
  {
    roaster: 'Square Mile Coffee Roasters',
    coffee: 'Red Brick',
    coffeePhoto: P('red-brick'),
    origin: 'Brazil / Colombia',
    process: 'Natural / Washed Blend',
    description:
      'A dependable house espresso built for milk drinks and straight shots alike. Rich, chocolatey, and forgiving — a workhorse blend roasted to a medium-dark.',
    brewMethod: 'Pour-over',
    dose: 20,
    waterMl: 320,
    notes: 'Milk chocolate, hazelnut, and a gentle sweetness.',
    rating: 4,
    photo: 'pourover1',
    user: 'alice',
    flavorNotes: ['Milk Chocolate', 'Hazelnut', 'Brown Sugar'],
  },
  {
    roaster: 'Heart Coffee Roasters',
    coffee: 'Ethiopia Guji Natural',
    coffeePhoto: P('guji-natural'),
    origin: 'Ethiopia',
    process: 'Natural',
    description:
      'A natural-process single origin from the Guji zone. Intensely fruited with blueberry and rose — the kind of coffee that converts skeptics.',
    brewMethod: 'AeroPress',
    dose: 17,
    waterMl: 220,
    notes: 'Blueberry jam and rose water. Stunning.',
    rating: 5,
    photo: 'aeropress1',
    user: 'bob',
    flavorNotes: ['Blueberry', 'Rose', 'Jasmine'],
  },
  {
    roaster: 'Counter Culture Coffee',
    coffee: 'Hologram',
    coffeePhoto: null,
    origin: 'East Africa Blend',
    process: 'Washed',
    description:
      'A rotating East Africa blend chasing juicy, tea-like clarity. Light-roasted to preserve origin character — bright acidity and a clean finish are the signature.',
    brewMethod: 'Pour-over',
    dose: 22,
    waterMl: 350,
    notes: 'Bright citrus acidity, jasmine finish.',
    rating: 4,
    photo: null,
    user: 'dev',
    flavorNotes: ['Lemon', 'Jasmine', 'Bright'],
  },
  {
    roaster: 'Verve Coffee Roasters',
    coffee: 'Streetlevel Espresso',
    coffeePhoto: P('streetlevel-espresso'),
    origin: 'Guatemala / Brazil',
    process: 'Washed / Natural Blend',
    description:
      "Verve's go-to espresso blend. Guatemalan body and sweetness meets Brazilian nuttiness — caramel-forward and crowd-pleasing at any milk ratio.",
    brewMethod: 'Espresso',
    dose: 19,
    waterMl: 40,
    notes: 'Caramel, nougat, dark fruit.',
    rating: 4.5,
    photo: 'espresso2',
    user: 'alice',
    flavorNotes: ['Caramel', 'Toffee', 'Plum'],
  },
  {
    roaster: 'Tim Wendelboe',
    coffee: 'Finca El Suelo',
    coffeePhoto: P('finca-el-suelo'),
    origin: 'Colombia',
    process: 'Washed',
    description:
      'A washed lot from a single farm in Huila. Tim Wendelboe roasts this to express the terroir with minimal intervention — expect red fruit and delicate acidity.',
    brewMethod: 'Pour-over',
    dose: 12,
    waterMl: 200,
    notes: 'Red grape, bergamot, long sweet finish.',
    rating: 5,
    photo: 'pourover2',
    user: 'dev',
    flavorNotes: ['Raspberry', 'Herbal', 'Clean'],
  },
  {
    roaster: 'Madcap Coffee',
    coffee: 'Ethiopia Buku',
    coffeePhoto: null,
    origin: 'Ethiopia',
    process: 'Washed',
    description:
      'From the Buku washing station in Guji. Washed process brings out honey sweetness and stone fruit clarity — exceptionally clean for the region.',
    brewMethod: 'French Press',
    dose: 30,
    waterMl: 500,
    notes: 'Peach tea, honey, clean and sweet.',
    rating: 4,
    photo: null,
    user: 'bob',
    flavorNotes: ['Peach', 'Honey', 'Clean'],
  },
  {
    roaster: 'Proud Mary Coffee',
    coffee: 'Natural Colombia',
    coffeePhoto: P('natural-colombia'),
    origin: 'Colombia',
    process: 'Natural',
    description:
      'A naturally processed Colombian with a wine-like depth. Proud Mary sources this from small producers in Nariño — tropical and rich with a long finish.',
    brewMethod: 'AeroPress',
    dose: 16,
    waterMl: 200,
    notes: 'Strawberry, wine-like body, tropical finish.',
    rating: 4.5,
    photo: 'aeropress2',
    user: 'alice',
    flavorNotes: ['Strawberry', 'Mango', 'Winey'],
  },
  {
    roaster: 'The Barn',
    coffee: 'Kochere',
    coffeePhoto: P('kochere'),
    origin: 'Ethiopia',
    process: 'Washed',
    description:
      'A washed Yirgacheffe from the Kochere woreda. The Barn roasts it light to keep the terroir intact — lemon curd, white peach, and chamomile.',
    brewMethod: 'Pour-over',
    dose: 14,
    waterMl: 230,
    notes: 'Lemon curd and peach. Delicate florals.',
    rating: 4.5,
    photo: 'pourover3',
    user: 'dev',
    flavorNotes: ['Lemon', 'Peach', 'Chamomile'],
  },
  {
    roaster: 'Ritual Coffee Roasters',
    coffee: 'Las Lajas Perla Negra',
    coffeePhoto: null,
    origin: 'Costa Rica',
    process: 'Black Honey',
    description:
      'A black honey-process lot from the Las Lajas micromill in Sabanilla. Dense, syrupy body with dark fruit and molasses — a standout from Central America.',
    brewMethod: 'Drip',
    dose: 25,
    waterMl: 400,
    notes: 'Dark cherry, molasses, syrupy body.',
    rating: 3.5,
    photo: null,
    user: 'bob',
    flavorNotes: ['Cherry', 'Molasses', 'Creamy'],
  },
  {
    roaster: 'Ruby Coffee Roasters',
    coffee: 'Washed Burundi',
    coffeePhoto: P('washed-burundi'),
    origin: 'Burundi',
    process: 'Washed',
    description:
      'A fully washed lot from the Kayanza region. Ruby highlights the delicate red fruit and silky texture that Burundi is capable of at its best.',
    brewMethod: 'Pour-over',
    dose: 18,
    waterMl: 300,
    notes: 'Black currant, peach, silky mouthfeel.',
    rating: 4,
    photo: 'pourover4',
    user: 'alice',
    flavorNotes: ['Raspberry', 'Peach', 'Juicy'],
  },
  {
    roaster: 'Passenger Coffee',
    coffee: 'Kenya Kiambu',
    coffeePhoto: null,
    origin: 'Kenya',
    process: 'Washed',
    description:
      'SL28 and SL34 varieties from small farms in the Kiambu county. Classic Kenyan profile — bright tomato-like acidity and blackcurrant that mellows beautifully as it cools.',
    brewMethod: 'Pour-over',
    dose: 20,
    waterMl: 320,
    notes: 'Tomato, blackcurrant, sparkling acidity.',
    rating: 4.5,
    photo: null,
    user: 'dev',
    flavorNotes: ['Grapefruit', 'Bright', 'Complex'],
  },
  {
    roaster: 'Workshop Coffee',
    coffee: 'Seasonal Espresso',
    coffeePhoto: P('seasonal-espresso'),
    origin: 'Brazil / Ethiopia',
    process: 'Natural / Washed Blend',
    description:
      'Workshop rotates this blend seasonally, always anchored by a natural Brazilian base with an Ethiopian washed component for lift and berry sweetness.',
    brewMethod: 'Espresso',
    dose: 20,
    waterMl: 42,
    notes: 'Dark chocolate and caramel with berry sweetness.',
    rating: 4,
    photo: 'espresso3',
    user: 'alice',
    flavorNotes: ['Dark Chocolate', 'Caramel', 'Cherry'],
  },
  {
    roaster: 'La Colombe Coffee Roasters',
    coffee: 'Corsica Blend',
    coffeePhoto: null,
    origin: 'Colombia / Ethiopia / Brazil',
    process: 'Washed / Natural Blend',
    description:
      "La Colombe's everyday house blend. Three origins balanced for drip and filter — smooth chocolate backbone with just enough brightness to stay interesting.",
    brewMethod: 'Drip',
    dose: 28,
    waterMl: 450,
    notes: 'Smooth, balanced, great for everyday drinking.',
    rating: 3.5,
    photo: null,
    user: 'bob',
    flavorNotes: ['Chocolate', 'Balanced', 'Clean'],
  },
  {
    roaster: 'Coava Coffee Roasters',
    coffee: 'Guatemala Huehuetenango',
    coffeePhoto: P('huehuetenango'),
    origin: 'Guatemala',
    process: 'Washed',
    description:
      "High-grown washed lot from the Huehuetenango highlands. Coava showcases the region's distinctive malic acidity alongside brown sugar sweetness and a clean finish.",
    brewMethod: 'Pour-over',
    dose: 21,
    waterMl: 340,
    notes: 'Brown sugar, apple, bright malic acidity.',
    rating: 4,
    photo: 'pourover5',
    user: 'dev',
    flavorNotes: ['Apple', 'Brown Sugar', 'Bright'],
  },
  {
    roaster: 'La Cabra Coffee Roasters',
    coffee: 'Ethiopia Yirgacheffe',
    coffeePhoto: P('yirgacheffe'),
    origin: 'Ethiopia',
    process: 'Washed',
    description:
      "A washed Yirgacheffe selected for La Cabra's characteristically delicate style. Jasmine, white peach, and a tea-like finish — one of the most refined Ethiopians in the lineup.",
    brewMethod: 'Pour-over',
    dose: 13,
    waterMl: 210,
    notes: 'Jasmine, peach, beautifully floral.',
    rating: 5,
    photo: 'pourover6',
    user: 'alice',
    flavorNotes: ['Jasmine', 'Peach', 'Orange Blossom'],
  },
  {
    roaster: 'Onibus Coffee',
    coffee: 'Brazil Fazenda Furnas',
    coffeePhoto: null,
    origin: 'Brazil',
    process: 'Pulped Natural',
    description:
      'A natural-process pulped natural from Fazenda Furnas in the Cerrado. Low acidity, full body, and chocolate richness make it ideal for cold brew and milk-based drinks.',
    brewMethod: 'Cold Brew',
    dose: 80,
    waterMl: 700,
    notes: 'Chocolate milk, nutty, great cold body.',
    rating: 4,
    photo: null,
    user: 'bob',
    flavorNotes: ['Milk Chocolate', 'Hazelnut', 'Creamy'],
  },
  {
    roaster: 'George Howell Coffee',
    coffee: 'Terroir Blend',
    coffeePhoto: P('terroir-blend'),
    origin: 'Guatemala / Ethiopia',
    process: 'Washed / Natural Blend',
    description:
      "George Howell's rotating terroir blend, built to showcase how origin character survives blending. Guatemalan structure underpins an Ethiopian top note — complex and evolving in the cup.",
    brewMethod: 'French Press',
    dose: 35,
    waterMl: 560,
    notes: 'Complex and evolving. Nutmeg and dried fig.',
    rating: 4.5,
    photo: null,
    user: 'dev',
    flavorNotes: ['Nutmeg', 'Vanilla', 'Complex'],
  },
  {
    roaster: 'Kaffa Roastery',
    coffee: 'Kenia AA',
    coffeePhoto: P('kenia-aa'),
    origin: 'Kenya',
    process: 'Washed',
    description:
      "AA-grade washed Kenyan from the Nyeri region. Kaffa roasts this to highlight the variety's intense grapefruit acidity and plum-like sweetness without tipping into harsh territory.",
    brewMethod: 'AeroPress',
    dose: 18,
    waterMl: 240,
    notes: 'Grapefruit, red plum, intense and juicy.',
    rating: 4.5,
    photo: 'aeropress3',
    user: 'alice',
    flavorNotes: ['Grapefruit', 'Plum', 'Juicy'],
  },
  {
    roaster: 'April Coffee Roasters',
    coffee: 'Washed Ethiopia Sidama',
    coffeePhoto: P('sidama'),
    origin: 'Ethiopia',
    process: 'Washed',
    description:
      'A precision-roasted washed Sidama from April — roasted extremely light to preserve the delicate florals. Earl Grey, white peach, and a lingering sweetness.',
    brewMethod: 'Pour-over',
    dose: 11,
    waterMl: 185,
    notes: 'White peach, Earl Grey, very delicate.',
    rating: 5,
    photo: 'pourover7',
    user: 'dev',
    flavorNotes: ['Peach', 'Chamomile', 'Herbal'],
  },
];

@Controller('dev/seed')
export class SeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async seed() {
    await this.prisma.commentLike.deleteMany({});
    await this.prisma.comment.deleteMany({});
    await this.prisma.like.deleteMany({});
    await this.prisma.coffeeEntry.deleteMany({});
    await this.prisma.coffee.deleteMany({});
    await this.prisma.roaster.deleteMany({});
    await this.prisma.user.deleteMany({});

    // Create all roasters
    await this.prisma.roaster.createMany({
      data: ROASTERS.map((r) => ({
        name: r.name,
        location: r.location ?? null,
        logoUrl: r.logoUrl ?? null,
      })),
      skipDuplicates: true,
    });
    const roasters = await this.prisma.roaster.findMany();
    const roasterByName = Object.fromEntries(roasters.map((r) => [r.name, r]));

    // Users
    const devHash = await bcrypt.hash('password', 10);
    const dev = await this.prisma.user.create({
      data: {
        name: 'Dev',
        email: 'dev@dev.com',
        passwordHash: devHash,
        photo: 'https://i.pravatar.cc/150?u=dev@dev.com',
      },
    });
    const alice = await this.prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        photo: 'https://i.pravatar.cc/150?u=alice@example.com',
      },
    });
    const bob = await this.prisma.user.create({
      data: {
        name: 'Bob',
        email: 'bob@example.com',
        photo: 'https://i.pravatar.cc/150?u=bob@example.com',
      },
    });
    const userByName: Record<string, typeof dev> = { dev, alice, bob };

    // Entries
    const entries = [];
    for (const e of ENTRIES) {
      const roaster = roasterByName[e.roaster];
      if (!roaster) continue;
      const coffee = await this.prisma.coffee.upsert({
        where: { name_roasterId: { name: e.coffee, roasterId: roaster.id } },
        update: {
          process: e.process ?? null,
          description: e.description ?? null,
          photoUrl: e.coffeePhoto ?? null,
        },
        create: {
          name: e.coffee,
          origin: e.origin,
          process: e.process ?? null,
          description: e.description ?? null,
          photoUrl: e.coffeePhoto ?? null,
          roasterId: roaster.id,
        },
      });
      const entry = await this.prisma.coffeeEntry.create({
        data: {
          roasterId: roaster.id,
          coffeeId: coffee.id,
          origin: e.origin,
          brewMethod: e.brewMethod,
          dose: e.dose,
          waterMl: e.waterMl,
          notes: e.notes,
          rating: e.rating,
          photoUrl: e.photo
            ? `https://picsum.photos/seed/${e.photo}/800/500`
            : null,
          flavorNotes: e.flavorNotes,
          userId: userByName[e.user].id,
        },
      });
      entries.push(entry);
    }

    // Likes
    const likeTargets = entries.slice(0, 10);
    for (const [i, entry] of likeTargets.entries()) {
      const liker = i % 3 === 0 ? alice : i % 3 === 1 ? bob : dev;
      if (liker.id !== entry.userId) {
        await this.prisma.like.create({
          data: { entryId: entry.id, userId: liker.id },
        });
      }
    }

    // Comments
    await this.prisma.comment.create({
      data: {
        entryId: entries[1].id,
        userId: dev.id,
        content: 'What grind size?',
      },
    });
    await this.prisma.comment.create({
      data: { entryId: entries[1].id, userId: bob.id, content: 'Gorgeous!' },
    });
    await this.prisma.comment.create({
      data: {
        entryId: entries[2].id,
        userId: alice.id,
        content: 'That natural process 🤌',
      },
    });
    await this.prisma.comment.create({
      data: {
        entryId: entries[5].id,
        userId: alice.id,
        content: 'Tim Wendelboe never misses',
      },
    });

    return {
      message: 'Seeded',
      roasters: roasters.length,
      entries: entries.length,
    };
  }
}
