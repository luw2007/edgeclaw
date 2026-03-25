const CHINESE_NAMES = [
  "张伟",
  "李娜",
  "王芳",
  "刘洋",
  "陈静",
  "杨磊",
  "赵敏",
  "黄强",
  "周丽",
  "吴鑫",
  "孙浩",
  "马超",
  "朱婷",
  "胡军",
  "郭靖",
  "林峰",
  "何雪",
  "高翔",
  "罗敏",
  "郑宇",
  "梁波",
  "宋佳",
  "谢涛",
  "韩冰",
  "唐亮",
  "冯琳",
  "董杰",
  "程雯",
  "曹磊",
  "袁芳",
  "邓辉",
  "许静",
  "傅强",
  "沈悦",
  "曾鹏",
  "彭丹",
  "吕岩",
  "苏瑶",
  "蒋明",
  "蔡婷",
  "贾峰",
  "丁霞",
  "魏凯",
  "薛晴",
  "叶勇",
  "阎丽",
  "余刚",
  "潘洁",
  "杜鑫",
  "戴瑞",
  "夏天",
  "钟灵",
  "汪洋",
  "田甜",
  "任远",
  "姜华",
  "范文",
  "方圆",
  "石磊",
  "姚明",
  "谭松",
  "廖芳",
  "邹凯",
  "熊伟",
  "金玲",
  "陆海",
  "郝帅",
  "孔明",
  "白雪",
  "崔健",
  "龚晓",
  "段瑜",
  "雷鸣",
  "侯佳",
  "龙飞",
  "万里",
  "严冬",
  "武林",
  "贺峰",
  "顾安",
  "毛宁",
  "郎平",
  "史强",
  "陶然",
  "柳青",
  "尹航",
  "康健",
  "甘露",
  "秦风",
  "鲁迅",
  "翁静",
  "殷悦",
  "庄严",
  "倪虹",
  "项楠",
  "童心",
  "纪明",
  "舒畅",
  "凌云",
  "左维",
  "季阳",
];

const ENGLISH_NAMES = [
  "John Smith",
  "Emily Johnson",
  "Michael Brown",
  "Sarah Davis",
  "James Wilson",
  "Jessica Taylor",
  "Robert Anderson",
  "Jennifer Thomas",
  "David Jackson",
  "Amanda White",
  "William Harris",
  "Melissa Martin",
  "Richard Thompson",
  "Stephanie Garcia",
  "Joseph Martinez",
  "Nicole Robinson",
  "Thomas Clark",
  "Elizabeth Rodriguez",
  "Christopher Lewis",
  "Laura Lee",
  "Daniel Walker",
  "Rebecca Hall",
  "Matthew Allen",
  "Samantha Young",
  "Anthony Hernandez",
  "Ashley King",
  "Mark Wright",
  "Kimberly Lopez",
  "Steven Hill",
  "Michelle Scott",
  "Andrew Green",
  "Heather Adams",
  "Joshua Baker",
  "Angela Nelson",
  "Kenneth Carter",
  "Rachel Mitchell",
  "Kevin Perez",
  "Megan Roberts",
  "Brian Turner",
  "Amy Phillips",
  "George Campbell",
  "Tiffany Parker",
  "Edward Evans",
  "Christina Edwards",
  "Ronald Collins",
  "Natalie Stewart",
  "Timothy Sanchez",
  "Catherine Morris",
  "Jason Rogers",
  "Karen Reed",
  "Jeffrey Cook",
  "Lisa Morgan",
  "Ryan Bell",
  "Diana Murphy",
  "Jacob Bailey",
  "Patricia Rivera",
  "Gary Cooper",
  "Deborah Richardson",
  "Frank Cox",
  "Sharon Howard",
  "Peter Ward",
  "Susan Torres",
  "Henry Peterson",
  "Donna Gray",
  "Nathan Foster",
  "Olivia Bennett",
  "Charles Russell",
  "Victoria Hayes",
  "Alexander Hughes",
  "Sophia Price",
  "Benjamin Ross",
  "Grace Powell",
  "Samuel Perry",
  "Ella Simmons",
  "Douglas Barnes",
  "Hannah Long",
  "Patrick Coleman",
  "Abigail Griffin",
  "Raymond Diaz",
  "Chloe Sanders",
  "Philip Hayes",
  "Madison Bryant",
  "Eugene Palmer",
  "Lily Warren",
  "Harold Dixon",
  "Zoe Wagner",
  "Vincent Stone",
  "Audrey Walsh",
  "Albert Holland",
  "Scarlett Graves",
  "Lawrence Hicks",
  "Penelope Moss",
  "Gerald Cross",
  "Stella Harper",
  "Arthur Dean",
  "Claire Floyd",
];

const CHINESE_ADDRESSES = [
  "北京市海淀区中关村大街1号",
  "上海市浦东新区陆家嘴环路100号",
  "广州市天河区体育西路58号",
  "深圳市南山区科技园南路66号",
  "杭州市西湖区文三路90号",
  "成都市锦江区春熙路12号",
  "武汉市武昌区珞瑜路37号",
  "南京市鼓楼区中山路88号",
  "重庆市渝中区解放碑步行街22号",
  "西安市雁塔区小寨西路15号",
  "苏州市工业园区星湖街328号",
  "天津市和平区南京路189号",
  "长沙市岳麓区麓山南路2号",
  "郑州市金水区花园路10号",
  "青岛市市南区香港中路76号",
  "大连市中山区人民路23号",
  "厦门市思明区湖滨南路99号",
  "宁波市鄞州区四明中路200号",
  "无锡市梁溪区人民中路68号",
  "合肥市蜀山区长江西路130号",
  "福州市鼓楼区五一北路18号",
  "昆明市盘龙区北京路155号",
  "哈尔滨市南岗区红军街50号",
  "济南市历下区泉城路180号",
  "沈阳市沈河区青年大街55号",
  "南昌市东湖区八一大道333号",
  "贵阳市云岩区中华北路42号",
  "南宁市青秀区民族大道88号",
  "石家庄市长安区中山东路216号",
  "兰州市城关区庆阳路77号",
  "太原市小店区长风街108号",
  "长春市朝阳区人民大街7655号",
  "呼和浩特市赛罕区大学东路1号",
  "乌鲁木齐市天山区解放南路8号",
  "拉萨市城关区北京中路10号",
  "银川市金凤区正源北街301号",
  "西宁市城中区长江路79号",
  "海口市龙华区国贸大道58号",
  "温州市鹿城区车站大道567号",
  "珠海市香洲区人民东路2号",
  "东莞市南城区鸿福路108号",
  "佛山市禅城区汾江中路43号",
  "烟台市芝罘区南大街158号",
  "常州市天宁区延陵西路99号",
  "徐州市云龙区和平路66号",
  "惠州市惠城区麦地路8号院3栋",
  "嘉兴市南湖区中山东路505号",
  "泉州市丰泽区田安北路388号",
  "中山市东区街道兴中道16号",
  "绍兴市越城区府山街道胜利路58弄12号",
];

