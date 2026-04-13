import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url) throw new Error('TURSO_DATABASE_URL is not set')

const adapter = new PrismaLibSql({ url, authToken })
const db = new PrismaClient({ adapter })

const wines = [
  // ── RED ──────────────────────────────────────────────────────────────────
  {
    name: 'Château Margaux',
    variety: 'Cabernet Sauvignon',
    type: 'RED',
    region: 'Bordeaux',
    country: 'France',
    year: 2015,
    description:
      'Deep ruby. Complex nose of blackcurrant, cedar, graphite and violets. Full-bodied on the palate with fine-grained tannins, vibrant acidity and an exceptionally long finish. A classic Left Bank Bordeaux.',
  },
  {
    name: 'Pichon Baron',
    variety: 'Cabernet Sauvignon',
    type: 'RED',
    region: 'Bordeaux',
    country: 'France',
    year: 2016,
    description:
      'Structured and powerful with cassis, tobacco leaf and dark chocolate. A typical Pauillac expression with firm tannins and great ageing potential.',
  },
  {
    name: 'Opus One',
    variety: 'Cabernet Sauvignon',
    type: 'RED',
    region: 'Napa Valley',
    country: 'USA',
    year: 2019,
    description:
      'Plush and expressive. Black cherry, dark plum, mocha and toasty oak. Opulent tannins with a seamless, velvety texture. New World Cabernet at its most refined.',
  },
  {
    name: 'Domaine de la Romanée-Conti La Tâche',
    variety: 'Pinot Noir',
    type: 'RED',
    region: 'Burgundy',
    country: 'France',
    year: 2018,
    description:
      'Ethereal Pinot Noir. Red cherry, rose petal, earth and spice with silky tannins and extraordinary complexity. Among the greatest wines on earth.',
  },
  {
    name: 'Gevrey-Chambertin Vieilles Vignes',
    variety: 'Pinot Noir',
    type: 'RED',
    region: 'Burgundy',
    country: 'France',
    year: 2020,
    description:
      'Bright ruby. Aromas of red cherry, raspberry, forest floor and subtle spice. Medium-bodied with silky tannins and a precise, elegant finish — classic Côte de Nuits.',
  },
  {
    name: 'Penfolds Grange',
    variety: 'Syrah / Shiraz',
    type: 'RED',
    region: 'Barossa Valley',
    country: 'Australia',
    year: 2017,
    description:
      'Iconic Australian Shiraz. Black fruits, dark chocolate, leather and spice. Full-bodied with ripe, chewy tannins and extraordinary depth. Built to age for decades.',
  },
  {
    name: 'Crozes-Hermitage',
    variety: 'Syrah / Shiraz',
    type: 'RED',
    region: 'Rhône Valley',
    country: 'France',
    year: 2019,
    description:
      'Northern Rhône Syrah. Black pepper, smoked meat, olive and blackberry. Medium to full body with firm tannins and a savoury, peppery finish.',
  },
  {
    name: 'Sassicaia',
    variety: 'Cabernet Sauvignon',
    type: 'RED',
    region: 'Tuscany',
    country: 'Italy',
    year: 2018,
    description:
      'The original Super Tuscan. Blackcurrant, cassis, graphite and eucalyptus with firm tannins and great structure. Elegant and age-worthy.',
  },
  {
    name: 'Barolo Cannubi',
    variety: 'Nebbiolo',
    type: 'RED',
    region: 'Piedmont',
    country: 'Italy',
    year: 2016,
    description:
      'King of Italian wines. Dried rose, tar, cherry, truffle and violets. Powerful tannins, high acidity and a finish that lasts minutes. Needs time but rewards patience.',
  },
  {
    name: 'Amarone della Valpolicella',
    variety: 'Blend',
    type: 'RED',
    region: 'Veneto',
    country: 'Italy',
    year: 2015,
    description:
      'Made from dried grapes (Corvina, Rondinella). Rich, full-bodied with dried fig, dark cherry, cocoa and spice. Very high alcohol, velvety tannins and a long, warming finish.',
  },
  {
    name: 'Vega Sicilia Unico',
    variety: 'Tempranillo',
    type: 'RED',
    region: 'Ribera del Duero',
    country: 'Spain',
    year: 2011,
    description:
      "Spain's most prestigious wine. Complex and age-worthy with dried fruit, leather, cedar and spice. Remarkable freshness despite its richness.",
  },
  {
    name: 'Rioja Gran Reserva',
    variety: 'Tempranillo',
    type: 'RED',
    region: 'Rioja',
    country: 'Spain',
    year: 2014,
    description:
      'Classic Rioja aged 5+ years. Dried cherry, vanilla, leather and tobacco from extended oak ageing. Elegant and harmonious with silky tannins.',
  },
  {
    name: 'Catena Zapata Adrianna Vineyard',
    variety: 'Malbec',
    type: 'RED',
    region: 'Mendoza',
    country: 'Argentina',
    year: 2019,
    description:
      'High-altitude Malbec from Gualtallary. Violet, plum, blackberry and dark chocolate with plush tannins and remarkable freshness for the variety.',
  },
  {
    name: 'Château Rayas Châteauneuf-du-Pape',
    variety: 'Grenache',
    type: 'RED',
    region: 'Rhône Valley',
    country: 'France',
    year: 2017,
    description:
      'Pure Grenache from old vines. Raspberry, kirsch, garrigue, lavender and spice with a silky texture and deceptively long, complex finish.',
  },
  {
    name: 'Willamette Valley Pinot Noir',
    variety: 'Pinot Noir',
    type: 'RED',
    region: 'Willamette Valley',
    country: 'USA',
    year: 2021,
    description:
      'Oregon Pinot Noir. Elegant and Burgundy-inspired with red cherry, cranberry, dried herbs and earthy notes. Bright acidity and medium body.',
  },

  // ── WHITE ────────────────────────────────────────────────────────────────
  {
    name: 'Domaine Leflaive Puligny-Montrachet',
    variety: 'Chardonnay',
    type: 'WHITE',
    region: 'Burgundy',
    country: 'France',
    year: 2020,
    description:
      'The benchmark white Burgundy. Lemon curd, hazelnut, white flowers and subtle oak. Laser-precise acidity with a mineral, chalky finish.',
  },
  {
    name: 'Cloudy Bay Sauvignon Blanc',
    variety: 'Sauvignon Blanc',
    type: 'WHITE',
    region: 'Marlborough',
    country: 'New Zealand',
    year: 2022,
    description:
      'The wine that put Marlborough on the map. Passion fruit, gooseberry, cut grass and elderflower. Crisp, refreshing and intensely aromatic.',
  },
  {
    name: 'Sancerre Henri Bourgeois',
    variety: 'Sauvignon Blanc',
    type: 'WHITE',
    region: 'Loire Valley',
    country: 'France',
    year: 2021,
    description:
      'Flinty, mineral Sauvignon from the Loire. Grapefruit, green apple and white flowers with a characteristic smoky, gunflint quality. Crisp and focused.',
  },
  {
    name: 'Trimbach Riesling Clos Sainte Hune',
    variety: 'Riesling',
    type: 'WHITE',
    region: 'Alsace',
    country: 'France',
    year: 2019,
    description:
      'One of the world\'s greatest dry Rieslings. Lime, petrol, white peach and slate minerality. High acidity, bone-dry and extraordinary length.',
  },
  {
    name: 'Egon Müller Scharzhofberger Spätlese',
    variety: 'Riesling',
    type: 'WHITE',
    region: 'Mosel',
    country: 'Germany',
    year: 2020,
    description:
      'Mosel Riesling at its purest. Delicate, off-dry with peach, apricot, lime zest and slate. Feather-light (8% ABV) yet intensely concentrated.',
  },
  {
    name: 'Hugel Gewurztraminer Jubilee',
    variety: 'Gewurztraminer',
    type: 'WHITE',
    region: 'Alsace',
    country: 'France',
    year: 2018,
    description:
      'Immediately recognisable. Lychee, rose, ginger and Turkish delight on the nose. Rich and full-bodied with a slightly spicy, oily texture.',
  },
  {
    name: 'Far Niente Chardonnay',
    variety: 'Chardonnay',
    type: 'WHITE',
    region: 'Napa Valley',
    country: 'USA',
    year: 2021,
    description:
      'Rich, full-bodied Napa Chardonnay. Ripe pear, lemon curd, vanilla and toasty oak with creamy texture from full malolactic fermentation.',
  },
  {
    name: 'Condrieu Guigal',
    variety: 'Viognier',
    type: 'WHITE',
    region: 'Rhône Valley',
    country: 'France',
    year: 2021,
    description:
      'The home of Viognier. Opulent apricot, peach, violet and white blossom. Full-bodied, low acidity and an almost unctuous, aromatic finish.',
  },
  {
    name: 'Domaine Huet Vouvray Sec',
    variety: 'Chenin Blanc',
    type: 'WHITE',
    region: 'Loire Valley',
    country: 'France',
    year: 2019,
    description:
      'Bone-dry Chenin Blanc from the Loire. Quince, beeswax, chamomile and honey with high acidity and a long, complex, almost Burgundian finish.',
  },

  // ── SPARKLING ────────────────────────────────────────────────────────────
  {
    name: 'Krug Grande Cuvée',
    variety: 'Blend',
    type: 'SPARKLING',
    region: 'Champagne',
    country: 'France',
    year: null,
    description:
      'Non-vintage Champagne blended from 120+ wines across 10+ years. Toasted brioche, dried apricot, hazelnut and citrus. Rich, complex and multi-layered.',
  },
  {
    name: 'Ruinart Blanc de Blancs',
    variety: 'Chardonnay',
    type: 'SPARKLING',
    region: 'Champagne',
    country: 'France',
    year: null,
    description:
      'All-Chardonnay Champagne from the oldest Champagne house. Fresh lemon, green apple, chalk and almond. Elegant, precise and wonderfully refreshing.',
  },
  {
    name: 'Billecart-Salmon Rosé',
    variety: 'Pinot Noir',
    type: 'SPARKLING',
    region: 'Champagne',
    country: 'France',
    year: null,
    description:
      'Benchmark rosé Champagne. Pale salmon colour. Delicate red berry, rose petal and brioche with fine, persistent bubbles and a silky, elegant mouthfeel.',
  },
  {
    name: 'Cava Gramona Imperial',
    variety: 'Blend',
    type: 'SPARKLING',
    region: 'Penedès',
    country: 'Spain',
    year: 2018,
    description:
      'Traditional method Spanish sparkling. Macabeo, Xarel·lo and Parellada. Apple, lemon, almonds and toast with fine bubbles and crisp acidity. Great value alternative to Champagne.',
  },

  // ── DESSERT ──────────────────────────────────────────────────────────────
  {
    name: "Château d'Yquem",
    variety: 'Blend',
    type: 'DESSERT',
    region: 'Bordeaux',
    country: 'France',
    year: 2015,
    description:
      'The world\'s greatest sweet wine. Botrytised Sémillon and Sauvignon Blanc. Honey, apricot jam, marmalade, saffron and vanilla cream. Extraordinary concentration and acidity that keeps it fresh for decades.',
  },
  {
    name: 'Egon Müller Scharzhofberger TBA',
    variety: 'Riesling',
    type: 'DESSERT',
    region: 'Mosel',
    country: 'Germany',
    year: 2015,
    description:
      'Trockenbeerenauslese — made from individually selected botrytised grapes. Nectar-like concentration of peach, apricot, honey and noble rot. The most expensive German wine.',
  },
  {
    name: 'Tokaji Aszú 5 Puttonyos Royal Tokaji',
    variety: 'Blend',
    type: 'DESSERT',
    region: 'Tokaj',
    country: 'Hungary',
    year: 2017,
    description:
      'The "wine of kings". Made from botrytised Furmint and Hárslevelű. Apricot, orange peel, honey and dried fruit with a characteristic acidic backbone that prevents cloying sweetness.',
  },

  // ── FORTIFIED ────────────────────────────────────────────────────────────
  {
    name: 'Quinta do Noval Nacional',
    variety: 'Touriga Nacional',
    type: 'FORTIFIED',
    region: 'Douro',
    country: 'Portugal',
    year: 2011,
    description:
      'Legendary Vintage Port from ungrafted pre-phylloxera vines. Dark fruits, chocolate, dried herbs and violets. Powerful, rich and extraordinary complexity.',
  },
  {
    name: "Graham's Tawny 20 Year",
    variety: 'Blend',
    type: 'FORTIFIED',
    region: 'Douro',
    country: 'Portugal',
    year: null,
    description:
      'Aged Tawny Port with 20 years in small oak barrels. Amber-tawny colour. Walnut, dried fig, orange peel and caramel. Nutty and complex with a gentle, warming finish.',
  },
  {
    name: 'González Byass Matusalem Oloroso',
    variety: 'Palomino',
    type: 'FORTIFIED',
    region: 'Jerez',
    country: 'Spain',
    year: null,
    description:
      'Rare, very old Oloroso Sherry. Dark amber, oxidative style with walnut, dried fruit, toffee and leather. Rich and complex with a very long, nutty finish.',
  },
  {
    name: 'Lustau Manzanilla Papirusa',
    variety: 'Palomino',
    type: 'FORTIFIED',
    region: 'Jerez',
    country: 'Spain',
    year: null,
    description:
      'Bone-dry Manzanilla from Sanlúcar de Barrameda. Under flor yeast. Briny, saline character with almonds, green apple and a fresh, tangy finish. A Sherry gateway wine.',
  },
]

async function main() {
  console.log('Seeding WSET Level 2 wine catalog…')

  for (const wine of wines) {
    await db.wine.create({ data: wine })
  }

  const count = await db.wine.count()
  console.log(`Done. ${count} wines in the catalog.`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
