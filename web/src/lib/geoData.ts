/**
 * Geographic data — Asian + major world countries with states and major cities.
 * Ordered: South Asia first (primary audience), then rest of Asia, then world.
 */

export interface GeoCountry {
  code:   string;
  name:   string;
  states: GeoState[];
}

export interface GeoState {
  name:   string;
  cities: string[];
}

export const GEO_DATA: GeoCountry[] = [
  // ── South Asia ────────────────────────────────────────────────────────────
  {
    code: "PK", name: "Pakistan",
    states: [
      { name: "Punjab",           cities: ["Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Sialkot", "Bahawalpur"] },
      { name: "Sindh",            cities: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah"] },
      { name: "Khyber Pakhtunkhwa", cities: ["Peshawar", "Mardan", "Mingora", "Abbottabad", "Kohat"] },
      { name: "Balochistan",      cities: ["Quetta", "Turbat", "Khuzdar", "Hub"] },
      { name: "Azad Kashmir",     cities: ["Muzaffarabad", "Mirpur", "Rawalakot"] },
      { name: "Gilgit-Baltistan", cities: ["Gilgit", "Skardu"] },
      { name: "Islamabad Capital Territory", cities: ["Islamabad"] },
    ],
  },
  {
    code: "IN", name: "India",
    states: [
      { name: "Maharashtra",    cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"] },
      { name: "Delhi",          cities: ["New Delhi", "Delhi"] },
      { name: "Karnataka",      cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"] },
      { name: "Tamil Nadu",     cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"] },
      { name: "West Bengal",    cities: ["Kolkata", "Howrah", "Siliguri", "Asansol"] },
      { name: "Uttar Pradesh",  cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut"] },
      { name: "Gujarat",        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
      { name: "Rajasthan",      cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota"] },
      { name: "Punjab",         cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"] },
      { name: "Haryana",        cities: ["Faridabad", "Gurugram", "Panipat", "Ambala"] },
      { name: "Telangana",      cities: ["Hyderabad", "Warangal", "Nizamabad"] },
      { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur"] },
      { name: "Kerala",         cities: ["Thiruvananthapuram", "Kochi", "Kozhikode"] },
      { name: "Bihar",          cities: ["Patna", "Gaya", "Bhagalpur"] },
      { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur"] },
    ],
  },
  {
    code: "BD", name: "Bangladesh",
    states: [
      { name: "Dhaka Division",     cities: ["Dhaka", "Narayanganj", "Gazipur", "Mymensingh"] },
      { name: "Chittagong Division", cities: ["Chittagong", "Cox's Bazar", "Comilla", "Sylhet"] },
      { name: "Khulna Division",    cities: ["Khulna", "Jessore", "Barisal"] },
      { name: "Rajshahi Division",  cities: ["Rajshahi", "Bogra", "Rangpur"] },
    ],
  },
  {
    code: "LK", name: "Sri Lanka",
    states: [
      { name: "Western Province",  cities: ["Colombo", "Sri Jayawardenepura Kotte", "Negombo"] },
      { name: "Central Province",  cities: ["Kandy", "Nuwara Eliya"] },
      { name: "Southern Province", cities: ["Galle", "Matara"] },
      { name: "Northern Province", cities: ["Jaffna"] },
    ],
  },
  {
    code: "NP", name: "Nepal",
    states: [
      { name: "Bagmati Province",  cities: ["Kathmandu", "Lalitpur", "Bhaktapur"] },
      { name: "Gandaki Province",  cities: ["Pokhara"] },
      { name: "Lumbini Province",  cities: ["Butwal", "Bhairahawa"] },
    ],
  },
  {
    code: "AF", name: "Afghanistan",
    states: [
      { name: "Kabul",      cities: ["Kabul"] },
      { name: "Kandahar",   cities: ["Kandahar"] },
      { name: "Herat",      cities: ["Herat"] },
      { name: "Balkh",      cities: ["Mazar-i-Sharif"] },
    ],
  },
  // ── Middle East ───────────────────────────────────────────────────────────
  {
    code: "SA", name: "Saudi Arabia",
    states: [
      { name: "Riyadh Region",     cities: ["Riyadh"] },
      { name: "Mecca Region",      cities: ["Mecca", "Jeddah", "Taif"] },
      { name: "Medina Region",     cities: ["Medina"] },
      { name: "Eastern Province",  cities: ["Dammam", "Khobar", "Dhahran"] },
    ],
  },
  {
    code: "AE", name: "United Arab Emirates",
    states: [
      { name: "Dubai",       cities: ["Dubai"] },
      { name: "Abu Dhabi",   cities: ["Abu Dhabi", "Al Ain"] },
      { name: "Sharjah",     cities: ["Sharjah"] },
      { name: "Ajman",       cities: ["Ajman"] },
      { name: "Ras Al Khaimah", cities: ["Ras Al Khaimah"] },
    ],
  },
  {
    code: "QA", name: "Qatar",
    states: [
      { name: "Doha",            cities: ["Doha"] },
      { name: "Al Rayyan",       cities: ["Al Rayyan"] },
      { name: "Al Wakrah",       cities: ["Al Wakrah"] },
    ],
  },
  {
    code: "KW", name: "Kuwait",
    states: [
      { name: "Kuwait City",    cities: ["Kuwait City"] },
      { name: "Hawalli",        cities: ["Hawalli", "Salmiya"] },
      { name: "Ahmadi",         cities: ["Ahmadi"] },
    ],
  },
  {
    code: "BH", name: "Bahrain",
    states: [
      { name: "Capital Governorate",  cities: ["Manama"] },
      { name: "Northern Governorate", cities: ["Muharraq"] },
    ],
  },
  {
    code: "OM", name: "Oman",
    states: [
      { name: "Muscat",      cities: ["Muscat"] },
      { name: "Dhofar",      cities: ["Salalah"] },
      { name: "Batinah",     cities: ["Sohar"] },
    ],
  },
  {
    code: "JO", name: "Jordan",
    states: [
      { name: "Amman",     cities: ["Amman"] },
      { name: "Zarqa",     cities: ["Zarqa"] },
      { name: "Irbid",     cities: ["Irbid"] },
    ],
  },
  {
    code: "LB", name: "Lebanon",
    states: [
      { name: "Beirut",        cities: ["Beirut"] },
      { name: "Mount Lebanon", cities: ["Jounieh", "Baabda"] },
      { name: "North Lebanon", cities: ["Tripoli"] },
    ],
  },
  {
    code: "TR", name: "Turkey",
    states: [
      { name: "Istanbul",  cities: ["Istanbul"] },
      { name: "Ankara",    cities: ["Ankara"] },
      { name: "Izmir",     cities: ["Izmir"] },
      { name: "Bursa",     cities: ["Bursa"] },
      { name: "Antalya",   cities: ["Antalya"] },
    ],
  },
  {
    code: "IR", name: "Iran",
    states: [
      { name: "Tehran",        cities: ["Tehran"] },
      { name: "Isfahan",       cities: ["Isfahan"] },
      { name: "Fars",          cities: ["Shiraz"] },
      { name: "Razavi Khorasan", cities: ["Mashhad"] },
    ],
  },
  // ── East & South-East Asia ────────────────────────────────────────────────
  {
    code: "CN", name: "China",
    states: [
      { name: "Beijing",    cities: ["Beijing"] },
      { name: "Shanghai",   cities: ["Shanghai"] },
      { name: "Guangdong",  cities: ["Guangzhou", "Shenzhen", "Dongguan"] },
      { name: "Zhejiang",   cities: ["Hangzhou", "Ningbo"] },
      { name: "Sichuan",    cities: ["Chengdu"] },
    ],
  },
  {
    code: "JP", name: "Japan",
    states: [
      { name: "Tokyo",     cities: ["Tokyo"] },
      { name: "Osaka",     cities: ["Osaka", "Kobe"] },
      { name: "Aichi",     cities: ["Nagoya"] },
      { name: "Hokkaido",  cities: ["Sapporo"] },
      { name: "Fukuoka",   cities: ["Fukuoka"] },
    ],
  },
  {
    code: "MY", name: "Malaysia",
    states: [
      { name: "Kuala Lumpur",  cities: ["Kuala Lumpur"] },
      { name: "Selangor",      cities: ["Shah Alam", "Petaling Jaya", "Klang"] },
      { name: "Penang",        cities: ["Georgetown"] },
      { name: "Johor",         cities: ["Johor Bahru"] },
    ],
  },
  {
    code: "SG", name: "Singapore",
    states: [
      { name: "Central Region",     cities: ["Singapore"] },
      { name: "West Region",        cities: ["Jurong"] },
      { name: "East Region",        cities: ["Tampines", "Pasir Ris"] },
    ],
  },
  {
    code: "ID", name: "Indonesia",
    states: [
      { name: "DKI Jakarta",     cities: ["Jakarta"] },
      { name: "East Java",       cities: ["Surabaya", "Malang"] },
      { name: "West Java",       cities: ["Bandung", "Bogor"] },
      { name: "Bali",            cities: ["Denpasar"] },
    ],
  },
  // ── Europe ────────────────────────────────────────────────────────────────
  {
    code: "GB", name: "United Kingdom",
    states: [
      { name: "Greater London",        cities: ["London", "Croydon", "Barnet", "Enfield"] },
      { name: "West Midlands",         cities: ["Birmingham", "Coventry", "Wolverhampton"] },
      { name: "Greater Manchester",    cities: ["Manchester", "Salford", "Stockport", "Bolton"] },
      { name: "West Yorkshire",        cities: ["Leeds", "Bradford", "Halifax"] },
      { name: "South Yorkshire",       cities: ["Sheffield", "Rotherham", "Barnsley"] },
      { name: "Merseyside",            cities: ["Liverpool", "Wirral", "St Helens"] },
      { name: "East Midlands",         cities: ["Leicester", "Nottingham", "Derby"] },
      { name: "Scotland",              cities: ["Glasgow", "Edinburgh", "Aberdeen"] },
      { name: "Wales",                 cities: ["Cardiff", "Swansea", "Newport"] },
      { name: "Northern Ireland",      cities: ["Belfast", "Derry"] },
      { name: "South East England",    cities: ["Southampton", "Brighton", "Reading", "Oxford"] },
      { name: "South West England",    cities: ["Bristol", "Exeter", "Plymouth"] },
      { name: "East of England",       cities: ["Cambridge", "Norwich", "Luton"] },
      { name: "North West England",    cities: ["Blackburn", "Preston", "Oldham"] },
      { name: "North East England",    cities: ["Newcastle", "Sunderland", "Middlesbrough"] },
    ],
  },
  {
    code: "DE", name: "Germany",
    states: [
      { name: "Berlin",          cities: ["Berlin"] },
      { name: "Bavaria",         cities: ["Munich", "Nuremberg", "Augsburg"] },
      { name: "North Rhine-Westphalia", cities: ["Cologne", "Düsseldorf", "Dortmund", "Essen"] },
      { name: "Hamburg",         cities: ["Hamburg"] },
      { name: "Baden-Württemberg", cities: ["Stuttgart", "Karlsruhe", "Freiburg"] },
    ],
  },
  {
    code: "FR", name: "France",
    states: [
      { name: "Île-de-France",    cities: ["Paris"] },
      { name: "Auvergne-Rhône",   cities: ["Lyon"] },
      { name: "Provence",         cities: ["Marseille", "Nice"] },
      { name: "Occitanie",        cities: ["Toulouse", "Montpellier"] },
    ],
  },
  {
    code: "NL", name: "Netherlands",
    states: [
      { name: "North Holland",   cities: ["Amsterdam", "Haarlem"] },
      { name: "South Holland",   cities: ["Rotterdam", "The Hague", "Leiden"] },
      { name: "Utrecht",         cities: ["Utrecht"] },
    ],
  },
  {
    code: "SE", name: "Sweden",
    states: [
      { name: "Stockholm",  cities: ["Stockholm"] },
      { name: "Västra Götaland", cities: ["Gothenburg"] },
      { name: "Skåne",      cities: ["Malmö"] },
    ],
  },
  {
    code: "NO", name: "Norway",
    states: [
      { name: "Oslo",       cities: ["Oslo"] },
      { name: "Bergen",     cities: ["Bergen"] },
    ],
  },
  {
    code: "IT", name: "Italy",
    states: [
      { name: "Lombardy",   cities: ["Milan", "Brescia", "Bergamo"] },
      { name: "Lazio",      cities: ["Rome"] },
      { name: "Campania",   cities: ["Naples"] },
    ],
  },
  {
    code: "ES", name: "Spain",
    states: [
      { name: "Community of Madrid", cities: ["Madrid"] },
      { name: "Catalonia",           cities: ["Barcelona"] },
      { name: "Andalusia",           cities: ["Seville", "Málaga"] },
    ],
  },
  // ── North America ─────────────────────────────────────────────────────────
  {
    code: "US", name: "United States",
    states: [
      { name: "California",    cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Fremont"] },
      { name: "New York",      cities: ["New York City", "Buffalo", "Albany"] },
      { name: "Texas",         cities: ["Houston", "Dallas", "Austin", "San Antonio"] },
      { name: "Florida",       cities: ["Miami", "Orlando", "Tampa", "Jacksonville"] },
      { name: "Illinois",      cities: ["Chicago"] },
      { name: "Virginia",      cities: ["Virginia Beach", "Richmond", "Arlington"] },
      { name: "Georgia",       cities: ["Atlanta", "Augusta"] },
      { name: "New Jersey",    cities: ["Newark", "Jersey City", "Edison"] },
      { name: "Pennsylvania",  cities: ["Philadelphia", "Pittsburgh"] },
      { name: "Ohio",          cities: ["Columbus", "Cleveland", "Cincinnati"] },
    ],
  },
  {
    code: "CA", name: "Canada",
    states: [
      { name: "Ontario",          cities: ["Toronto", "Ottawa", "Mississauga", "Brampton"] },
      { name: "British Columbia", cities: ["Vancouver", "Surrey", "Burnaby"] },
      { name: "Quebec",           cities: ["Montreal", "Quebec City"] },
      { name: "Alberta",          cities: ["Calgary", "Edmonton"] },
    ],
  },
  // ── Australia / New Zealand ───────────────────────────────────────────────
  {
    code: "AU", name: "Australia",
    states: [
      { name: "New South Wales",   cities: ["Sydney", "Newcastle", "Wollongong"] },
      { name: "Victoria",          cities: ["Melbourne", "Geelong", "Ballarat"] },
      { name: "Queensland",        cities: ["Brisbane", "Gold Coast", "Cairns"] },
      { name: "Western Australia", cities: ["Perth", "Fremantle"] },
      { name: "South Australia",   cities: ["Adelaide"] },
    ],
  },
  {
    code: "NZ", name: "New Zealand",
    states: [
      { name: "Auckland",      cities: ["Auckland"] },
      { name: "Wellington",    cities: ["Wellington"] },
      { name: "Canterbury",    cities: ["Christchurch"] },
    ],
  },
  // ── Africa ────────────────────────────────────────────────────────────────
  {
    code: "ZA", name: "South Africa",
    states: [
      { name: "Gauteng",      cities: ["Johannesburg", "Pretoria"] },
      { name: "Western Cape", cities: ["Cape Town"] },
      { name: "KwaZulu-Natal", cities: ["Durban"] },
    ],
  },
  {
    code: "NG", name: "Nigeria",
    states: [
      { name: "Lagos",    cities: ["Lagos", "Ikeja"] },
      { name: "Abuja",    cities: ["Abuja"] },
      { name: "Kano",     cities: ["Kano"] },
    ],
  },
  {
    code: "EG", name: "Egypt",
    states: [
      { name: "Cairo",       cities: ["Cairo", "Giza"] },
      { name: "Alexandria",  cities: ["Alexandria"] },
    ],
  },
];

export const CURRENCIES = [
  { code: "GBP", symbol: "£",  name: "British Pound" },
  { code: "USD", symbol: "$",  name: "US Dollar" },
  { code: "EUR", symbol: "€",  name: "Euro" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee" },
  { code: "BDT", symbol: "৳",  name: "Bangladeshi Taka" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "MYR", symbol: "RM",  name: "Malaysian Ringgit" },
  { code: "SGD", symbol: "S$",  name: "Singapore Dollar" },
  { code: "CAD", symbol: "C$",  name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar" },
  { code: "TRY", symbol: "₺",  name: "Turkish Lira" },
  { code: "ZAR", symbol: "R",   name: "South African Rand" },
];