const ENGLISH_STREETS = [
  "Oak",
  "Maple",
  "Cedar",
  "Elm",
  "Pine",
  "Walnut",
  "Birch",
  "Willow",
  "Cherry",
  "Spruce",
  "Ash",
  "Magnolia",
  "Poplar",
  "Cypress",
  "Hickory",
];

const ENGLISH_CITIES = [
  "Springfield, IL 62701",
  "Portland, OR 97201",
  "Madison, WI 53703",
  "Austin, TX 78701",
  "Denver, CO 80202",
  "Seattle, WA 98101",
  "Phoenix, AZ 85001",
  "Charlotte, NC 28202",
  "Columbus, OH 43215",
  "Nashville, TN 37203",
  "Raleigh, NC 27601",
  "Tampa, FL 33602",
];

const CHINESE_ID_AREA_CODES = [
  "110101",
  "110102",
  "110105",
  "120101",
  "310101",
  "310104",
  "440103",
  "440305",
  "330102",
  "510104",
  "420106",
  "320102",
  "500103",
  "610103",
  "320505",
  "370102",
  "350102",
  "330203",
];

const CHINESE_PLATE_PREFIXES = [
  "京A",
  "京B",
  "京C",
  "沪A",
  "沪B",
  "粤A",
  "粤B",
  "浙A",
  "浙B",
  "苏A",
  "苏B",
  "川A",
  "鄂A",
  "湘A",
  "鲁A",
  "豫A",
  "闽A",
  "渝A",
];

const CHINESE_COMPANY_NAMES = [
  "星辰科技有限公司",
  "云帆信息技术有限公司",
  "鸿运贸易有限公司",
  "嘉和食品有限公司",
  "华创电子科技有限公司",
  "瑞丰建材有限公司",
  "天宇物流有限公司",
  "恒达机械制造有限公司",
  "盛通投资管理有限公司",
  "明睿教育咨询有限公司",
  "博源环保科技有限公司",
  "泰和医药有限公司",
  "金诚财务咨询有限公司",
  "远航国际贸易有限公司",
  "正达通信技术有限公司",
  "汇智软件开发有限公司",
  "安泰物业管理有限公司",
  "永昌新能源有限公司",
  "国瑞文化传媒有限公司",
  "德信农业发展有限公司",
  "百汇商贸有限公司",
  "宏图装饰工程有限公司",
  "中兴达电器有限公司",
  "优品生活服务有限公司",
  "万联网络科技有限公司",
  "鼎盛房地产开发有限公司",
  "新纪元咨询有限公司",
  "诚信律师事务所",
  "利民连锁超市有限公司",
  "源通汽车服务有限公司",
];

const ENGLISH_COMPANY_NAMES = [
  "Apex Solutions Inc.",
  "Bright Valley Technologies LLC",
  "Cascade Digital Corp.",
  "Evergreen Systems Ltd.",
  "Falcon Industries Inc.",
  "Granite Peak Partners",
  "Horizon Dynamics LLC",
  "Iron Bridge Consulting",
  "Juniper Cloud Services",
  "Keystone Analytics Corp.",
  "Lakeshore Media Group",
  "Meridian Health Solutions",
  "NorthStar Financial Inc.",
  "Oakridge Manufacturing LLC",
  "Pinnacle Software Corp.",
  "Quantum Labs Inc.",
  "Redwood Capital Partners",
  "Summit Engineering Group",
  "Trident Logistics Corp.",
  "Urban Wave Retail Inc.",
  "Vertex Innovations LLC",
  "Westfield Development Corp.",
  "Zenith Consulting Group",
  "Atlas Global Trading Ltd.",
  "BlueSky Pharmaceuticals Inc.",
  "Coral Reef Design Studio",
  "Delta Force Security LLC",
  "Eclipse Data Systems",
  "Forge Ahead Construction",
  "Golden Gate Ventures",
];

const CHINESE_COMPANY_CITY_PREFIXES = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "杭州",
  "成都",
  "武汉",
  "南京",
  "重庆",
  "西安",
  "苏州",
  "天津",
  "长沙",
  "青岛",
  "厦门",
];

const COURIER_PREFIXES = ["SF", "YT", "ZTO", "STO", "YD", "JD", "EMS", "BEST"];

const JOB_TITLES_ZH = [
  "软件工程师",
  "产品经理",
  "项目主管",
  "财务总监",
  "人力资源专员",
  "市场营销经理",
  "运营总监",
  "数据分析师",
  "设计主管",
  "客户经理",
  "法务顾问",
  "行政助理",
  "技术架构师",
  "质量工程师",
  "采购经理",
];

const JOB_TITLES_EN = [
  "Software Engineer",
  "Product Manager",
  "Project Lead",
  "CFO",
  "HR Specialist",
  "Marketing Manager",
  "Operations Director",
  "Data Analyst",
  "Design Lead",
  "Account Manager",
  "Legal Counsel",
  "Admin Assistant",
  "Tech Architect",
  "QA Engineer",
  "Procurement Manager",
];

const DEPARTMENT_NAMES_ZH = [
  "技术部",
  "产品部",
  "财务部",
  "人力资源部",
  "市场部",
  "运营部",
  "法务部",
  "行政部",
  "质量部",
  "采购部",
  "研发中心",
  "客户服务部",
];

const DEPARTMENT_NAMES_EN = [
  "Engineering",
  "Product",
  "Finance",
  "Human Resources",
  "Marketing",
  "Operations",
  "Legal",
  "Administration",
  "Quality Assurance",
  "Procurement",
  "R&D Center",
  "Customer Service",
];

const BANK_CARD_PREFIXES = [
  "6222", // 工商银行
  "6217", // 建设银行
  "6225", // 招商银行
  "6228", // 农业银行
  "6214", // 交通银行
  "6259", // 中国银行
  "6226", // 浦发银行
  "6236", // 邮储银行
  "4367", // 建行 VISA
  "5187", // 工行 MC
];

const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDigits(len: number): string {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

function randAlphaNum(len: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function randBase62(len: number): string {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += BASE62[Math.floor(Math.random() * BASE62.length)];
  }
  return result;
}

function randHex(len: number): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function pickDifferent<T>(arr: readonly T[], exclude: T): T {
  if (arr.length <= 1) return arr[0];
  let pick: T;
  do {
    pick = randElement(arr);
  } while (pick === exclude);
  return pick;
}

export function generateFakeEmail(original: string): string {
  void original;
  const num = randInt(100, 99999);
  return `fakeuser${num}@example.com`;
}

export function generateFakePhone(original: string, locale: string): string {
  if (locale === "zh-CN") {
    let result: string;
    do {
      const second = randInt(3, 9);
      result = `1${second}${randDigits(9)}`;
    } while (result === original);
    return result;
  }

  let result: string;
  do {
    result = `+1-${randDigits(3)}-${randDigits(3)}-${randDigits(4)}`;
  } while (result === original);
  return result;
}

function generateFakeName(original: string, locale: string): string {
  if (locale === "zh-CN") {
    return pickDifferent(CHINESE_NAMES, original);
  }
  return pickDifferent(ENGLISH_NAMES, original);
}

function generateFakeAddress(locale: string): string {
  if (locale === "zh-CN") {
    return randElement(CHINESE_ADDRESSES);
  }
  const num = randInt(100, 9999);
  const street = randElement(ENGLISH_STREETS);
  const city = randElement(ENGLISH_CITIES);
  return `${num} ${street} Street, ${city}`;
}

function generateFakeId(locale: string): string {
  if (locale === "zh-CN") {
    const area = randElement(CHINESE_ID_AREA_CODES);
    const year = randInt(1970, 2000);
    const month = String(randInt(1, 12)).padStart(2, "0");
    const day = String(randInt(1, 28)).padStart(2, "0");
    const seq = randDigits(3);
    const last = Math.random() < 0.1 ? "X" : String(randInt(0, 9));
    return `${area}${year}${month}${day}${seq}${last}`;
  }
  return `${randDigits(3)}-${randDigits(2)}-${randDigits(4)}`;
}

function generateFakeCard(): string {
  const prefix = randElement(BANK_CARD_PREFIXES);
  return `${prefix}${randDigits(16 - prefix.length)}`;
}

function generateFakeSecret(original: string): string {
  return randBase62(original.length || 16);
}

function generateFakeAccessKey(): string {
  return `AKIA${randAlphaNum(16)}`;
}

function generateFakeSecretKey(): string {
  return randBase62(40);
}

function generateFakeApiKeyWithPrefix(original: string): string {
  const prefixMatch = original.match(/^(sk-|pk-|rk-|key-|token-|ghp_|gho_|glpat-|xoxb-|xoxp-)/i);
  if (prefixMatch) {
    const prefix = prefixMatch[1];
    return `${prefix}${randBase62(original.length - prefix.length || 32)}`;
  }
  return `sk-fake-${randBase62(32)}`;
}

function generateFakeJwt(): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: `user_${randDigits(6)}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  const sig = randBase62(43);
  return `${header}.${payload}.${sig}`;
}

function generateFakeRsaPrivateKey(): string {
  const lines = ["-----BEGIN RSA PRIVATE KEY-----"];
  for (let i = 0; i < 6; i++) {
    lines.push(randBase62(64));
  }
  lines.push("-----END RSA PRIVATE KEY-----");
  return lines.join("\n");
}

function generateFakeRsaPublicKey(): string {
  const lines = ["-----BEGIN PUBLIC KEY-----"];
  for (let i = 0; i < 3; i++) {
    lines.push(randBase62(64));
  }
  lines.push("-----END PUBLIC KEY-----");
  return lines.join("\n");
}

function generateFakeCertificate(): string {
  const lines = ["-----BEGIN CERTIFICATE-----"];
  for (let i = 0; i < 8; i++) {
    lines.push(randBase62(64));
  }
  lines.push("-----END CERTIFICATE-----");
  return lines.join("\n");
}

function generateFakeSshKey(): string {
  return `ssh-rsa ${randBase62(68)} fakeuser@example.com`;
}

function generateFakeConnectionString(): string {
  const types = ["mysql", "postgresql", "mongodb", "redis"];
  const t = randElement(types);
  const host = `${t === "redis" ? "cache" : "db"}-fake-${randHex(4)}.internal`;
  const port = t === "mysql" ? 3306 : t === "postgresql" ? 5432 : t === "mongodb" ? 27017 : 6379;
  if (t === "redis") return `redis://default:${randBase62(16)}@${host}:${port}/0`;
  return `${t}://fakeuser:${randBase62(16)}@${host}:${port}/fakedb`;
}

function generateFakeEnvVar(original: string): string {
  const eqIndex = original.indexOf("=");
  if (eqIndex > 0) {
    const key = original.substring(0, eqIndex);
    return `${key}=${randBase62(original.length - eqIndex - 1 || 16)}`;
  }
  return `FAKE_VAR=${randBase62(16)}`;
}

function generateFakeIp(): string {
  return `10.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

function generateFakePlate(locale: string): string {
  if (locale === "zh-CN") {
    const prefix = randElement(CHINESE_PLATE_PREFIXES);
    return `${prefix}${randAlphaNum(5)}`;
  }
  return `${randAlphaNum(3)}-${randDigits(4)}`;
}

function generateFakeCompany(locale: string): string {
  if (locale === "zh-CN") {
    const city = randElement(CHINESE_COMPANY_CITY_PREFIXES);
    const name = randElement(CHINESE_COMPANY_NAMES);
    return `${city}${name}`;
  }
  return randElement(ENGLISH_COMPANY_NAMES);
}

function generateFakeUscc(): string {
  const regTypes = ["91", "92", "93"];
  const reg = randElement(regTypes);
  const area = randElement(CHINESE_ID_AREA_CODES);
  return `${reg}${area}${randAlphaNum(10)}`;
}

function generateFakeTaxId(locale: string): string {
  if (locale === "zh-CN") {
    return generateFakeUscc();
  }
  return `${randDigits(2)}-${randDigits(7)}`;
}

function generateFakeBankAccount(locale: string): string {
  if (locale === "zh-CN") {
    const prefix = randElement(BANK_CARD_PREFIXES);
    return `${prefix}${randDigits(15 - prefix.length)}`;
  }
  const routing = randDigits(9);
  const account = randDigits(randInt(8, 12));
  return `${routing} / ${account}`;
}

function generateFakeDomain(): string {
  const words = [
    "acme",
    "globex",
    "initech",
    "umbrella",
    "stark",
    "wayne",
    "nexus",
    "vortex",
    "synergy",
    "apex",
  ];
  const tlds = [".com", ".net", ".io", ".co", ".org"];
  return `${randElement(words)}${randInt(1, 999)}${randElement(tlds)}`;
}

function generateFakeJobTitle(locale: string): string {
  if (locale === "zh-CN") {
    return randElement(JOB_TITLES_ZH);
  }
  return randElement(JOB_TITLES_EN);
}

function generateFakeDepartment(locale: string): string {
  if (locale === "zh-CN") {
    return randElement(DEPARTMENT_NAMES_ZH);
  }
  return randElement(DEPARTMENT_NAMES_EN);
}

function generateFakeBizLicense(): string {
  return randDigits(15);
}

function generateFakeOrgCode(): string {
  return `${randAlphaNum(8)}-${randAlphaNum(1)}`;
}

function generateFakePayment(locale: string): string {
  if (locale === "zh-CN") {
    const types = ["支付宝", "微信"];
    return `${randElement(types)}:fakeuser${randInt(1000, 99999)}`;
  }
  const types = ["Venmo", "PayPal", "CashApp"];
  return `${randElement(types)}:@fakeuser${randInt(100, 9999)}`;
}

function generateFakeBirthday(): string {
  const year = randInt(1960, 2005);
  const month = String(randInt(1, 12)).padStart(2, "0");
  const day = String(randInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateFakeDate(): string {
  const year = randInt(2020, 2026);
  const month = String(randInt(1, 12)).padStart(2, "0");
  const day = String(randInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateFakeTime(): string {
  const h = String(randInt(0, 23)).padStart(2, "0");
  const m = String(randInt(0, 59)).padStart(2, "0");
  return `${h}:${m}`;
}

function generateFakeSalary(locale: string): string {
  if (locale === "zh-CN") {
    const amount = randInt(5, 80) * 1000;
    return `${amount}元/月`;
  }
  const amount = randInt(3, 15) * 10000;
  return `$${amount.toLocaleString("en-US")}/yr`;
}

function generateFakeAmount(locale: string): string {
  if (locale === "zh-CN") {
    const yuan = randInt(10, 999999);
    const jiao = randInt(0, 99);
    return `${yuan}.${String(jiao).padStart(2, "0")}元`;
  }
  const dollars = randInt(10, 999999);
  const cents = randInt(0, 99);
  return `$${dollars}.${String(cents).padStart(2, "0")}`;
}

function generateFakeDelivery(): string {
  const prefix = randElement(COURIER_PREFIXES);
  return `${prefix}${randDigits(12)}`;
}

function generateFakeAccessCode(): string {
  const len = randInt(4, 6);
  return `${randDigits(len)}#`;
}

function generateFakePassport(locale: string): string {
  if (locale === "zh-CN") {
    const letter = Math.random() < 0.5 ? "E" : "G";
    return `${letter}${randDigits(8)}`;
  }
  return `${randAlphaNum(1)}${randDigits(8)}`;
}

function generateFakeDriverLicense(locale: string): string {
  if (locale === "zh-CN") {
    const area = randElement(CHINESE_ID_AREA_CODES);
    return `${area}${randDigits(12)}`;
  }
  return `${randAlphaNum(1)}${randDigits(7)}`;
}

function generateFakeUrl(): string {
  return `https://${generateFakeDomain()}/path/${randHex(6)}`;
}

function generateFakeNote(): string {
  const notes_zh = ["请在工作日送达", "放在门口即可", "注意保鲜", "需要发票", "周末不方便收货"];
  const notes_en = [
    "Please deliver on weekdays",
    "Leave at front door",
    "Handle with care",
    "Invoice required",
    "Not available on weekends",
  ];
  return Math.random() < 0.5 ? randElement(notes_zh) : randElement(notes_en);
}

function generateFakeOrderNumber(): string {
  const prefixes = ["ORD", "DD", "SO", "PO"];
  return `${randElement(prefixes)}${randDigits(4)}${randDigits(8)}`;
}

function generateFakeContractNumber(): string {
  const year = randInt(2022, 2026);
  const prefixes = ["HT", "CT", "BH"];
  return `${randElement(prefixes)}-${year}-${randDigits(6)}`;
}

function generateFakeInvoiceNumber(locale: string): string {
  if (locale === "zh-CN") {
    const codes = ["01", "04", "10", "11"];
    return `${randElement(codes)}${randDigits(8)}`;
  }
  return `INV-${randDigits(4)}-${randDigits(6)}`;
}

function generateFakeCustomerId(): string {
  const prefixes = ["CUS", "CLI", "KH"];
  return `${randElement(prefixes)}${randDigits(8)}`;
}

function generateFakeTransactionId(): string {
  return `TXN${randHex(16)}`;
}

function generateFakeReceiptNumber(): string {
  return `RCP-${randDigits(4)}-${randDigits(8)}`;
}

function generateFakeSku(): string {
  return `${randAlphaNum(3)}-${randAlphaNum(4)}-${randDigits(4)}`;
}

const PRODUCT_NAMES_ZH = [
  "智能手表Pro",
  "云端办公套件",
  "净水器家庭版",
  "有机绿茶礼盒",
  "运动蓝牙耳机",
  "儿童学习平板",
  "空气净化器X1",
  "保温杯旅行装",
  "电动牙刷套装",
  "便携充电宝S3",
  "全自动咖啡机",
  "家用投影仪",
];

const PRODUCT_NAMES_EN = [
  "Smart Watch Pro",
  "Cloud Office Suite",
  "Water Purifier Home",
  "Organic Green Tea Gift",
  "Sport Bluetooth Earbuds",
  "Kids Learning Tablet",
  "Air Purifier X1",
  "Travel Thermos Set",
  "Electric Toothbrush Kit",
  "Portable Charger S3",
  "Auto Coffee Maker",
  "Home Projector",
];

function generateFakeProductName(locale: string): string {
  if (locale === "zh-CN") {
    return randElement(PRODUCT_NAMES_ZH);
  }
  return randElement(PRODUCT_NAMES_EN);
}

function generateFakeProjectCode(): string {
  const prefixes = ["PRJ", "XM", "WBS"];
  return `${randElement(prefixes)}-${randInt(2023, 2026)}-${randDigits(4)}`;
}

function generateFakeEmployeeId(): string {
  const prefixes = ["EMP", "GH", "STF"];
  return `${randElement(prefixes)}${randDigits(6)}`;
}

function generateFakeEthnicity(locale: string): string {
  if (locale === "zh-CN") {
    const groups = [
      "汉族",
      "回族",
      "满族",
      "蒙古族",
      "藏族",
      "维吾尔族",
      "壮族",
      "苗族",
      "彝族",
      "土家族",
    ];
    return randElement(groups);
  }
  const groups = [
    "Caucasian",
    "African American",
    "Hispanic",
    "Asian",
    "Native American",
    "Pacific Islander",
    "Middle Eastern",
    "Mixed",
  ];
  return randElement(groups);
}

function generateFakeReligion(locale: string): string {
  if (locale === "zh-CN") {
    const beliefs = ["佛教", "道教", "基督教", "伊斯兰教", "天主教", "无宗教信仰"];
    return randElement(beliefs);
  }
  const beliefs = [
    "Christianity",
    "Islam",
    "Judaism",
    "Buddhism",
    "Hinduism",
    "Atheism",
    "Agnosticism",
    "Sikhism",
  ];
  return randElement(beliefs);
}

function generateFakePoliticalAffiliation(locale: string): string {
  if (locale === "zh-CN") {
    const parties = ["中共党员", "民主党派", "无党派人士", "共青团员", "群众"];
    return randElement(parties);
  }
  const affiliations = [
    "Democrat",
    "Republican",
    "Independent",
    "Libertarian",
    "Green Party",
    "Non-affiliated",
  ];
  return randElement(affiliations);
}

function generateFakeUnionMembership(locale: string): string {
  if (locale === "zh-CN") {
    const unions = ["全国总工会会员", "行业工会会员", "非工会成员"];
    return randElement(unions);
  }
  const unions = ["AFL-CIO Member", "SEIU Member", "UAW Member", "Non-union", "Teamsters Member"];
  return randElement(unions);
}

function generateFakeHealthCondition(locale: string): string {
  if (locale === "zh-CN") {
    const conditions = [
      "高血压",
      "糖尿病",
      "过敏性鼻炎",
      "近视",
      "胃炎",
      "腰椎间盘突出",
      "甲状腺功能异常",
      "健康",
    ];
    return randElement(conditions);
  }
  const conditions = [
    "Hypertension",
    "Diabetes Type 2",
    "Allergic Rhinitis",
    "Myopia",
    "Gastritis",
    "Hypothyroidism",
    "Asthma",
    "Healthy",
  ];
  return randElement(conditions);
}

function generateFakeMedication(locale: string): string {
  if (locale === "zh-CN") {
    const meds = [
      "阿莫西林胶囊",
      "布洛芬缓释片",
      "奥美拉唑肠溶胶囊",
      "二甲双胍片",
      "氨氯地平片",
      "维生素D3",
    ];
    return randElement(meds);
  }
  const meds = [
    "Amoxicillin 500mg",
    "Ibuprofen 400mg",
    "Omeprazole 20mg",
    "Metformin 500mg",
    "Lisinopril 10mg",
  ];
  return randElement(meds);
}

function generateFakeBiometricId(): string {
  return `BIO-${randHex(8)}-${randHex(4)}`;
}

function generateFakeGeneticMarker(): string {
  const genes = ["BRCA1", "APOE", "TP53", "MTHFR", "CYP2D6", "HLA-B27", "CFTR"];
  const variants = ["c.68_69del", "p.Val600Glu", "rs1801133", "c.1521_1523del", "rs429358"];
  return `${randElement(genes)}:${randElement(variants)}`;
}

function generateFakeSexualOrientation(locale: string): string {
  if (locale === "zh-CN") {
    const orientations = ["异性恋", "同性恋", "双性恋", "不愿透露"];
    return randElement(orientations);
  }
  const orientations = ["Heterosexual", "Homosexual", "Bisexual", "Prefer not to say"];
  return randElement(orientations);
}

function generateFakeCriminalRecord(locale: string): string {
  if (locale === "zh-CN") {
    const records = ["无犯罪记录", "交通违章记录", "行政处罚记录"];
    return randElement(records);
  }
  const records = ["No criminal record", "Traffic violation", "Misdemeanor", "Expunged record"];
  return randElement(records);
}

function generateFakeGender(locale: string): string {
  if (locale === "zh-CN") {
    return randElement(["男", "女", "非二元"]);
  }
  return randElement(["Male", "Female", "Non-binary", "Prefer not to say"]);
}

function generateFakeAge(): string {
  return `${randInt(18, 85)}`;
}

function generateFakeBirthPlace(locale: string): string {
  if (locale === "zh-CN") {
    const places = [
      "北京市",
      "上海市",
      "广州市",
      "武汉市",
      "成都市",
      "杭州市",
      "南京市",
      "西安市",
      "长沙市",
    ];
    return randElement(places);
  }
  const places = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Phoenix, AZ",
    "London, UK",
    "Toronto, CA",
  ];
  return randElement(places);
}

function generateFakeNationality(locale: string): string {
  if (locale === "zh-CN") {
    return randElement(["中国公民", "永久居留权持有者", "外籍人士"]);
  }
  return randElement(["US Citizen", "Permanent Resident", "Work Visa Holder", "Student Visa"]);
}

function generateFakeMedicalRecordNumber(): string {
  return `MRN-${randDigits(4)}-${randDigits(8)}`;
}

function generateFakeHealthPlanId(): string {
  const prefixes = ["HP", "BCBS", "UHC", "AETNA"];
  return `${randElement(prefixes)}-${randDigits(10)}`;
}

function generateFakeInsuranceNumber(): string {
  return `INS-${randAlphaNum(4)}-${randDigits(8)}`;
}

function generateFakeDeviceId(): string {
  return `${randHex(8)}-${randHex(4)}-${randHex(4)}-${randHex(4)}-${randHex(12)}`;
}

function generateFakeGeoCoordinates(): string {
  const lat = (Math.random() * 180 - 90).toFixed(6);
  const lon = (Math.random() * 360 - 180).toFixed(6);
  return `${lat},${lon}`;
}

function generateFakeCookieId(): string {
  return `_ga_${randAlphaNum(10)}`;
}

function generateFakeStudentId(): string {
  return `STU${randDigits(8)}`;
}

function generateFakeCreditScore(): string {
  return `${randInt(300, 850)}`;
}

function generateFakeLoanNumber(): string {
  return `LN-${randDigits(4)}-${randDigits(8)}`;
}

function generateFakeFaxNumber(locale: string): string {
  if (locale === "zh-CN") {
    const areaCodes = ["010", "021", "020", "0755"];
    return `${randElement(areaCodes)}-${randDigits(8)}`;
  }
  return `+1-${randDigits(3)}-${randDigits(3)}-${randDigits(4)}`;
}

function generateFakeUsername(): string {
  const adjectives = ["swift", "clever", "quiet", "bright", "calm", "bold", "keen", "warm"];
  const nouns = ["fox", "eagle", "wolf", "bear", "hawk", "lion", "deer", "owl"];
  return `${randElement(adjectives)}_${randElement(nouns)}_${randDigits(4)}`;
}

function generateFakeSignature(locale: string): string {
  if (locale === "zh-CN") {
    return `[签名:${randElement(["张", "李", "王", "刘", "陈"])}**]`;
  }
  return `[Signature:${randElement(["J.", "M.", "R.", "S.", "A."])} ${randAlphaNum(4)}]`;
}

function generateFakeLandline(locale: string): string {
  if (locale === "zh-CN") {
    const areaCodes = ["010", "021", "020", "0755", "0571", "028", "027", "025"];
    const area = randElement(areaCodes);
    return `${area}-${randDigits(8)}`;
  }
  return `(${randDigits(3)}) ${randDigits(3)}-${randDigits(4)}`;
}

const BROWSING_DOMAINS_ZH = [
  "baidu.com",
  "zhihu.com",
  "bilibili.com",
  "taobao.com",
  "jd.com",
  "weibo.com",
  "douyin.com",
  "163.com",
  "sohu.com",
  "csdn.net",
  "toutiao.com",
  "xiaohongshu.com",
];

const BROWSING_DOMAINS_EN = [
  "google.com",
  "amazon.com",
  "youtube.com",
  "wikipedia.org",
  "reddit.com",
  "github.com",
  "stackoverflow.com",
  "twitter.com",
  "linkedin.com",
  "medium.com",
  "nytimes.com",
  "bbc.com",
];

const SEARCH_KEYWORDS_ZH = [
  "如何办理签证",
  "附近美食推荐",
  "租房合同注意事项",
  "年度体检套餐",
  "理财产品比较",
  "机票优惠",
  "在线课程推荐",
  "手机维修",
  "天气预报",
  "快递查询",
  "社保缴费查询",
  "二手车估价",
];

const SEARCH_KEYWORDS_EN = [
  "best credit card offers",
  "how to file taxes",
  "nearby pharmacy hours",
  "flight deals to europe",
  "health insurance plans",
  "remote job openings",
  "mortgage calculator",
  "restaurant reviews",
  "weather forecast",
  "online banking login",
  "car insurance quotes",
  "doctor appointment online",
];

function generateFakeBrowsingHistory(locale: string): string {
  const isZh = locale === "zh-CN";
  const domains = isZh ? BROWSING_DOMAINS_ZH : BROWSING_DOMAINS_EN;
  const keywords = isZh ? SEARCH_KEYWORDS_ZH : SEARCH_KEYWORDS_EN;
  const r = randInt(0, 2);
  if (r === 0) {
    return `https://${randElement(domains)}/search?q=${encodeURIComponent(randElement(keywords))}`;
  }
  if (r === 1) {
    return `https://${randElement(domains)}/page/${randAlphaNum(8)}`;
  }
  return randElement(keywords);
}

const MESSAGE_TEMPLATES_ZH = [
  "你好，明天的会议改到下午三点了。",
  "收到，我稍后回复你。",
  "周末有空一起吃饭吗？",
  "文件已发送，请查收。",
  "好的，我已经确认了。",
  "请帮忙转发给相关同事。",
  "谢谢提醒，我马上处理。",
  "这个方案我觉得可以，继续推进吧。",
  "抱歉，刚看到消息。",
  "下周一之前需要提交报告。",
  "已完成，请审核。",
  "我在路上了，大约十分钟到。",
];

const MESSAGE_TEMPLATES_EN = [
  "Hi, the meeting has been rescheduled to 3 PM tomorrow.",
  "Got it, I will get back to you shortly.",
  "Are you free this weekend for dinner?",
  "The file has been sent, please check.",
  "OK, confirmed on my end.",
  "Could you forward this to the team?",
  "Thanks for the reminder, I will handle it right away.",
  "This proposal looks good, let's move forward.",
  "Sorry, just saw your message.",
  "The report is due by next Monday.",
  "Done, please review when you get a chance.",
  "I'm on my way, about ten minutes out.",
];

function generateFakeMessageContent(locale: string): string {
  const templates = locale === "zh-CN" ? MESSAGE_TEMPLATES_ZH : MESSAGE_TEMPLATES_EN;
  return randElement(templates);
}

export function generateFakeValue(type: string, originalValue: string, locale: string): string {
  const t = type.toUpperCase().replace(/[-_\s]+/g, "_");

  switch (t) {
    case "NAME":
    case "SENDER_NAME":
    case "RECIPIENT_NAME":
      return generateFakeName(originalValue, locale);

    case "PHONE":
    case "SENDER_PHONE":
    case "FACILITY_PHONE":
    case "MOBILE":
      return generateFakePhone(originalValue, locale);

    case "LANDLINE":
      return generateFakeLandline(locale);

    case "ADDRESS":
      return generateFakeAddress(locale);

    case "EMAIL":
    case "SENDER_EMAIL":
    case "RECIPIENT_EMAIL":
    case "EMAIL_FROM":
    case "EMAIL_TO":
    case "FROM_EMAIL":
    case "TO_EMAIL":
      return generateFakeEmail(originalValue);

    case "ID":
    case "ID_CARD":
    case "ID_NUMBER":
      return generateFakeId(locale);

    case "CARD":
    case "BANK_CARD":
    case "CARD_NUMBER":
      return generateFakeCard();

    case "SECRET":
    case "PASSWORD":
    case "CREDENTIAL":
      return generateFakeSecret(originalValue);

    case "API_KEY":
      return generateFakeApiKeyWithPrefix(originalValue);

    case "TOKEN":
      return generateFakeSecret(originalValue);

    case "ACCESS_KEY":
    case "AK":
    case "AWS_KEY":
    case "AWS_ACCESS_KEY":
      return generateFakeAccessKey();

    case "SECRET_KEY":
    case "SK":
    case "AWS_SECRET":
    case "AWS_SECRET_KEY":
      return generateFakeSecretKey();

    case "JWT":
    case "JWT_TOKEN":
    case "BEARER_TOKEN":
      return generateFakeJwt();

    case "RSA_PRIVATE_KEY":
    case "PRIVATE_KEY":
    case "RSA_KEY":
      return generateFakeRsaPrivateKey();

    case "RSA_PUBLIC_KEY":
    case "PUBLIC_KEY":
      return generateFakeRsaPublicKey();

    case "CERTIFICATE":
    case "CERT":
    case "X509":
    case "X509_CERT":
    case "HTTPS_CERT":
    case "SSL_CERT":
    case "TLS_CERT":
      return generateFakeCertificate();

    case "SSH_KEY":
    case "SSH_PUBLIC_KEY":
      return generateFakeSshKey();

    case "DB_CONNECTION":
    case "CONNECTION_STRING":
    case "DATABASE_URL":
      return generateFakeConnectionString();

    case "ENV_VAR":
    case "ENV_VARIABLE":
      return generateFakeEnvVar(originalValue);

    case "IP":
    case "IP_ADDRESS":
    case "SERVER_IP":
    case "DB_HOST":
    case "DATABASE_HOST":
      return generateFakeIp();

    case "LICENSE_PLATE":
    case "PLATE":
      return generateFakePlate(locale);

    case "COMPANY":
    case "COMPANY_NAME":
    case "ORGANIZATION":
    case "ORG":
      return generateFakeCompany(locale);

    case "USCC":
    case "UNIFIED_SOCIAL_CREDIT_CODE":
      return generateFakeUscc();

    case "TAX_ID":
    case "TAX_NUMBER":
      return generateFakeTaxId(locale);

    case "BANK_ACCOUNT":
    case "ACCOUNT_NUMBER":
      return generateFakeBankAccount(locale);

    case "DOMAIN":
    case "WEBSITE":
    case "SERVER":
    case "SMTP_SERVER":
    case "MAIL_SERVER":
    case "HOST":
    case "HOSTNAME":
      return generateFakeDomain();

    case "URL":
      return generateFakeUrl();

    case "JOB_TITLE":
    case "POSITION":
    case "TITLE":
      return generateFakeJobTitle(locale);

    case "DEPARTMENT":
    case "DEPT":
      return generateFakeDepartment(locale);

    case "BIZ_LICENSE":
    case "BUSINESS_LICENSE":
      return generateFakeBizLicense();

    case "ORG_CODE":
    case "ORGANIZATION_CODE":
      return generateFakeOrgCode();

    case "PAYMENT":
    case "PAYMENT_ACCOUNT":
      return generateFakePayment(locale);

    case "BIRTHDAY":
    case "DOB":
    case "DATE_OF_BIRTH":
      return generateFakeBirthday();

    case "DATE":
      return generateFakeDate();

    case "TIME":
      return generateFakeTime();

    case "SALARY":
    case "INCOME":
    case "WAGE":
      return generateFakeSalary(locale);

    case "AMOUNT":
    case "PRICE":
    case "COST":
      return generateFakeAmount(locale);

    case "DELIVERY":
    case "COURIER_NUMBER":
    case "COURIER_NO":
    case "COURIER_CODE":
    case "TRACKING_NUMBER":
      return generateFakeDelivery();

    case "ACCESS_CODE":
    case "GATE_CODE":
    case "DOOR_CODE":
    case "PIN":
      return generateFakeAccessCode();

    case "PASSPORT":
    case "PASSPORT_NUMBER":
      return generateFakePassport(locale);

    case "DRIVER_LICENSE":
    case "DRIVERS_LICENSE":
    case "DL":
      return generateFakeDriverLicense(locale);

    case "SSN":
      return `${randDigits(3)}-${randDigits(2)}-${randDigits(4)}`;

    case "NOTE":
    case "REMARK":
    case "MEMO":
      return generateFakeNote();

    case "ORDER":
    case "ORDER_NUMBER":
    case "ORDER_ID":
      return generateFakeOrderNumber();

    case "CONTRACT":
    case "CONTRACT_NUMBER":
    case "CONTRACT_ID":
      return generateFakeContractNumber();

    case "INVOICE":
    case "INVOICE_NUMBER":
    case "INVOICE_ID":
      return generateFakeInvoiceNumber(locale);

    case "CUSTOMER_ID":
    case "CUSTOMER_NUMBER":
    case "CLIENT_ID":
      return generateFakeCustomerId();

    case "TRANSACTION":
    case "TRANSACTION_ID":
    case "TXN_ID":
      return generateFakeTransactionId();

    case "RECEIPT":
    case "RECEIPT_NUMBER":
    case "RECEIPT_ID":
      return generateFakeReceiptNumber();

    case "SKU":
    case "ITEM_CODE":
    case "PRODUCT_CODE":
      return generateFakeSku();

    case "PRODUCT":
    case "PRODUCT_NAME":
    case "ITEM_NAME":
      return generateFakeProductName(locale);

    case "PROJECT":
    case "PROJECT_CODE":
    case "PROJECT_ID":
      return generateFakeProjectCode();

    case "EMPLOYEE_ID":
    case "STAFF_ID":
    case "WORKER_ID":
      return generateFakeEmployeeId();

    case "ETHNICITY":
    case "RACE":
    case "ETHNIC_ORIGIN":
      return generateFakeEthnicity(locale);

    case "RELIGION":
    case "RELIGIOUS_BELIEF":
    case "PHILOSOPHICAL_BELIEF":
      return generateFakeReligion(locale);

    case "POLITICAL_OPINION":
    case "POLITICAL_AFFILIATION":
    case "POLITICAL_PARTY":
      return generateFakePoliticalAffiliation(locale);

    case "UNION_MEMBERSHIP":
    case "TRADE_UNION":
      return generateFakeUnionMembership(locale);

    case "HEALTH":
    case "HEALTH_CONDITION":
    case "MEDICAL_CONDITION":
    case "DIAGNOSIS":
      return generateFakeHealthCondition(locale);

    case "MEDICATION":
    case "PRESCRIPTION":
    case "DRUG":
      return generateFakeMedication(locale);

    case "BIOMETRIC":
    case "BIOMETRIC_ID":
    case "FINGERPRINT":
    case "FACE_ID":
    case "VOICEPRINT":
      return generateFakeBiometricId();

    case "GENETIC":
    case "GENETIC_DATA":
    case "GENETIC_MARKER":
    case "DNA":
      return generateFakeGeneticMarker();

    case "SEXUAL_ORIENTATION":
    case "SEXUALITY":
      return generateFakeSexualOrientation(locale);

    case "CRIMINAL_RECORD":
    case "CONVICTION":
    case "OFFENSE":
      return generateFakeCriminalRecord(locale);

    case "GENDER":
    case "SEX":
      return generateFakeGender(locale);

    case "AGE":
      return generateFakeAge();

    case "BIRTH_PLACE":
    case "PLACE_OF_BIRTH":
    case "BIRTHPLACE":
      return generateFakeBirthPlace(locale);

    case "NATIONALITY":
    case "CITIZENSHIP":
    case "IMMIGRATION_STATUS":
      return generateFakeNationality(locale);

    case "MEDICAL_RECORD_NUMBER":
    case "MRN":
    case "PATIENT_ID":
      return generateFakeMedicalRecordNumber();

    case "HEALTH_PLAN_ID":
    case "HEALTH_PLAN_NUMBER":
    case "MEDICARE_ID":
    case "MEDICAID_ID":
      return generateFakeHealthPlanId();

    case "INSURANCE_NUMBER":
    case "INSURANCE_ID":
    case "POLICY_NUMBER":
      return generateFakeInsuranceNumber();

    case "DEVICE_ID":
    case "DEVICE_IDENTIFIER":
    case "SERIAL_NUMBER":
    case "IMEI":
    case "MAC_ADDRESS":
      return generateFakeDeviceId();

    case "GEO_COORDINATES":
    case "GPS":
    case "LATITUDE_LONGITUDE":
    case "LOCATION":
    case "GEOLOCATION":
      return generateFakeGeoCoordinates();

    case "COOKIE_ID":
    case "TRACKING_ID":
    case "ADVERTISING_ID":
    case "DEVICE_FINGERPRINT":
      return generateFakeCookieId();

    case "STUDENT_ID":
    case "STUDENT_NUMBER":
      return generateFakeStudentId();

    case "CREDIT_SCORE":
    case "CREDIT_RATING":
    case "FICO_SCORE":
      return generateFakeCreditScore();

    case "LOAN_NUMBER":
    case "LOAN_ID":
    case "MORTGAGE_NUMBER":
      return generateFakeLoanNumber();

    case "FAX":
    case "FAX_NUMBER":
      return generateFakeFaxNumber(locale);

    case "USERNAME":
    case "ACCOUNT_NAME":
    case "SCREEN_NAME":
    case "HANDLE":
      return generateFakeUsername();

    case "SIGNATURE":
    case "DIGITAL_SIGNATURE":
      return generateFakeSignature(locale);

    case "BROWSING_HISTORY":
    case "SEARCH_HISTORY":
    case "SEARCH_QUERY":
    case "BROWSING_DATA":
    case "WEB_HISTORY":
      return generateFakeBrowsingHistory(locale);

    case "MESSAGE_CONTENT":
    case "COMMUNICATION":
    case "SMS_CONTENT":
    case "EMAIL_CONTENT":
    case "CHAT_MESSAGE":
    case "MAIL_BODY":
      return generateFakeMessageContent(locale);

    default: {
      if (t.includes("EMAIL") || t.includes("MAIL_ADDRESS"))
        return generateFakeEmail(originalValue);
      if (t.includes("PHONE") || t.includes("MOBILE") || t.includes("TEL"))
        return generateFakePhone(originalValue, locale);
      if (t.includes("IP") || t.includes("HOST") || t.includes("SERVER"))
        return generateFakeDomain();
      if (t.includes("PORT")) return `${randInt(1024, 65535)}`;
      if (t.includes("PASSWORD") || t.includes("SECRET") || t.includes("CREDENTIAL"))
        return generateFakeSecret(originalValue);
      if (t.includes("NAME") && !t.includes("FILE") && !t.includes("TABLE"))
        return generateFakeName(originalValue, locale);
      if (t.includes("ADDRESS") || t.includes("ADDR")) return generateFakeAddress(locale);
      if (t.includes("URL") || t.includes("LINK")) return generateFakeUrl();
      if (t.includes("DOMAIN")) return generateFakeDomain();
      if (t.includes("KEY") || t.includes("TOKEN")) return generateFakeSecret(originalValue);
      return `[FAKE:${t}:${randHex(4)}]`;
    }
  }
}
