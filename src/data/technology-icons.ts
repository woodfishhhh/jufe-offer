const BLOG_TECH_LOGOS: Record<string, string> = {
  Java: "https://blog.woodfish.site/remote-assets/36acd4efa4d1d541c1fa648a3aaf8a4ad54a18ed.svg",
  Docker:
    "https://blog.woodfish.site/remote-assets/e416886de9f85b2910d1e75bc2d92b60697c0496.svg",
  "Node.js":
    "https://blog.woodfish.site/remote-assets/d13efe560eb5a67abbed2fd481abe2069bc49918.svg",
  React:
    "https://blog.woodfish.site/remote-assets/62f0ebaf4ba438003f32bf99fb43d9ac487d663b.svg",
  "Next.js":
    "https://blog.woodfish.site/remote-assets/672aa8db55ec35aae1db006f948ae9346e4ca039.svg",
  MySQL:
    "https://blog.woodfish.site/remote-assets/41924b1961f5675efe543d7de454f6897d1c8271.svg",
  Vite: "https://blog.woodfish.site/remote-assets/11d81b29e2f4a4bd013b01f63c22dda5737a9f5d.svg",
  "Tailwind CSS":
    "https://blog.woodfish.site/remote-assets/7447b22e61cee91633ed1e6095d9731bd6ba9828.svg",
  TypeScript:
    "https://blog.woodfish.site/remote-assets/1a07db62f56ca3b41207d606cf6e53771a82010d.svg",
  Python:
    "https://blog.woodfish.site/remote-assets/e5e1378c33ede079a823d7983f337e835260d56e.svg",
  Vue: "https://blog.woodfish.site/remote-assets/d27c46d2f7128f9080768bd730235d1e3402cb67.svg",
  CSS: "https://blog.woodfish.site/remote-assets/103f75839cd4eea0a0a3c6997435c0671bd86932.svg",
  JavaScript:
    "https://blog.woodfish.site/remote-assets/df4206fdd68ca85c54a2e5cb1f4b4953cbe9bd8b.svg",
  HTML: "https://blog.woodfish.site/remote-assets/4e9cded7e8264953a331dc8616375c7133563267.svg",
  Git: "https://blog.woodfish.site/remote-assets/56bfb128472d4a65b8886958bb690bb567afe27d.svg",
  C: "https://blog.woodfish.site/remote-assets/1329930c647581f5e38816ff8b286526aa68b3d8.svg",
  "C++":
    "https://blog.woodfish.site/remote-assets/a1598829e092549f688b4d08e34e5d858d15566f.svg",
  Kubernetes:
    "https://blog.woodfish.site/remote-assets/a265d84a7f7f8edaf4b551a3d36f82cbc36e36f0.svg",
  Playwright:
    "https://blog.woodfish.site/remote-assets/9803b20dbaae6f7fe0009b6cd617ee945885ec86.svg",
  "Three.js":
    "https://blog.woodfish.site/remote-assets/1d45e27d8501242fa3bb488364e219417f7d3a8f.svg",
  "shadcn/ui":
    "https://blog.woodfish.site/remote-assets/e0e6716d0173bcce73b6b203ca6c34a74a731b15.svg",
  "Matter.js":
    "https://blog.woodfish.site/remote-assets/243f536c3c4e8cfae58cd2bcf9ad4a4052989d7e.svg",
  GSAP: "https://blog.woodfish.site/asset/gsap.svg",
  PostgreSQL:
    "https://blog.woodfish.site/remote-assets/ea435dbc4a747a98b84e721cfa8aff9d10969177.svg",
  Redis:
    "https://blog.woodfish.site/remote-assets/814036b11679118076d13fd074bd098036cc120a.svg",
};

const ICONIFY_TECH_LOGOS: Record<string, string> = {
  Go: "simple-icons:go",
  Spring: "simple-icons:spring",
  Gin: "simple-icons:gin",
  FastAPI: "simple-icons:fastapi",
  Linux: "simple-icons:linux",
  Nginx: "simple-icons:nginx",
  HTTP: "simple-icons:httpie",
  Kafka: "simple-icons:apachekafka",
  Kotlin: "simple-icons:kotlin",
  "Android Studio": "simple-icons:androidstudio",
  Gradle: "simple-icons:gradle",
  Compose: "simple-icons:jetpackcompose",
  Material: "simple-icons:materialdesign",
  Jetpack: "simple-icons:android",
  Play: "simple-icons:googleplay",
  JUnit: "simple-icons:junit5",
  Firebase: "simple-icons:firebase",
  Terraform: "simple-icons:terraform",
  Ansible: "simple-icons:ansible",
  Prometheus: "simple-icons:prometheus",
  Grafana: "simple-icons:grafana",
  Helm: "simple-icons:helm",
  "Argo CD": "simple-icons:argo",
  AWS: "logos:aws",
  Vault: "simple-icons:vault",
  OWASP: "simple-icons:owasp",
  Excel: "simple-icons:microsoftexcel",
  Pandas: "simple-icons:pandas",
  Tableau: "simple-icons:tableau",
  "Power BI": "simple-icons:powerbi",
  NumPy: "simple-icons:numpy",
  Jupyter: "simple-icons:jupyter",
  PyTorch: "simple-icons:pytorch",
  "Hugging Face": "simple-icons:huggingface",
  LangChain: "simple-icons:langchain",
  R: "logos:r-lang",
  "Scikit-learn": "simple-icons:scikitlearn",
  Matplotlib: "simple-icons:python",
  Seaborn: "simple-icons:python",
  Spark: "simple-icons:apachespark",
  Flink: "simple-icons:apacheflink",
  Airflow: "simple-icons:apacheairflow",
  dbt: "simple-icons:dbt",
  Hadoop: "simple-icons:apachehadoop",
  MLflow: "simple-icons:mlflow",
  ONNX: "simple-icons:onnx",
  Kubeflow: "devicon:kubeflow",
  Figma: "simple-icons:figma",
  Oracle: "simple-icons:oracle",
  MongoDB: "simple-icons:mongodb",
  Swift: "simple-icons:swift",
  Xcode: "simple-icons:xcode",
  SwiftUI: "simple-icons:swift",
  UIKit: "simple-icons:apple",
  "App Store": "simple-icons:appstore",
  StoreKit: "simple-icons:appstore",
  Solidity: "simple-icons:solidity",
  Ethereum: "simple-icons:ethereum",
  Hardhat: "devicon:hardhat",
  IPFS: "simple-icons:ipfs",
  "The Graph": "cryptocurrency:grt",
  "Web3.js": "simple-icons:web3dotjs",
  Pytest: "simple-icons:pytest",
  Selenium: "simple-icons:selenium",
  Postman: "simple-icons:postman",
  JMeter: "simple-icons:apachejmeter",
  Appium: "simple-icons:appium",
  "Burp Suite": "simple-icons:burpsuite",
  Metasploit: "simple-icons:metasploit",
  Wireshark: "simple-icons:wireshark",
  Splunk: "simple-icons:splunk",
  Markdown: "simple-icons:markdown",
  Docusaurus: "simple-icons:docusaurus",
  "GitHub Actions": "simple-icons:githubactions",
  OpenAPI: "simple-icons:openapiinitiative",
  "C#": "devicon:csharp",
  Unity: "simple-icons:unity",
  Unreal: "simple-icons:unrealengine",
  DVC: "simple-icons:dvc",
  Jira: "simple-icons:jira",
  Looker: "simple-icons:looker",
  GitHub: "simple-icons:github",
  "Cisco IOS": "simple-icons:cisco",
  Juniper: "simple-icons:junipernetworks",
  Nmap: "lucide:scan-line",
  Nuxt: "simple-icons:nuxt",
  Webpack: "simple-icons:webpack",
  Sass: "simple-icons:sass",
  Less: "simple-icons:less",
  Redux: "simple-icons:redux",
  Pinia: "simple-icons:pinia",
  TanStack: "simple-icons:tanstack",
  Storybook: "simple-icons:storybook",
  Vitest: "simple-icons:vitest",
  "Spring Boot": "simple-icons:springboot",
  Express: "simple-icons:express",
  RabbitMQ: "simple-icons:rabbitmq",
  GraphQL: "simple-icons:graphql",
  Prisma: "simple-icons:prisma",
  Hono: "simple-icons:hono",
  Drizzle: "simple-icons:drizzle",
  Turborepo: "simple-icons:turborepo",
  "Jetpack Compose": "simple-icons:jetpackcompose",
  Ktor: "simple-icons:ktor",
  Bash: "simple-icons:gnubash",
  Jenkins: "simple-icons:jenkins",
  Azure: "logos:microsoft-azure",
  "Google Cloud": "simple-icons:googlecloud",
  Packer: "simple-icons:packer",
  Pulumi: "simple-icons:pulumi",
  SonarQube: "simple-icons:sonarqubecloud",
  Snyk: "simple-icons:snyk",
  Trivy: "simple-icons:trivy",
  Semgrep: "material-icon-theme:semgrep",
  Falco: "simple-icons:falco",
  DuckDB: "simple-icons:duckdb",
  BigQuery: "simple-icons:googlebigquery",
  Snowflake: "simple-icons:snowflake",
  "Apache Superset": "simple-icons:apachesuperset",
  Metabase: "simple-icons:metabase",
  TensorFlow: "simple-icons:tensorflow",
  LlamaIndex: "thesvg-color:llamaindex",
  Ollama: "simple-icons:ollama",
  Pydantic: "simple-icons:pydantic",
  Qdrant: "simple-icons:qdrant",
  Pinecone: "logos:pinecone",
  Weaviate: "selfhst:weaviate",
  SciPy: "simple-icons:scipy",
  Plotly: "simple-icons:plotly",
  Databricks: "simple-icons:databricks",
  Hive: "simple-icons:hive",
  Trino: "simple-icons:trino",
  Ray: "simple-icons:ray",
  Sketch: "simple-icons:sketch",
  "Adobe XD": "logos:adobe-xd",
  Illustrator: "logos:adobe-illustrator",
  Photoshop: "logos:adobe-photoshop",
  Framer: "simple-icons:framer",
  Rive: "simple-icons:rive",
  "After Effects": "logos:adobe-after-effects",
  Lottie: "simple-icons:lottiefiles",
  Miro: "simple-icons:miro",
  Zeplin: "logos:zeplin",
  Maze: "simple-icons:maze",
  Hotjar: "simple-icons:hotjar",
  Notion: "simple-icons:notion",
  Dovetail: "simple-icons:dovetail",
  MariaDB: "simple-icons:mariadb",
  Cassandra: "simple-icons:apachecassandra",
  Elasticsearch: "simple-icons:elasticsearch",
  ClickHouse: "simple-icons:clickhouse",
  pgAdmin: "selfhst:pgadmin",
  DBeaver: "simple-icons:dbeaver",
  DataGrip: "simple-icons:datagrip",
  Percona: "logos:percona",
  "Objective-C": "material-icon-theme:objective-c",
  CocoaPods: "simple-icons:cocoapods",
  Fastlane: "simple-icons:fastlane",
  Realm: "logos:realm",
  OpenZeppelin: "simple-icons:openzeppelin",
  Chainlink: "simple-icons:chainlink",
  MetaMask: "logos:metamask",
  Alchemy: "simple-icons:alchemy",
  Ganache: "logos:ganache",
  Rust: "simple-icons:rust",
  Solana: "simple-icons:solana",
  Polygon: "simple-icons:polygon",
  Cypress: "simple-icons:cypress",
  Jest: "simple-icons:jest",
  k6: "simple-icons:k6",
  Cucumber: "simple-icons:cucumber",
  Allure: "vscode-icons:file-type-allure",
  BrowserStack: "logos:browserstack",
  "Sauce Labs": "simple-icons:saucelabs",
  "Kali Linux": "simple-icons:kalilinux",
  Nessus: "file-icons:nessus",
  OpenVAS: "selfhst:openvas",
  "Elastic Stack": "simple-icons:elasticstack",
  Snort: "simple-icons:snort",
  YARA: "file-icons:yara",
  Hashcat: "simple-icons:hashcat",
  Ghidra: "devicon:ghidra",
  Sphinx: "simple-icons:sphinx",
  Swagger: "simple-icons:swagger",
  Mermaid: "simple-icons:mermaid",
  PlantUML: "vscode-icons:file-type-plantuml",
  Vale: "vscode-icons:file-type-vale",
  Grammarly: "simple-icons:grammarly",
  "VS Code": "devicon:vscode",
  Confluence: "simple-icons:confluence",
  ReadMe: "simple-icons:readme",
  AsciiDoc: "simple-icons:asciidoctor",
  Godot: "simple-icons:godotengine",
  Blender: "simple-icons:blender",
  Maya: "simple-icons:autodeskmaya",
  "3ds Max": "devicon:3dsmax",
  "Substance 3D Painter": "thesvg-color:substance-3d-painter",
  FMOD: "simple-icons:fmod",
  Wwise: "simple-icons:wwise",
  OpenGL: "simple-icons:opengl",
  Vulkan: "simple-icons:vulkan",
  HLSL: "vscode-icons:file-type-hlsl",
  GLSL: "vscode-icons:file-type-glsl",
  Perforce: "simple-icons:perforce",
  Rider: "simple-icons:rider",
  Erlang: "simple-icons:erlang",
  Elixir: "simple-icons:elixir",
  BentoML: "simple-icons:bentoml",
  Productboard: "logos:productboard",
  Linear: "bxl:linear-app",
  Trello: "simple-icons:trello",
  Asana: "simple-icons:asana",
  Slack: "logos:slack",
  Amplitude: "logos:amplitude",
  Mixpanel: "simple-icons:mixpanel",
  "Google Analytics": "simple-icons:googleanalytics",
  GitLab: "simple-icons:gitlab",
  "Microsoft Teams": "logos:microsoft-teams",
  Zoom: "simple-icons:zoom",
  Datadog: "simple-icons:datadog",
  Sentry: "simple-icons:sentry",
  PagerDuty: "simple-icons:pagerduty",
  Opsgenie: "simple-icons:opsgenie",
  Discord: "simple-icons:discord",
  X: "simple-icons:x",
  YouTube: "simple-icons:youtube",
  Twitch: "simple-icons:twitch",
  "OBS Studio": "simple-icons:obsstudio",
  Vercel: "simple-icons:vercel",
  Netlify: "simple-icons:netlify",
  Plausible: "simple-icons:plausibleanalytics",
  HubSpot: "simple-icons:hubspot",
  Redshift: "logos:aws-redshift",
  MicroStrategy: "simple-icons:microstrategy",
  Junos: "file-icons:junos",
  GNS3: "selfhst:gns3",
  Zabbix: "logos:zabbix",
  Nagios: "selfhst:nagios",
  NetBox: "devicon:netbox",
  pfSense: "simple-icons:pfsense",
  Fortinet: "simple-icons:fortinet",
  "Palo Alto Networks": "simple-icons:paloaltonetworks",
  Dagger: "mdi:dagger",
  "D3.js": "simple-icons:d3",
  "OpenAI API": "simple-icons:openai",
  "Anthropic API": "simple-icons:anthropic",
  "Hyperledger Fabric": "simple-icons:hyperledger",
  "draw.io": "simple-icons:diagramsdotnet",
  "itch.io": "simple-icons:itchdotio",
  "SAP Analytics Cloud": "simple-icons:sap",
  "Palantir Foundry": "simple-icons:palantir",
  "NVIDIA CUDA": "simple-icons:nvidia",
  "NVIDIA Triton": "simple-icons:nvidia",
  ".NET": "simple-icons:dotnet",
  DirectX: "simple-icons:microsoft",
  "Qlik Sense": "simple-icons:qlik",
  Angular: "simple-icons:angular",
  Svelte: "simple-icons:svelte",
  Astro: "simple-icons:astro",
  SolidJS: "logos:solidjs",
  Qwik: "simple-icons:qwik",
  jQuery: "simple-icons:jquery",
  Bootstrap: "simple-icons:bootstrap",
  "Material UI": "logos:material-ui",
  GSAP: "simple-icons:gsap",
  ECharts: "simple-icons:apacheecharts",
  Axios: "simple-icons:axios",
  Zustand: "devicon:zustand",
  MobX: "simple-icons:mobx",
  RxJS: "devicon:rxjs",
  "React Router": "simple-icons:reactrouter",
  Rollup: "simple-icons:rollupdotjs",
  esbuild: "simple-icons:esbuild",
  SWC: "simple-icons:swc",
  Babel: "simple-icons:babel",
  ESLint: "simple-icons:eslint",
  Prettier: "simple-icons:prettier",
  pnpm: "simple-icons:pnpm",
  npm: "simple-icons:npm",
  Yarn: "simple-icons:yarn",
  gRPC: "logos:grpc",
  Bun: "simple-icons:bun",
  SQLite: "simple-icons:sqlite",
  "Material Design": "simple-icons:materialdesign",
  Coil: "simple-icons:recoil",
  Glide: "simple-icons:glide",
  CircleCI: "simple-icons:circleci",
  "Travis CI": "simple-icons:travisci",
  Nomad: "simple-icons:nomad",
  Consul: "simple-icons:consul",
  OpenTelemetry: "simple-icons:opentelemetry",
  Cloudflare: "simple-icons:cloudflare",
  SQL: "simple-icons:sqlite",
  vLLM: "simple-icons:vllm",
  Dask: "simple-icons:dask",
  Streamlit: "simple-icons:streamlit",
  Gradio: "simple-icons:gradio",
  "Amazon S3": "selfhst:amazon-s3",
  MinIO: "simple-icons:minio",
  Druid: "simple-icons:apachedruid",
  NiFi: "simple-icons:apachenifi",
  Pulsar: "simple-icons:apachepulsar",
  Canva: "simple-icons:canvas",
  Webflow: "simple-icons:webflow",
  LottieFiles: "simple-icons:lottiefiles",
  "Adobe Fonts": "thesvg-color:adobe-fonts",
  "Font Awesome": "simple-icons:fontawesome",
  "SQL Server": "devicon:microsoftsqlserver",
  Liquibase: "simple-icons:liquibase",
  Flyway: "simple-icons:flyway",
  Foundry: "simple-icons:cloudfoundry",
  Bitcoin: "simple-icons:bitcoin",
  Cosmos: "devicon:cosmosdb",
  Avalanche: "thesvg-color:avalanche",
  Optimism: "simple-icons:optimism",
  Base: "simple-icons:baseui",
  Truffle: "logos:truffle",
  Wagmi: "simple-icons:wagmi",
  Katalon: "logos:katalon",
  "Robot Framework": "simple-icons:robotframework",
  Puppeteer: "simple-icons:puppeteer",
  Lighthouse: "simple-icons:lighthouse",
  Axe: "vscode-icons:file-type-haxe",
  Percy: "simple-icons:percy",
  Chromatic: "simple-icons:chromatic",
  "Adobe Illustrator": "logos:adobe-illustrator",
  "Adobe Photoshop": "logos:adobe-photoshop",
  MkDocs: "simple-icons:materialformkdocs",
  Antora: "selfhst:antora",
  GitBook: "simple-icons:gitbook",
  Slate: "selfhst:clean-slate",
  Stoplight: "logos:stoplight",
  Insomnia: "simple-icons:insomnia",
  Bruno: "simple-icons:bruno",
  Pandoc: "simple-icons:pandoc",
  LaTeX: "simple-icons:latex",
  "Unreal Engine": "simple-icons:unrealengine",
  "Visual Studio": "logos:visual-studio",
  CMake: "simple-icons:cmake",
  Lua: "simple-icons:lua",
  Steamworks: "simple-icons:steamworks",
  WebSocket: "logos:websocket",
  Envoy: "simple-icons:envoyproxy",
  "Google Forms": "simple-icons:googleforms",
  Typeform: "simple-icons:typeform",
  Segment: "logos:segment",
  Heap: "simple-icons:namecheap",
  Optimizely: "logos:optimizely",
  LaunchDarkly: "logos:launchdarkly",
  "New Relic": "simple-icons:newrelic",
  "Google Meet": "simple-icons:googlemeet",
  PostHog: "simple-icons:posthog",
  "Google Sheets": "simple-icons:googlesheets",
  Aruba: "selfhst:hpe-aruba",
  Ubiquiti: "simple-icons:ubiquiti",
  MikroTik: "simple-icons:mikrotik",
  OpenWrt: "simple-icons:openwrt",
  WireGuard: "simple-icons:wireguard",
  OpenVPN: "simple-icons:openvpn",
  SolarWinds: "logos:solarwinds",
};

const TECHNOLOGY_ICON_ALIASES: Record<string, string> = {
  K8s: "Kubernetes",
  Retrofit: "Android Studio",
  Hilt: "Android Studio",
  URLSession: "Xcode",
  XCTest: "Xcode",
  Combine: "Swift",
  Instruments: "Xcode",
  "Argo Workflows": "Argo CD",
  OkHttp: "Android Studio",
  Espresso: "Android Studio",
  "OWASP ZAP": "OWASP",
  Checkov: "Terraform",
  XGBoost: "Python",
  LightGBM: "Python",
  "Apache Iceberg": "Spark",
  "Delta Lake": "Databricks",
  Debezium: "Kafka",
  FigJam: "Figma",
  ProtoPie: "Figma",
  Principle: "Xcode",
  CockroachDB: "PostgreSQL",
  TimescaleDB: "PostgreSQL",
  "Swift Package Manager": "Swift",
  TestFlight: "App Store",
  "App Store Connect": "App Store",
  Alamofire: "Swift",
  RxSwift: "Swift",
  Remix: "Ethereum",
  "Ethers.js": "Ethereum",
  Infura: "Ethereum",
  Newman: "Postman",
  TestNG: "Java",
  "Charles Proxy": "Postman",
  Suricata: "Kali Linux",
  Volatility: "Python",
  "John the Ripper": "Kali Linux",
  "Optimal Workshop": "Figma",
  "Axure RP": "Figma",
  Balsamiq: "Figma",
  Redoc: "OpenAPI",
  Agones: "Kubernetes",
  Feast: "Python",
  KServe: "Kubernetes",
  "Aha!": "Productboard",
  StreamYard: "YouTube",
  "EVE-NG": "Cisco IOS",
  "Packet Tracer": "Cisco IOS",
  SvelteKit: "Svelte",
  "Vue Router": "Vue",
  Room: "Android Studio",
  "Android SDK": "Android Studio",
  RxJava: "Java",
  Koin: "Kotlin",
  Detekt: "Kotlin",
  MockK: "Kotlin",
  Robolectric: "Android Studio",
  LeakCanary: "Android Studio",
  "Firebase App Distribution": "Firebase",
  "GitLab CI": "GitLab",
  Statsmodels: "Python",
  "Apache Beam": "Spark",
  Spline: "Figma",
  "Oracle Cloud": "Oracle",
  "Core Data": "Xcode",
  SwiftLint: "Swift",
  SwiftFormat: "Swift",
  SnapKit: "Swift",
  Kingfisher: "Swift",
  Viem: "Ethereum",
  Arbitrum: "Ethereum",
  Fiddler: "Postman",
  UserTesting: "Figma",
  RenderDoc: "C++",
  "NVIDIA Nsight": "NVIDIA CUDA",
  FullStory: "Google Analytics",
  DAX: "Power BI",
  "Power Query": "Excel",
  "Amazon QuickSight": "AWS",
  "Oracle Analytics": "Oracle",
  "Looker Studio": "Looker",
  "Cisco Meraki": "Cisco IOS",
  FRRouting: "Linux",
  PRTG: "Prometheus",
  Cosign: "Kubernetes",
};

const HOSTED_TECH_LOGOS: Record<string, string> = {
  "https://api.iconify.design/bxl:linear-app.svg":
    "https://img.woodfish.site/o/webp/2026/08/103eb08494dbdbf43f3d9b56efdacdb9183646b4052886a5f2495281ecf928c4.webp",
  "https://api.iconify.design/cryptocurrency:grt.svg":
    "https://img.woodfish.site/o/webp/2026/08/b5cb0be1803beceaa1ee56212a2632e6d83b7c07fa4cac288c7a215d802dbbed.webp",
  "https://api.iconify.design/devicon:3dsmax.svg":
    "https://img.woodfish.site/o/webp/2026/08/70003a7d9136878cc4c5644f3288d9d75f9e852b086bfe107f48035732daa2d0.webp",
  "https://api.iconify.design/devicon:cosmosdb.svg":
    "https://img.woodfish.site/o/webp/2026/08/c38554f1aadb9439554bb59ca6ff49cf66e0203873e12af81af65bf9368ae03e.webp",
  "https://api.iconify.design/devicon:csharp.svg":
    "https://img.woodfish.site/o/webp/2026/08/848c8e809bd9306c778c542852ca398a3308ae51c9a42ec10ce41fe75b679c59.webp",
  "https://api.iconify.design/devicon:ghidra.svg":
    "https://img.woodfish.site/o/webp/2026/08/b2fd96dff53608afcafba2f5764f284cb003a398c78f5eb00d93078badbd70dc.webp",
  "https://api.iconify.design/devicon:hardhat.svg":
    "https://img.woodfish.site/o/webp/2026/08/e0e99c36341c194f087905d12ce59ad2c3e39853eca4c5961f6be96a1c46c006.webp",
  "https://api.iconify.design/devicon:kubeflow.svg":
    "https://img.woodfish.site/o/webp/2026/08/37c91f6960813653fc8b2a453165eb8ac50faf791b6ffb961cdc166a2340c939.webp",
  "https://api.iconify.design/devicon:microsoftsqlserver.svg":
    "https://img.woodfish.site/o/webp/2026/08/6aa48e3c708f7dfa86a2f9b1c240d23a2c07709584453f87925ccab8cb97c8bb.webp",
  "https://api.iconify.design/devicon:netbox.svg":
    "https://img.woodfish.site/o/webp/2026/08/c282f6c5a25a3e7ddc876922f669dd2ab2b4d795053d932899a192c204f355bb.webp",
  "https://api.iconify.design/devicon:rxjs.svg":
    "https://img.woodfish.site/o/webp/2026/08/7aa716c692c7eb9c13811770f918266cbeca4c0f5743ddcf184bfbace145b169.webp",
  "https://api.iconify.design/devicon:vscode.svg":
    "https://img.woodfish.site/o/webp/2026/08/e3365cfea15ce0ab407ccccf5e1a900148cea19246d34324f6fe8e6cc8d18562.webp",
  "https://api.iconify.design/devicon:zustand.svg":
    "https://img.woodfish.site/o/webp/2026/08/de5cce6524549921c44cdb935f12a68c68e6e970cd36d726ae47bd443047f6f1.webp",
  "https://api.iconify.design/file-icons:junos.svg":
    "https://img.woodfish.site/o/webp/2026/08/b546df8f72830f907661f861739a3dcb814f4ed39af988dfd0b61c7e434b2a26.webp",
  "https://api.iconify.design/file-icons:nessus.svg":
    "https://img.woodfish.site/o/webp/2026/08/beac9fc682bbe9d4f882744964f871e0d9c52dd320022ba82fbdcd8f11ac8a17.webp",
  "https://api.iconify.design/file-icons:yara.svg":
    "https://img.woodfish.site/o/webp/2026/08/01084c658b1bd8e3136339ffb28eb900f35089b926705641478e09ac1f5d66e0.webp",
  "https://api.iconify.design/logos:adobe-after-effects.svg":
    "https://img.woodfish.site/o/webp/2026/08/f862fd5bef47fea6d7e8d07098c7fe9c92d8530d0bcbbd2aa3ca9a60a7bcbe49.webp",
  "https://api.iconify.design/logos:adobe-illustrator.svg":
    "https://img.woodfish.site/o/webp/2026/08/80db79976cb8289e8f1982aa79f86add75a35c3e118a7a200fb13805ab5b2c19.webp",
  "https://api.iconify.design/logos:adobe-photoshop.svg":
    "https://img.woodfish.site/o/webp/2026/08/55dbe84b77bd83a1e2f77689562c65d7c2f95d33171b232f22b968118bf8f099.webp",
  "https://api.iconify.design/logos:adobe-xd.svg":
    "https://img.woodfish.site/o/webp/2026/08/71548a17abdf559daaa65ab844b332faf0feb0bebdd5edae64e76a6e132f13fc.webp",
  "https://api.iconify.design/logos:amplitude.svg":
    "https://img.woodfish.site/o/webp/2026/08/27ee2f11d7aae83dc7a7aa6b7a461063122b0adf579d82984c1dde8e6cdf1755.webp",
  "https://api.iconify.design/logos:aws-redshift.svg":
    "https://img.woodfish.site/o/webp/2026/08/d1c68ead26732475078342fb82e8cac80db20ba6e0a8c27c5f7dcc3d166c53c3.webp",
  "https://api.iconify.design/logos:aws.svg":
    "https://img.woodfish.site/o/webp/2026/08/4bac805380a4f12b8286551d4de5d90fb0e92276c0bd2e85a03cf42e512b31b8.webp",
  "https://api.iconify.design/logos:browserstack.svg":
    "https://img.woodfish.site/o/webp/2026/08/b7400ca9afc83f7761afb771b958cab6581837563d4175b87e090e587e860e0d.webp",
  "https://api.iconify.design/logos:ganache.svg":
    "https://img.woodfish.site/o/webp/2026/08/b359ac79992446dace18782afb02ff452b963510e60cfdbca68a82cdc09360a0.webp",
  "https://api.iconify.design/logos:grpc.svg":
    "https://img.woodfish.site/o/webp/2026/08/532d40f0c18ee68ca421a52681a2e9ba384d5ea6086be564d96db59f9fce67d0.webp",
  "https://api.iconify.design/logos:katalon.svg":
    "https://img.woodfish.site/o/webp/2026/08/e0fdde295cf9d0de7e741678c212fb37fe629b2bc6844c24312c24cba2b01c94.webp",
  "https://api.iconify.design/logos:launchdarkly.svg":
    "https://img.woodfish.site/o/webp/2026/08/345a5cf6578a80cf7d1fd08a718b83b7a125b54db5255d0ee1faae5d551a745b.webp",
  "https://api.iconify.design/logos:material-ui.svg":
    "https://img.woodfish.site/o/webp/2026/08/ec223cc0103dc0988cf74b26d273448c5e52f6bf546af396e15817e0f84966c1.webp",
  "https://api.iconify.design/logos:metamask.svg":
    "https://img.woodfish.site/o/webp/2026/08/f69136e01935f15f8f690ffe6d8ea0bff60c988bb760cfe72de35a83d1246ddd.webp",
  "https://api.iconify.design/logos:microsoft-azure.svg":
    "https://img.woodfish.site/o/webp/2026/08/31791f2393c6d7ca19ebe51abc2b423400e07e2ad2380a214b36ea57ea8c9b85.webp",
  "https://api.iconify.design/logos:microsoft-teams.svg":
    "https://img.woodfish.site/o/webp/2026/08/629344027ef94043d45f3efe26f173a172b6db377e0ad0a27c4166cc7cf8a101.webp",
  "https://api.iconify.design/logos:optimizely.svg":
    "https://img.woodfish.site/o/webp/2026/08/f2153776023055537af1762e8a1f59575633f07a9e38d476ebf8b96d687a8092.webp",
  "https://api.iconify.design/logos:percona.svg":
    "https://img.woodfish.site/o/webp/2026/08/e4350fbf5127340e85078db01ec649bc12882d7c36d6f02bceaf41f6511e0325.webp",
  "https://api.iconify.design/logos:pinecone.svg":
    "https://img.woodfish.site/o/webp/2026/08/29c3114ef4db1cfb3e437ca6da2cbe0b18466bbbafbcfe06839490eccb589c44.webp",
  "https://api.iconify.design/logos:productboard.svg":
    "https://img.woodfish.site/o/webp/2026/08/b8607fb3e1da3d846f0baeff610131b9f3e7d07e1d617a637f785d3ea70094a9.webp",
  "https://api.iconify.design/logos:r-lang.svg":
    "https://img.woodfish.site/o/webp/2026/08/1781c363f5cb48d91237ac19b88141827805c04442e5ce37cf70cf71db8accb7.webp",
  "https://api.iconify.design/logos:realm.svg":
    "https://img.woodfish.site/o/webp/2026/08/87912a631a8ae379d7fa3464e56768399fb697a8d29a225d3baabfbe738b28d1.webp",
  "https://api.iconify.design/logos:segment.svg":
    "https://img.woodfish.site/o/webp/2026/08/cc925f24a7299a2b3cc57e6ed7ce11e2c2d29cf980533aff493b483ac9d2ce15.webp",
  "https://api.iconify.design/logos:slack.svg":
    "https://img.woodfish.site/o/webp/2026/08/51a68cd34c900036819fdc2ff76f2d0e4e55da0ba8dc5a0b5a3eea7dd008b31e.webp",
  "https://api.iconify.design/logos:solarwinds.svg":
    "https://img.woodfish.site/o/webp/2026/08/1ee2ae03b3fc25110285c4882e0cf77dec4dea41adf74d25ddfe14bb67680a1d.webp",
  "https://api.iconify.design/logos:solidjs.svg":
    "https://img.woodfish.site/o/webp/2026/08/776e9619e91d03a96bb8bf1a9ab1dfaffc3ab0734ca152ab54935a9cc3b88ce9.webp",
  "https://api.iconify.design/logos:stoplight.svg":
    "https://img.woodfish.site/o/webp/2026/08/4a3018388b5df06a1294560535d8be873c829575f88211108d4772aa189869d6.webp",
  "https://api.iconify.design/logos:truffle.svg":
    "https://img.woodfish.site/o/webp/2026/08/01c1e3c7ffdddac5f3cf9a38ea1336644fb1d107e9a8f92153aea1603fbc394b.webp",
  "https://api.iconify.design/logos:visual-studio.svg":
    "https://img.woodfish.site/o/webp/2026/08/aac23b540c2ba7f97caa354d2f9259229a46ebe41f9df1f7e3f21b0a920c60da.webp",
  "https://api.iconify.design/logos:websocket.svg":
    "https://img.woodfish.site/o/webp/2026/08/9ad4800478a7fdcdfb5b7d090483614c92341dd48367aabdd106929b2880a12f.webp",
  "https://api.iconify.design/logos:zabbix.svg":
    "https://img.woodfish.site/o/webp/2026/08/8708da374cb6b05e27ebb3cf175606479c93e9322a1ccc7bc09908599ad2b424.webp",
  "https://api.iconify.design/logos:zeplin.svg":
    "https://img.woodfish.site/o/webp/2026/08/a3da0839c0c13faf5cb023cb3b0eb5337bff4a780d509556d26c6e82873fc3aa.webp",
  "https://api.iconify.design/lucide:scan-line.svg":
    "https://img.woodfish.site/o/webp/2026/08/5f87ea2166a9cc972dc5f1328f7b9bb2ff876adc6b9a737c9842e244d570c764.webp",
  "https://api.iconify.design/material-icon-theme:objective-c.svg":
    "https://img.woodfish.site/o/webp/2026/08/830c107dbb5e1864ae714b1b1b20292ea8343421a62b7f4a16fa17cdb4a1707e.webp",
  "https://api.iconify.design/material-icon-theme:semgrep.svg":
    "https://img.woodfish.site/o/webp/2026/08/e76bce0a0c1caf59dbde4dac91881d673fd5aa4d8070167dbf5e499852d872f3.webp",
  "https://api.iconify.design/mdi:dagger.svg":
    "https://img.woodfish.site/o/webp/2026/08/12ffa10711692f2e478a04db6db203cebd0384a2a7c440db0f6e480ea10f1eb5.webp",
  "https://api.iconify.design/selfhst:amazon-s3.svg":
    "https://img.woodfish.site/o/webp/2026/08/298d555cd25c1dfb5fb8e3cbfd9d4095bca7e80e2777deee149750c31d52abf0.webp",
  "https://api.iconify.design/selfhst:antora.svg":
    "https://img.woodfish.site/o/webp/2026/08/f03ccc68b7dff5a0f817159712b3c23ee880531eb0cc3e51487db68802915b41.webp",
  "https://api.iconify.design/selfhst:clean-slate.svg":
    "https://img.woodfish.site/o/webp/2026/08/f357351ed1a014c8200295a094e61f5514b2a81fb357b132002d188db7657b51.webp",
  "https://api.iconify.design/selfhst:gns3.svg":
    "https://img.woodfish.site/o/webp/2026/08/aa2b89f00f134387c4f9cc4ebd4ce2e8de6fd36761895c0e2fbf2552f04092f1.webp",
  "https://api.iconify.design/selfhst:hpe-aruba.svg":
    "https://img.woodfish.site/o/webp/2026/08/ffad0b335e7c346c171b282c7b23aa0b58ba8ff68fdedf41bb069a93c296c141.webp",
  "https://api.iconify.design/selfhst:nagios.svg":
    "https://img.woodfish.site/o/webp/2026/08/d95fb865ed8e9223ae239b74c7b4cfe223fa16a422843279b67970857bc48e1b.webp",
  "https://api.iconify.design/selfhst:openvas.svg":
    "https://img.woodfish.site/o/webp/2026/08/8592625d7c54ad17aa394441f9788c7c72f5458a908a38d7884b3d9057ce5fe3.webp",
  "https://api.iconify.design/selfhst:pgadmin.svg":
    "https://img.woodfish.site/o/webp/2026/08/21f3f9393bc9c4c897bf24d5b5031d4aea14fa8b0c22d89810f4247f4a1f80a3.webp",
  "https://api.iconify.design/selfhst:weaviate.svg":
    "https://img.woodfish.site/o/webp/2026/08/e79cbcf83a8577ef5eb89276a7b25adc840d159d16261fec8ff987acd6ddcd13.webp",
  "https://api.iconify.design/simple-icons:alchemy.svg":
    "https://img.woodfish.site/o/webp/2026/08/22ed5f95e1e2fc187e2d04be44f80630f48ce2d9a7973ae36f34b2f2141ca3ce.webp",
  "https://api.iconify.design/simple-icons:androidstudio.svg":
    "https://img.woodfish.site/o/webp/2026/08/1ba526fd6b0baed1f0315aee7c2ecb0699b8fbb8d163e8a40a6d54649876e3e4.webp",
  "https://api.iconify.design/simple-icons:angular.svg":
    "https://img.woodfish.site/o/webp/2026/08/542929012cf8bb5e9706840a3733570ef8e0c9f1ba74d2841cfdbd969531b5be.webp",
  "https://api.iconify.design/simple-icons:ansible.svg":
    "https://img.woodfish.site/o/webp/2026/08/9b8f2ab9bb4f3fbd8fc6a176ff45abf10044aa555f820812e1942720490faba4.webp",
  "https://api.iconify.design/simple-icons:anthropic.svg":
    "https://img.woodfish.site/o/webp/2026/08/7481bfa53cb8d60f57e7b78e92543e253d85647642dcae2dacc583e8ee7f885d.webp",
  "https://api.iconify.design/simple-icons:apacheairflow.svg":
    "https://img.woodfish.site/o/webp/2026/08/b18e1ce1a65fe3006b1b564a23c35044f8d8fe727bcbc9081a8d827dc0c5b6d1.webp",
  "https://api.iconify.design/simple-icons:apachecassandra.svg":
    "https://img.woodfish.site/o/webp/2026/08/33e230436775de05cbe60856a984510af06272998655423b4d27cf714ff1f548.webp",
  "https://api.iconify.design/simple-icons:apachedruid.svg":
    "https://img.woodfish.site/o/webp/2026/08/a7360c44640c21585f65cb8319c0f819b18bd17fb85874e259113f762fcb2e86.webp",
  "https://api.iconify.design/simple-icons:apacheecharts.svg":
    "https://img.woodfish.site/o/webp/2026/08/a0f194f981525e99eb1548d9fb76080689016acd19ce4f921abeb3e6acc0aa2f.webp",
  "https://api.iconify.design/simple-icons:apacheflink.svg":
    "https://img.woodfish.site/o/webp/2026/08/ca96a5ad7b7508a7afce14604615037d723e9f3bdd2f3fdd4bb5655da0643ae2.webp",
  "https://api.iconify.design/simple-icons:apachehadoop.svg":
    "https://img.woodfish.site/o/webp/2026/08/69b12bec1f85329e8bb87184b991bb633929a3e718203aef23d809a5191b6c71.webp",
  "https://api.iconify.design/simple-icons:apachejmeter.svg":
    "https://img.woodfish.site/o/webp/2026/08/b1a935756c3af9a7dcc3c6cea5145a87618bc28a398fab63e3c2b25aa9ef15a0.webp",
  "https://api.iconify.design/simple-icons:apachekafka.svg":
    "https://img.woodfish.site/o/webp/2026/08/14bb614e1ccd1ec629d988cc0418e8b74df2567c0be69dfd1dd35b33e7c5af8d.webp",
  "https://api.iconify.design/simple-icons:apachenifi.svg":
    "https://img.woodfish.site/o/webp/2026/08/e114bf488dda1392a567a7d08e62c4cd46ea06906ce200eaafffa1874900da8b.webp",
  "https://api.iconify.design/simple-icons:apachepulsar.svg":
    "https://img.woodfish.site/o/webp/2026/08/396ea49a85da95b7055f982f17364cb4960cfc893d23b0ae1c51e547ed88d9d1.webp",
  "https://api.iconify.design/simple-icons:apachespark.svg":
    "https://img.woodfish.site/o/webp/2026/08/449b2681eec46a8de9d9d9ae89da71520051c952904230f20c3034a8a4927afa.webp",
  "https://api.iconify.design/simple-icons:apachesuperset.svg":
    "https://img.woodfish.site/o/webp/2026/08/2ec0bc7c51e89866e9512bb882582852a83e575e3685fda6638db1a63a496478.webp",
  "https://api.iconify.design/simple-icons:appium.svg":
    "https://img.woodfish.site/o/webp/2026/08/b759b15612f056092c9f541d328d3d2f8316a9965ddd542cbefdf618bcf9580f.webp",
  "https://api.iconify.design/simple-icons:apple.svg":
    "https://img.woodfish.site/o/webp/2026/08/85071463dcb1a2e691c38cb32ce623983b1828e9c3a51095d75c1cc097c5b9d2.webp",
  "https://api.iconify.design/simple-icons:appstore.svg":
    "https://img.woodfish.site/o/webp/2026/08/87bb1c1eb00d58bc904879b675c5f250c6762661b70f87303c3a7f1a59f1d7ce.webp",
  "https://api.iconify.design/simple-icons:argo.svg":
    "https://img.woodfish.site/o/webp/2026/08/38ebf4a0bf6ea7402758dbc9d29faf1d92fda56862d8ca3e6e8cb2be90670647.webp",
  "https://api.iconify.design/simple-icons:asana.svg":
    "https://img.woodfish.site/o/webp/2026/08/ef62c85acd4be8844c7bb611cff21073c2c821383cfff9371607d301faddb645.webp",
  "https://api.iconify.design/simple-icons:asciidoctor.svg":
    "https://img.woodfish.site/o/webp/2026/08/649c4174e2853ea5031f5836a57631c09a616d4879a14ad34b88315161422c45.webp",
  "https://api.iconify.design/simple-icons:astro.svg":
    "https://img.woodfish.site/o/webp/2026/08/77ded00e9e73013437cbcde44a2441459f69d18efc55c1c08f836e779ab83199.webp",
  "https://api.iconify.design/simple-icons:autodeskmaya.svg":
    "https://img.woodfish.site/o/webp/2026/08/b8a15ee952af865e353ae243e21f95a5c75b2bf193565e43a7b39feafd3b53cd.webp",
  "https://api.iconify.design/simple-icons:axios.svg":
    "https://img.woodfish.site/o/webp/2026/08/74d023825671ed81b3902af98289df746931b8e7b8ef597f99fe1aee7f37a1f6.webp",
  "https://api.iconify.design/simple-icons:babel.svg":
    "https://img.woodfish.site/o/webp/2026/08/358fd3977fcabb3e9e8b30eaadab3ce1615080e1cf171e6932fb2687f762d70e.webp",
  "https://api.iconify.design/simple-icons:baseui.svg":
    "https://img.woodfish.site/o/webp/2026/08/10d0d2041be08729252193ef969144735636b58f46b66729efa9e04533cdd284.webp",
  "https://api.iconify.design/simple-icons:bentoml.svg":
    "https://img.woodfish.site/o/webp/2026/08/c3a1012b7f65e736dc13cb8057fe810b4728b154fea518c36e332199273819be.webp",
  "https://api.iconify.design/simple-icons:bitcoin.svg":
    "https://img.woodfish.site/o/webp/2026/08/f4dc6c9fb0d2ebf8d42cd7b90ccfbfc6373c631f410f979bc83ff963972bfdf4.webp",
  "https://api.iconify.design/simple-icons:blender.svg":
    "https://img.woodfish.site/o/webp/2026/08/70067ef959a9c0f8e6f9f4a9f5341c6648dd35db66d5c93af30f6fd074401620.webp",
  "https://api.iconify.design/simple-icons:bootstrap.svg":
    "https://img.woodfish.site/o/webp/2026/08/88f17187087d0d0da4563640a7f39af65a97760a36c7b19003c4f00e53c9bd36.webp",
  "https://api.iconify.design/simple-icons:bruno.svg":
    "https://img.woodfish.site/o/webp/2026/08/105a49598cccfa9f710aaaedcf6921c660ea051ebcbcbad09578c920a319b271.webp",
  "https://api.iconify.design/simple-icons:bun.svg":
    "https://img.woodfish.site/o/webp/2026/08/636dde6dbd673994b0d5f33e4f86279e5a2b438ca95492085febae4f3c9eea6e.webp",
  "https://api.iconify.design/simple-icons:burpsuite.svg":
    "https://img.woodfish.site/o/webp/2026/08/11a3740cb2994b4141340381a7366bbc46dbfd3d1adb1afe0265d3fa8c0445c0.webp",
  "https://api.iconify.design/simple-icons:canvas.svg":
    "https://img.woodfish.site/o/webp/2026/08/8bc5a087d2fe8490ca491d6410dbd0be8dc52ca20e20feb96348d8f6738de782.webp",
  "https://api.iconify.design/simple-icons:chainlink.svg":
    "https://img.woodfish.site/o/webp/2026/08/3b3d51ecdbf0968744f7d41a7aae141dde106a33f781a87627c141d01feffbdb.webp",
  "https://api.iconify.design/simple-icons:chromatic.svg":
    "https://img.woodfish.site/o/webp/2026/08/894da9f2ee28dcf7e0a23ee8263dc78d9625b8b7a139a520ebe811db1377ecbe.webp",
  "https://api.iconify.design/simple-icons:circleci.svg":
    "https://img.woodfish.site/o/webp/2026/08/581ddb91d300d204fe7d5e8c6425c11cb25bbd73ef382bad2b0321e3744ce7a9.webp",
  "https://api.iconify.design/simple-icons:cisco.svg":
    "https://img.woodfish.site/o/webp/2026/08/9eaa3a175b81a4091895a21f81bd162d2a5cfc8422c14c18b6849172f6e483e7.webp",
  "https://api.iconify.design/simple-icons:clickhouse.svg":
    "https://img.woodfish.site/o/webp/2026/08/40a41dad39d99f81f4d6b5ac07d0a8c77070269e4606af455989e35d7765a7d8.webp",
  "https://api.iconify.design/simple-icons:cloudflare.svg":
    "https://img.woodfish.site/o/webp/2026/08/745f02bb161140f490f7ceefa86374d5617927413dc618e4077fbdbf6120137f.webp",
  "https://api.iconify.design/simple-icons:cloudfoundry.svg":
    "https://img.woodfish.site/o/webp/2026/08/9450e47b28eade82a18f7930de0de9227fec878e45f2812560e38a1e60770693.webp",
  "https://api.iconify.design/simple-icons:cmake.svg":
    "https://img.woodfish.site/o/webp/2026/08/364a2b90accdb607708811ae0496c3999df455598b6a4d8dc8179ace90993746.webp",
  "https://api.iconify.design/simple-icons:cocoapods.svg":
    "https://img.woodfish.site/o/webp/2026/08/f21d63de6a03135838004358257d7229518a8e809294c9826a4a73253c4707d4.webp",
  "https://api.iconify.design/simple-icons:confluence.svg":
    "https://img.woodfish.site/o/webp/2026/08/2c0b8681e52d00d789d8c7a2aa5883501d7d2fe439ea6bae82269c232c36f063.webp",
  "https://api.iconify.design/simple-icons:consul.svg":
    "https://img.woodfish.site/o/webp/2026/08/1bffec2f52893324cb38ac5b6f12fe1c556424e9566fd2aa3ff34b13378ea6fd.webp",
  "https://api.iconify.design/simple-icons:cucumber.svg":
    "https://img.woodfish.site/o/webp/2026/08/1953a7cefe5add70dd395cb48a98a89a6de9b9a8a3cd5570f742598fecaff86c.webp",
  "https://api.iconify.design/simple-icons:cypress.svg":
    "https://img.woodfish.site/o/webp/2026/08/764563c0cf7e3625fa7d847c15c942c39e28dd2e66794efd3fa73231431f44d1.webp",
  "https://api.iconify.design/simple-icons:d3.svg":
    "https://img.woodfish.site/o/webp/2026/08/028b828c0846a72e166d7aa93f53c22d46cb5e00202edcf819a5a2026182321a.webp",
  "https://api.iconify.design/simple-icons:dask.svg":
    "https://img.woodfish.site/o/webp/2026/08/6170fa8c2441af5884fcfeebd05b0ae988488f19ac97ee27d8fbd89c53fc756c.webp",
  "https://api.iconify.design/simple-icons:databricks.svg":
    "https://img.woodfish.site/o/webp/2026/08/5526d8b91915454e4596c4a4a4c35a283c304b608702e83ec954581e3a670439.webp",
  "https://api.iconify.design/simple-icons:datadog.svg":
    "https://img.woodfish.site/o/webp/2026/08/669704718e09f1cc98f3dee2d9903b824d4388c5eedaebfb1984395981fdf530.webp",
  "https://api.iconify.design/simple-icons:datagrip.svg":
    "https://img.woodfish.site/o/webp/2026/08/b8955254f61ee6c942bc19f0d5ef2ab12cc19bc5b4e255f6abb6fa4aea113421.webp",
  "https://api.iconify.design/simple-icons:dbeaver.svg":
    "https://img.woodfish.site/o/webp/2026/08/7b9dd8b7d7c15a71ff7a37801c0f24511631616dca45a3a9ef7bde62ab066fc3.webp",
  "https://api.iconify.design/simple-icons:dbt.svg":
    "https://img.woodfish.site/o/webp/2026/08/2aede13d48601efecb4039a06ab78c0730fe75c4b285ddffc584b62b5dd0c892.webp",
  "https://api.iconify.design/simple-icons:diagramsdotnet.svg":
    "https://img.woodfish.site/o/webp/2026/08/75647a62ebcba545bd93506975441955aec53653e6bfcab31717b77f7e76ccec.webp",
  "https://api.iconify.design/simple-icons:discord.svg":
    "https://img.woodfish.site/o/webp/2026/08/25bb02fd8812f5a9eb176823c23ca023301d61ee2d6326117555b9062a92ea3d.webp",
  "https://api.iconify.design/simple-icons:docusaurus.svg":
    "https://img.woodfish.site/o/webp/2026/08/32a82e4eea1b43035dd6994d6fece9d7e5f472eba815e14f1431080742069214.webp",
  "https://api.iconify.design/simple-icons:dotnet.svg":
    "https://img.woodfish.site/o/webp/2026/08/6a043f3ebfe72a35704b1f15167c4ec035d02a66a539bda372ff690b5649f873.webp",
  "https://api.iconify.design/simple-icons:dovetail.svg":
    "https://img.woodfish.site/o/webp/2026/08/d249f005528408c53bb0a09e8adcd731237c783f669c0f166ea24e3daa2a07a1.webp",
  "https://api.iconify.design/simple-icons:drizzle.svg":
    "https://img.woodfish.site/o/webp/2026/08/02022a070816fb2db2c5301ac21d82d78a5715ec10c52ae1c043a1f5977b6bd7.webp",
  "https://api.iconify.design/simple-icons:duckdb.svg":
    "https://img.woodfish.site/o/webp/2026/08/d8ac5df7c8f374a6a32435d98d7a3ea2447e54b1ff7ccac3bcbdd9b4a0dc78b8.webp",
  "https://api.iconify.design/simple-icons:dvc.svg":
    "https://img.woodfish.site/o/webp/2026/08/db924de87564ca2821dd5e9fbb8a88242fb52bc049b70552aead531f15e5dc28.webp",
  "https://api.iconify.design/simple-icons:elasticsearch.svg":
    "https://img.woodfish.site/o/webp/2026/08/e8c1ce40eee4755818bb0102584375f04d452c415124d6695de5b84e3bc313a5.webp",
  "https://api.iconify.design/simple-icons:elasticstack.svg":
    "https://img.woodfish.site/o/webp/2026/08/a6f00b37b9b0059840aee9e51602786ac935f930587b3bfe81512214529c876a.webp",
  "https://api.iconify.design/simple-icons:elixir.svg":
    "https://img.woodfish.site/o/webp/2026/08/6be7e99aac95ac9598312e08df6f3b63e8d36ec8c95b1c4eb26287b7f9c0c077.webp",
  "https://api.iconify.design/simple-icons:envoyproxy.svg":
    "https://img.woodfish.site/o/webp/2026/08/d72395eca087d8a1ec79f46025f8e81e846ab860b5b37daa9acae7627c23f232.webp",
  "https://api.iconify.design/simple-icons:erlang.svg":
    "https://img.woodfish.site/o/webp/2026/08/7bbba641b65d0d76fe55d0f876976bbb5cd3871202ccafca244e958f737de9db.webp",
  "https://api.iconify.design/simple-icons:esbuild.svg":
    "https://img.woodfish.site/o/webp/2026/08/37740f305f035689037be2e9d5c0e6a366101ddacd21b0e209d430c9a720d79c.webp",
  "https://api.iconify.design/simple-icons:eslint.svg":
    "https://img.woodfish.site/o/webp/2026/08/dfc91375011a8a211528d1be28e8f614e0a297e861761fa02fc73c437c203366.webp",
  "https://api.iconify.design/simple-icons:ethereum.svg":
    "https://img.woodfish.site/o/webp/2026/08/16a2c54985e596d5e1dcd9075b370b9020121d0125eb18a5c683987092a11405.webp",
  "https://api.iconify.design/simple-icons:express.svg":
    "https://img.woodfish.site/o/webp/2026/08/cf8c8cb612426747a3774817c06959f9dfb8b5e8ac9419648c61d27cf826db82.webp",
  "https://api.iconify.design/simple-icons:falco.svg":
    "https://img.woodfish.site/o/webp/2026/08/be479ae2ec13663e2d6765af75575c5333016f584a38d7ee13d16baff46a6531.webp",
  "https://api.iconify.design/simple-icons:fastapi.svg":
    "https://img.woodfish.site/o/webp/2026/08/6b9580425fc45ba1384da6b6f1ab7e642fdd4b2ace50bf9f8d29cca7590e4407.webp",
  "https://api.iconify.design/simple-icons:fastlane.svg":
    "https://img.woodfish.site/o/webp/2026/08/1fc2a8e3b5227e7e5ce648feb876f52c5889ea0b0a9ad57e2f733385448f8856.webp",
  "https://api.iconify.design/simple-icons:figma.svg":
    "https://img.woodfish.site/o/webp/2026/08/3008cd61fd5ed667cb3af9bba1d0a0fa5043b467c0e4f3f965474ae2e22ec957.webp",
  "https://api.iconify.design/simple-icons:firebase.svg":
    "https://img.woodfish.site/o/webp/2026/08/db2aff98255f184d6bd66c1b2bd75910766a713afec697a8dadbd7e74da287a3.webp",
  "https://api.iconify.design/simple-icons:flyway.svg":
    "https://img.woodfish.site/o/webp/2026/08/4a7fe51bf8cd34e8516549352adb4431e571b7b3d3ed2e063ccd0c9adee90db4.webp",
  "https://api.iconify.design/simple-icons:fmod.svg":
    "https://img.woodfish.site/o/webp/2026/08/d0b0c2c79c9afd086d85b97a0b1846fbbde68cf7ac7d2cea05732dc4b6fb20fe.webp",
  "https://api.iconify.design/simple-icons:fontawesome.svg":
    "https://img.woodfish.site/o/webp/2026/08/79e6603a7cb4093cab2a094e1ffd3506bb8a112d897df9b261336ea782817779.webp",
  "https://api.iconify.design/simple-icons:fortinet.svg":
    "https://img.woodfish.site/o/webp/2026/08/93d33367609623ee62e34036d9fd271f11f9db0b1284067d9a3be55dc3629966.webp",
  "https://api.iconify.design/simple-icons:framer.svg":
    "https://img.woodfish.site/o/webp/2026/08/23ac424c02d6dcb9df637d87751376bc7fa8161e6b1a9e484d2bad4515704b02.webp",
  "https://api.iconify.design/simple-icons:gin.svg":
    "https://img.woodfish.site/o/webp/2026/08/ae0747ec4e3327c857cc74ba02233c27f8243d93372417046ba1d660c36dbe36.webp",
  "https://api.iconify.design/simple-icons:gitbook.svg":
    "https://img.woodfish.site/o/webp/2026/08/45deb83536a4120077649160787d5940a40fa151087a57c4ae432a8234fbf8fe.webp",
  "https://api.iconify.design/simple-icons:github.svg":
    "https://img.woodfish.site/o/webp/2026/08/9b9669cbc74912c7414b07da894cf8a495c8d369f0d06bcc796a25743bd25ff3.webp",
  "https://api.iconify.design/simple-icons:githubactions.svg":
    "https://img.woodfish.site/o/webp/2026/08/e0f8b6bdb6c3a810b89b475b695eff19749b879f35a9201a0b0fbf012eda4e70.webp",
  "https://api.iconify.design/simple-icons:gitlab.svg":
    "https://img.woodfish.site/o/webp/2026/08/3b4792e33e71ce8d95eaab79958fe884ce0cd8c486d9d8f000ecf6a333bcc562.webp",
  "https://api.iconify.design/simple-icons:glide.svg":
    "https://img.woodfish.site/o/webp/2026/08/5313ece7a9e161f9e7176564e472a96789546e320c201dc8622c2da0278e77d4.webp",
  "https://api.iconify.design/simple-icons:gnubash.svg":
    "https://img.woodfish.site/o/webp/2026/08/ec7e1196fd4c295b7423b56380a12cfee568e08d5eb6cca1033d4e38c9439922.webp",
  "https://api.iconify.design/simple-icons:go.svg":
    "https://img.woodfish.site/o/webp/2026/08/f694a323b2e29cec221614a2f6bbf81c3c5d1bfae7eeb8aff9837fc90ecf34ce.webp",
  "https://api.iconify.design/simple-icons:godotengine.svg":
    "https://img.woodfish.site/o/webp/2026/08/d3954d2a6e250c8cb1250899289ce153f8e031a4a7a1ac557f386df29efdfeee.webp",
  "https://api.iconify.design/simple-icons:googleanalytics.svg":
    "https://img.woodfish.site/o/webp/2026/08/2c8b106158be114955ccf002c154f56f8959a45cda570c03092b63d947b5a1e4.webp",
  "https://api.iconify.design/simple-icons:googlebigquery.svg":
    "https://img.woodfish.site/o/webp/2026/08/95971c522852e6b1061bfe89364e8ddb0752de3eb3148a52f0dd0a69b4f878a5.webp",
  "https://api.iconify.design/simple-icons:googlecloud.svg":
    "https://img.woodfish.site/o/webp/2026/08/efcde884bdb7f6be63dfb70cbd0b7a021441a318cd156244bd7b30f80f24230d.webp",
  "https://api.iconify.design/simple-icons:googleforms.svg":
    "https://img.woodfish.site/o/webp/2026/08/cccc00cd22a80b9c01ba32053cbcc82ad8120f043d0e4c5aaf618b7ca7a8a4e2.webp",
  "https://api.iconify.design/simple-icons:googlemeet.svg":
    "https://img.woodfish.site/o/webp/2026/08/83477a4fe89a3e8dc4be5450ac1d68da40be3d19433286dc85317769b2e55181.webp",
  "https://api.iconify.design/simple-icons:googlesheets.svg":
    "https://img.woodfish.site/o/webp/2026/08/2eef161a7db8eb4bd2826416e3f665e0b2edd165cdc66bc22ada44086c0adf8f.webp",
  "https://api.iconify.design/simple-icons:gradio.svg":
    "https://img.woodfish.site/o/webp/2026/08/8e0e6a08488ea45f179c06843e2eff0fbdcfcca3cc1173e7868d83760c07aae4.webp",
  "https://api.iconify.design/simple-icons:gradle.svg":
    "https://img.woodfish.site/o/webp/2026/08/3d1375f2b97196002a269b344f0f478a6310e55f43eff74224fb715c46adb5c1.webp",
  "https://api.iconify.design/simple-icons:grafana.svg":
    "https://img.woodfish.site/o/webp/2026/08/4b708cace8059e026a7193e4c5524fca9295e1f45d4ef60b71b526dba98a857c.webp",
  "https://api.iconify.design/simple-icons:grammarly.svg":
    "https://img.woodfish.site/o/webp/2026/08/13ac350d50c22cb5108bb06ab011bdd15b870def03f303d6709e9d75a9ce5f55.webp",
  "https://api.iconify.design/simple-icons:graphql.svg":
    "https://img.woodfish.site/o/webp/2026/08/88880a73a988321fa5bb8093e7838948b063a91495175bb8e4495215a156ce37.webp",
  "https://api.iconify.design/simple-icons:hashcat.svg":
    "https://img.woodfish.site/o/webp/2026/08/6a7ce450e49152b903ca03fdb762a29ec9c00249c95be3f5304a228de6dddf27.webp",
  "https://api.iconify.design/simple-icons:helm.svg":
    "https://img.woodfish.site/o/webp/2026/08/75ef88e3dc6f5f1b0d2f1bcc17cf179f7640c57608402b84803bad529f11e13e.webp",
  "https://api.iconify.design/simple-icons:hive.svg":
    "https://img.woodfish.site/o/webp/2026/08/399a72336bad88775c1379aea27f9204e33621b4627bdbe20a929e9fac4009a8.webp",
  "https://api.iconify.design/simple-icons:hono.svg":
    "https://img.woodfish.site/o/webp/2026/08/0cc1646809b81f0a8489e2d27348f32462e6eb24a7e2a3d8da85df9027411fd0.webp",
  "https://api.iconify.design/simple-icons:hotjar.svg":
    "https://img.woodfish.site/o/webp/2026/08/ac6bf04886f91270ad7adf0d747df49a3368cff4808c7e520f606b36b83de4e6.webp",
  "https://api.iconify.design/simple-icons:hubspot.svg":
    "https://img.woodfish.site/o/webp/2026/08/cd1e36e8660161c829d3e3c7e7830b1ee7cb0d22ed56021cf2208c230dad74cd.webp",
  "https://api.iconify.design/simple-icons:huggingface.svg":
    "https://img.woodfish.site/o/webp/2026/08/0b875cbed21f06be668c1749e17ed27d96cf3b1907e82050396871c83c4ec212.webp",
  "https://api.iconify.design/simple-icons:hyperledger.svg":
    "https://img.woodfish.site/o/webp/2026/08/1db87fc1b1f9a8c531f0e91c475800d1392aa4f54224d41258d10ee725242a97.webp",
  "https://api.iconify.design/simple-icons:insomnia.svg":
    "https://img.woodfish.site/o/webp/2026/08/28be98fbcc1f5b4bb9d478a32653b467606940b88fbf230e3e52795cddcfd206.webp",
  "https://api.iconify.design/simple-icons:ipfs.svg":
    "https://img.woodfish.site/o/webp/2026/08/fa466a99d050a86f63a722c525430b79a8cc5d60297a63d2cb6e09f1cdb97e22.webp",
  "https://api.iconify.design/simple-icons:itchdotio.svg":
    "https://img.woodfish.site/o/webp/2026/08/14aaa963378031392d27c45898add26e4fcc78fcb3998ecd4f547fedd119fa16.webp",
  "https://api.iconify.design/simple-icons:jenkins.svg":
    "https://img.woodfish.site/o/webp/2026/08/a051c9195028770f93f1af68dde038e493063fe0b6faf91db2042d6cecf43dcf.webp",
  "https://api.iconify.design/simple-icons:jest.svg":
    "https://img.woodfish.site/o/webp/2026/08/b0af06a9c7b67c96a79f39154676f6be79968604b5f59bfd7406a9f7c7b2de7a.webp",
  "https://api.iconify.design/simple-icons:jetpackcompose.svg":
    "https://img.woodfish.site/o/webp/2026/08/6780a18e30b9d6b8a6776d86f8c30effd676f6affc68e94b37a06f692bb58331.webp",
  "https://api.iconify.design/simple-icons:jira.svg":
    "https://img.woodfish.site/o/webp/2026/08/a19b5a448e9e8fd28d0fb0209c76e133e7d65592a183b6c2a9e81447764874df.webp",
  "https://api.iconify.design/simple-icons:jquery.svg":
    "https://img.woodfish.site/o/webp/2026/08/69ea3eeb7342634d6453ab13f961d434cc90d2853dcd07b12e05147ff1437ce8.webp",
  "https://api.iconify.design/simple-icons:junit5.svg":
    "https://img.woodfish.site/o/webp/2026/08/7a8d53fd0dc0a115ee33a18c404fd177b6061c8ea40d85b2bf7d62969cdf7653.webp",
  "https://api.iconify.design/simple-icons:jupyter.svg":
    "https://img.woodfish.site/o/webp/2026/08/79c851efaa2485b0ea1ba41154d990fb7030a0516a2675fa0868b3605975b364.webp",
  "https://api.iconify.design/simple-icons:k6.svg":
    "https://img.woodfish.site/o/webp/2026/08/597c0e57d7157a753cc90af8930abd3a4dbef1905dce0fa5ab08bb350a7a6c48.webp",
  "https://api.iconify.design/simple-icons:kalilinux.svg":
    "https://img.woodfish.site/o/webp/2026/08/e097dfa95fde7183210faaedc67b9f2d8e1aa4477547104c2b37de790b5724cb.webp",
  "https://api.iconify.design/simple-icons:kotlin.svg":
    "https://img.woodfish.site/o/webp/2026/08/bfdb8ef203c914be88ae3def4617c08fc98408629e8e93c8d5dc9abd547894eb.webp",
  "https://api.iconify.design/simple-icons:ktor.svg":
    "https://img.woodfish.site/o/webp/2026/08/7559ce8b1f77326aaf4cb2daa7a80b855337ec250eaee8c6fa03e7428f5d43b2.webp",
  "https://api.iconify.design/simple-icons:langchain.svg":
    "https://img.woodfish.site/o/webp/2026/08/7e1a76d116afb0850050dd3ee5b2773b97fc28834f861db97ad1fc8ed32fe6cb.webp",
  "https://api.iconify.design/simple-icons:latex.svg":
    "https://img.woodfish.site/o/webp/2026/08/51b6abf9f31c8fc12c9057d06a386d1673a3064bc99d9ca2669499357b71c845.webp",
  "https://api.iconify.design/simple-icons:less.svg":
    "https://img.woodfish.site/o/webp/2026/08/8fa6378d265eefd0f2720d970d3e1badde9117b79fe1ff983e34655e49a57c47.webp",
  "https://api.iconify.design/simple-icons:lighthouse.svg":
    "https://img.woodfish.site/o/webp/2026/08/2c4b619ac4d61dd2256ef5b9628fb0522536ee47ae3cc9863bf84564b482f06e.webp",
  "https://api.iconify.design/simple-icons:linux.svg":
    "https://img.woodfish.site/o/webp/2026/08/18f2606cee1e9cffacae0f8368622529fbb9301ab75fd23932f2f4688d5d55cc.webp",
  "https://api.iconify.design/simple-icons:liquibase.svg":
    "https://img.woodfish.site/o/webp/2026/08/cb7c6f7ec1e2dfad058db784032d27f01b525248bc1a5cfd0fd44ceaed52f646.webp",
  "https://api.iconify.design/simple-icons:looker.svg":
    "https://img.woodfish.site/o/webp/2026/08/7ee5ea4c46114bcdd28cdf921c4c2a0dec6eb5e5ac7ed9e151ea86fbda6ad420.webp",
  "https://api.iconify.design/simple-icons:lottiefiles.svg":
    "https://img.woodfish.site/o/webp/2026/08/80a9ec5773e50e42e5edd4b42a63c21c1c3ae011188f5b64066d8f95b44c7abd.webp",
  "https://api.iconify.design/simple-icons:lua.svg":
    "https://img.woodfish.site/o/webp/2026/08/ad4e2e2ef0fc6c383a146e00b8f65d3b48c79a24a20bb3674358e27c1b2e93d6.webp",
  "https://api.iconify.design/simple-icons:mariadb.svg":
    "https://img.woodfish.site/o/webp/2026/08/5cf3e5e64e76481e3591f694e41e55b40ea57f085fac6e8956ef96703a01d57f.webp",
  "https://api.iconify.design/simple-icons:markdown.svg":
    "https://img.woodfish.site/o/webp/2026/08/8a24768297393fd92f48cecb97da8e74c611a993ec973335a1e2c2f686e71e7a.webp",
  "https://api.iconify.design/simple-icons:materialdesign.svg":
    "https://img.woodfish.site/o/webp/2026/08/9406a057bc21a80b14896ba7e2c8647cd398b9698fe6a2fedc04fa16a3cdc970.webp",
  "https://api.iconify.design/simple-icons:materialformkdocs.svg":
    "https://img.woodfish.site/o/webp/2026/08/1abc2d4988d3a6a3257c0614731a34b75630aff64388047d98fd00f66429e594.webp",
  "https://api.iconify.design/simple-icons:maze.svg":
    "https://img.woodfish.site/o/webp/2026/08/ca25bc953a1dce376338d190f1191c9ad95207d02243a8d5f5e9e79e02f679f0.webp",
  "https://api.iconify.design/simple-icons:mermaid.svg":
    "https://img.woodfish.site/o/webp/2026/08/1fcdedacb74542bee4c0659992e24d548ad98b74afdd3eba1608c963333421fc.webp",
  "https://api.iconify.design/simple-icons:metabase.svg":
    "https://img.woodfish.site/o/webp/2026/08/e6a0e33f6ce2ee9b8686ba383c4acee4b24bd63e32b2c25eafc918608bcd1f87.webp",
  "https://api.iconify.design/simple-icons:metasploit.svg":
    "https://img.woodfish.site/o/webp/2026/08/c5a496621dd55b21c42ee1d1a01f618c0322e6f3be63b5683f203461bee4f12a.webp",
  "https://api.iconify.design/simple-icons:microsoft.svg":
    "https://img.woodfish.site/o/webp/2026/08/8419a991a0a87a73b40af7b13918612753e075d116395651e3d762482a4be6ca.webp",
  "https://api.iconify.design/simple-icons:microsoftexcel.svg":
    "https://img.woodfish.site/o/webp/2026/08/0e26f4226a33330356a93b67ce4ddb6c164e5204b334c4a8729361f598d37a5a.webp",
  "https://api.iconify.design/simple-icons:microstrategy.svg":
    "https://img.woodfish.site/o/webp/2026/08/ed1eb29ff51735596ef1b50d74c1ac2399171f21a62619a5436721224c168c18.webp",
  "https://api.iconify.design/simple-icons:mikrotik.svg":
    "https://img.woodfish.site/o/webp/2026/08/db44887904ec2e0bd512acbe28af65a98b8ffbe9c553237838efdc327a90249f.webp",
  "https://api.iconify.design/simple-icons:minio.svg":
    "https://img.woodfish.site/o/webp/2026/08/497ff88a5520e6aa59d3d41781da2f24f3526ee7bce8d7496f57b6851e2b9758.webp",
  "https://api.iconify.design/simple-icons:miro.svg":
    "https://img.woodfish.site/o/webp/2026/08/21421f2687a51073bb65f3283fc236cd56573e200c58073748eed50e84a59353.webp",
  "https://api.iconify.design/simple-icons:mixpanel.svg":
    "https://img.woodfish.site/o/webp/2026/08/4f34e87939a20a719c5b6a8cac507efb9addb49b1fb2f04d7d9b552adcb95b86.webp",
  "https://api.iconify.design/simple-icons:mlflow.svg":
    "https://img.woodfish.site/o/webp/2026/08/45b81b3fe267335ab3531042e9301cabb6a6a3c6c4d995c1ddfd3be43ef02a03.webp",
  "https://api.iconify.design/simple-icons:mobx.svg":
    "https://img.woodfish.site/o/webp/2026/08/f8b7f161425450d25c7ff5558209418c5aad24e57796b10354334927c72db245.webp",
  "https://api.iconify.design/simple-icons:mongodb.svg":
    "https://img.woodfish.site/o/webp/2026/08/58d016b2a5506a0aff80506e2e36bf41d8c1040ecffe8c38e9dc3a6ab1e48bb0.webp",
  "https://api.iconify.design/simple-icons:namecheap.svg":
    "https://img.woodfish.site/o/webp/2026/08/3dcf7836d963cf8771726f616bc6813af55ed78763436011e7c2630aab67ee6c.webp",
  "https://api.iconify.design/simple-icons:netlify.svg":
    "https://img.woodfish.site/o/webp/2026/08/ede7a9c86982a77233e037556480241081313f2655ca3d301d721140efee4e1e.webp",
  "https://api.iconify.design/simple-icons:newrelic.svg":
    "https://img.woodfish.site/o/webp/2026/08/4503390d55a690aaee4c66cfcba0fd2d0c922e82a1edeb47079ad426b1eb414d.webp",
  "https://api.iconify.design/simple-icons:nginx.svg":
    "https://img.woodfish.site/o/webp/2026/08/87282fd9a65b9e6aa5bd4d3d15826abd1001526f70016d4cdee1f8c67251858d.webp",
  "https://api.iconify.design/simple-icons:nomad.svg":
    "https://img.woodfish.site/o/webp/2026/08/6926f23c3516cc2371869bdb2db8056f6428ef5e543962f7571be8ecc8314cf7.webp",
  "https://api.iconify.design/simple-icons:notion.svg":
    "https://img.woodfish.site/o/webp/2026/08/f76f762202bfbc5fd4c35d8359b94e69e57e6e353fc1bf79bcadc2db352518a6.webp",
  "https://api.iconify.design/simple-icons:npm.svg":
    "https://img.woodfish.site/o/webp/2026/08/3b0c104735ecbbd35b951b82af4d5255d8a83697329ed899938a911f91751e6f.webp",
  "https://api.iconify.design/simple-icons:numpy.svg":
    "https://img.woodfish.site/o/webp/2026/08/6870ce5af08262cc2138f27595c24df30073380460a6df5422844b248f16cf9a.webp",
  "https://api.iconify.design/simple-icons:nuxt.svg":
    "https://img.woodfish.site/o/webp/2026/08/360d48fe911172b3b4ddd4256d197be2bfba672dce849e7d3e8ecd48e14c203d.webp",
  "https://api.iconify.design/simple-icons:nvidia.svg":
    "https://img.woodfish.site/o/webp/2026/08/f0af3a42929ac7cc8e2367b083cb8717ffe37c474440ad464677bb0fc306002f.webp",
  "https://api.iconify.design/simple-icons:obsstudio.svg":
    "https://img.woodfish.site/o/webp/2026/08/3201a4fd5870f2547648304c9f54d61395a4358f371f1f27e88861e379239587.webp",
  "https://api.iconify.design/simple-icons:ollama.svg":
    "https://img.woodfish.site/o/webp/2026/08/b3370e7ddfcce7ec1c03c76a8fea47201579b72325e9f8d8d7fa5bed32be0cbb.webp",
  "https://api.iconify.design/simple-icons:onnx.svg":
    "https://img.woodfish.site/o/webp/2026/08/a12dea975285e2d75bfcfc864984f449b03a47ae3e39c46545a7fd0b3447e2fa.webp",
  "https://api.iconify.design/simple-icons:openai.svg":
    "https://img.woodfish.site/o/webp/2026/08/f9bc5771df57ec1ecf3d434315d8960f8d125995efe89fc29193a90580ab899a.webp",
  "https://api.iconify.design/simple-icons:openapiinitiative.svg":
    "https://img.woodfish.site/o/webp/2026/08/2c249436e4ffa05890eab761f7e760d750c5012ad1657677919c6b305228032c.webp",
  "https://api.iconify.design/simple-icons:opengl.svg":
    "https://img.woodfish.site/o/webp/2026/08/0148d952b42d88007291e24ddedb8cf83ccb7607fb764be677965061a6e4ad02.webp",
  "https://api.iconify.design/simple-icons:opentelemetry.svg":
    "https://img.woodfish.site/o/webp/2026/08/ed89fbf0e0248e7325c2eb0a955f963a996b3796fe2866e4cc94b98bfdccfeef.webp",
  "https://api.iconify.design/simple-icons:openvpn.svg":
    "https://img.woodfish.site/o/webp/2026/08/5004cdefbd9667967aadf058174376d7f50777d833fe685b58e7e35fda01f9ff.webp",
  "https://api.iconify.design/simple-icons:openwrt.svg":
    "https://img.woodfish.site/o/webp/2026/08/67c16addb81e68ec63676d24f6e3b349fe3fd051d89d2a8c91b07cfc205c5d33.webp",
  "https://api.iconify.design/simple-icons:openzeppelin.svg":
    "https://img.woodfish.site/o/webp/2026/08/36e5b47df610577dae87ae1c5337b189eaef76618bfafbab6e6ebd23dfd8dd61.webp",
  "https://api.iconify.design/simple-icons:opsgenie.svg":
    "https://img.woodfish.site/o/webp/2026/08/a529d483d83d1bbcacacffd8c6ddcdae2752848636c0d4b71ba3e7f0d1072717.webp",
  "https://api.iconify.design/simple-icons:optimism.svg":
    "https://img.woodfish.site/o/webp/2026/08/67686987c3df70d1f3befa2acb08cf50a4b95d4251ec9bdb2664a1bd8c39ff37.webp",
  "https://api.iconify.design/simple-icons:oracle.svg":
    "https://img.woodfish.site/o/webp/2026/08/6f14d790113ddb70a629a4be392d29414218c236f636af5f81af1bd7abf091df.webp",
  "https://api.iconify.design/simple-icons:owasp.svg":
    "https://img.woodfish.site/o/webp/2026/08/235524af68da03a4564fc72fb631365f731bc437a282b502ce7f20cd03626866.webp",
  "https://api.iconify.design/simple-icons:packer.svg":
    "https://img.woodfish.site/o/webp/2026/08/a7d370dff7ab58dcad266e7371693449a0d60c25bcbfbd9f180cd8fcd469ff12.webp",
  "https://api.iconify.design/simple-icons:pagerduty.svg":
    "https://img.woodfish.site/o/webp/2026/08/aaa2234279dfeea8c7d8d35d0ac4fdd46fb885f4058f9f690234677c5d77ab9d.webp",
  "https://api.iconify.design/simple-icons:palantir.svg":
    "https://img.woodfish.site/o/webp/2026/08/e693d540594ffaecb484ccaf6078b8c1367328879a4d181499d93700f6de02da.webp",
  "https://api.iconify.design/simple-icons:paloaltonetworks.svg":
    "https://img.woodfish.site/o/webp/2026/08/b17cd6a53f8383aa4783f69b8619bb0d72244d5c28f7019d406669f2e561dce0.webp",
  "https://api.iconify.design/simple-icons:pandas.svg":
    "https://img.woodfish.site/o/webp/2026/08/8be75a4d0500bef8ae6f2b274e3cd59e367f19ede908263081cfd48aff6a7fc4.webp",
  "https://api.iconify.design/simple-icons:pandoc.svg":
    "https://img.woodfish.site/o/webp/2026/08/7078e2c5f770e8735d317a22bfdf284dc1131148b857dac671935d816d9f33e5.webp",
  "https://api.iconify.design/simple-icons:percy.svg":
    "https://img.woodfish.site/o/webp/2026/08/8a1748eb43bcab112899a569c362d556e418ec4f84cd93aa28c92a92bb3bceab.webp",
  "https://api.iconify.design/simple-icons:perforce.svg":
    "https://img.woodfish.site/o/webp/2026/08/79d2e5cfe6d7bd45f9eb930fda71b8c054c8ef9c70443ab8d4c24b24bc67581e.webp",
  "https://api.iconify.design/simple-icons:pfsense.svg":
    "https://img.woodfish.site/o/webp/2026/08/8bcfba9727f3d918b0f985873a5f32b0f431987397870976f8b8f91d0e8f4955.webp",
  "https://api.iconify.design/simple-icons:pinia.svg":
    "https://img.woodfish.site/o/webp/2026/08/9f0af860e2070528e2e58c79a1c22b2fe1d34ab76703326381fc3f9ad0a967a0.webp",
  "https://api.iconify.design/simple-icons:plausibleanalytics.svg":
    "https://img.woodfish.site/o/webp/2026/08/a46081742c97f29bf74198aaa0e845ec6889882720f24f0f31cdc442b0cd0caa.webp",
  "https://api.iconify.design/simple-icons:plotly.svg":
    "https://img.woodfish.site/o/webp/2026/08/9d26d37a2f8dd0458825d61fb6fe6224c7d279ef613b6678356ff43d8e99001b.webp",
  "https://api.iconify.design/simple-icons:pnpm.svg":
    "https://img.woodfish.site/o/webp/2026/08/5874afb8059aed49ee2a966c8763be417eccbe843e6c64e6d87cbf9d1ce61a67.webp",
  "https://api.iconify.design/simple-icons:polygon.svg":
    "https://img.woodfish.site/o/webp/2026/08/a79aec2ad1a5cca6e7fcb5e8f61b33002ff0fc5a55efb0a223eae33ca5058dc2.webp",
  "https://api.iconify.design/simple-icons:posthog.svg":
    "https://img.woodfish.site/o/webp/2026/08/8f8aac177ab9332ca9c1b4426886d5e3c19eb18c2ae9bded370af492ef73e19e.webp",
  "https://api.iconify.design/simple-icons:postman.svg":
    "https://img.woodfish.site/o/webp/2026/08/5b22bb0906d6e10c3e5d354b510a7817207593c7a697fe9fa7aaeacfdb205496.webp",
  "https://api.iconify.design/simple-icons:powerbi.svg":
    "https://img.woodfish.site/o/webp/2026/08/1a29811f0dfdd20210f238bcff6b06228e6530a83eae23d587f406f248e6bdbc.webp",
  "https://api.iconify.design/simple-icons:prettier.svg":
    "https://img.woodfish.site/o/webp/2026/08/e95e5a7b5d9c2ff1590ae805b63ba38214e908309662c5651588ffe1b69c73e7.webp",
  "https://api.iconify.design/simple-icons:prisma.svg":
    "https://img.woodfish.site/o/webp/2026/08/c2295175c0eb9807b1edccdc19b00ce016ac19f11e34b954cbdceec6ac73667b.webp",
  "https://api.iconify.design/simple-icons:prometheus.svg":
    "https://img.woodfish.site/o/webp/2026/08/ffbd7e05884ed9ee38a2a22603b2bd90378edb3e2ba26c3abadc155cf76b636e.webp",
  "https://api.iconify.design/simple-icons:pulumi.svg":
    "https://img.woodfish.site/o/webp/2026/08/011b10665e7ae284ca16c904e1b609f4f4d41d073caee84f5f157b94331dc26f.webp",
  "https://api.iconify.design/simple-icons:puppeteer.svg":
    "https://img.woodfish.site/o/webp/2026/08/84e639d59da8ffd0f3b6a432dab1027144c458700544580203a7990b9efaa806.webp",
  "https://api.iconify.design/simple-icons:pydantic.svg":
    "https://img.woodfish.site/o/webp/2026/08/de231403c3ad8d39c34700b59ba0b80102c96500ee7820b1cf9b848e2b5e8c44.webp",
  "https://api.iconify.design/simple-icons:pytest.svg":
    "https://img.woodfish.site/o/webp/2026/08/a783f0b2e05264fe79245c1aeb684a393cb0664b0ed362f902fe40499d20a84e.webp",
  "https://api.iconify.design/simple-icons:python.svg":
    "https://img.woodfish.site/o/webp/2026/08/b8623ebdb20317e62f3cd522335bb5774abedd39c6489700abf91cc8b5c00dbf.webp",
  "https://api.iconify.design/simple-icons:pytorch.svg":
    "https://img.woodfish.site/o/webp/2026/08/152a9cacb2d67748a6cf7390c372073b59ef2ba32ea591340bbf3e34c857e8b8.webp",
  "https://api.iconify.design/simple-icons:qdrant.svg":
    "https://img.woodfish.site/o/webp/2026/08/017c4b7ec1d11adf1c5587a361d587c7dd982378666d68d3adf51041d4e7b436.webp",
  "https://api.iconify.design/simple-icons:qlik.svg":
    "https://img.woodfish.site/o/webp/2026/08/f31e8651a70228a3fe05b005603ab012f9b207c96487a175be3f96f58ea4677f.webp",
  "https://api.iconify.design/simple-icons:qwik.svg":
    "https://img.woodfish.site/o/webp/2026/08/94b1617a1fc7151164ada5ae1ac05547d06aabb9594048c630647d3df6dac3ad.webp",
  "https://api.iconify.design/simple-icons:rabbitmq.svg":
    "https://img.woodfish.site/o/webp/2026/08/4e11be175c744e6f7f30197527985c992e68df3261da9137eee02d4666a00350.webp",
  "https://api.iconify.design/simple-icons:ray.svg":
    "https://img.woodfish.site/o/webp/2026/08/b1896cf97e739a9de7764b34c96658018f3c60af023c44aeb3d5fa444d79866b.webp",
  "https://api.iconify.design/simple-icons:reactrouter.svg":
    "https://img.woodfish.site/o/webp/2026/08/c106ec3179e08579538548de7e5404a687ebde998d555783fa6446972d9cf30d.webp",
  "https://api.iconify.design/simple-icons:readme.svg":
    "https://img.woodfish.site/o/webp/2026/08/35bb3f615906ffbe84e19e55c9cd23318e68b70f0e5c342550317b77dba546be.webp",
  "https://api.iconify.design/simple-icons:recoil.svg":
    "https://img.woodfish.site/o/webp/2026/08/412efe70e4c6af4a04120fee636b34496eee52f6452d9f5787558b2fc1c47c3e.webp",
  "https://api.iconify.design/simple-icons:redux.svg":
    "https://img.woodfish.site/o/webp/2026/08/50582cdd031e25b20540995beb1697c870cb55da526b5382ce3025afa5936ddd.webp",
  "https://api.iconify.design/simple-icons:rider.svg":
    "https://img.woodfish.site/o/webp/2026/08/b8e804e907a48ab9fa6e7997a09683c2bfa77007f8e1456caf886913cc4f9de8.webp",
  "https://api.iconify.design/simple-icons:rive.svg":
    "https://img.woodfish.site/o/webp/2026/08/5ea154f1c5a94c2094beb2e8a0bbf31c337996fe4f4c21db27c84bf695bd5b8f.webp",
  "https://api.iconify.design/simple-icons:robotframework.svg":
    "https://img.woodfish.site/o/webp/2026/08/ba6de6291f101d3de8584a7948fa5e387ca407a356373bc15ac9580254d10203.webp",
  "https://api.iconify.design/simple-icons:rollupdotjs.svg":
    "https://img.woodfish.site/o/webp/2026/08/b924685d5c2bb43e74adbfa35db00860ed1ef3397e948eaf0ee0d8c58f68b15b.webp",
  "https://api.iconify.design/simple-icons:rust.svg":
    "https://img.woodfish.site/o/webp/2026/08/c75f0ece9c2129b1498d7f650b9d12e7894ecec88adc6f24b382c38eb6eb5a89.webp",
  "https://api.iconify.design/simple-icons:sap.svg":
    "https://img.woodfish.site/o/webp/2026/08/ec827cbf4a3c5cd04005518fd03bfac2f7c4c55d84c704f2ecf4b298756cc0f8.webp",
  "https://api.iconify.design/simple-icons:sass.svg":
    "https://img.woodfish.site/o/webp/2026/08/89145a4c511cd1f4b379ba680276694df41934523768a5a1c712f8e3a698acbe.webp",
  "https://api.iconify.design/simple-icons:saucelabs.svg":
    "https://img.woodfish.site/o/webp/2026/08/2fb49e761ae3ef9fc143d228b3d2fc7b4a6b14fee874410639faf69af576acca.webp",
  "https://api.iconify.design/simple-icons:scikitlearn.svg":
    "https://img.woodfish.site/o/webp/2026/08/2b56a780cde528209804ee9f299b837c59a6d59403eb5b1eca611f7f9d10a57c.webp",
  "https://api.iconify.design/simple-icons:scipy.svg":
    "https://img.woodfish.site/o/webp/2026/08/ca0a5406c762dedc725a49d7b3e58ae1c8b07f3fc3fdf8a6ee80f0969a65126f.webp",
  "https://api.iconify.design/simple-icons:selenium.svg":
    "https://img.woodfish.site/o/webp/2026/08/d12adefabaa5e16addd70c18632126c60919719e00f51dda970a52decbbe5108.webp",
  "https://api.iconify.design/simple-icons:sentry.svg":
    "https://img.woodfish.site/o/webp/2026/08/f7419ef70d7e5740dc22556bf5735fb90964896355ad59945977ad5fe6c770bf.webp",
  "https://api.iconify.design/simple-icons:sketch.svg":
    "https://img.woodfish.site/o/webp/2026/08/7477e41553a06dff08e821547c15e1ef745f5c852f61179932b548b7d9c3e14a.webp",
  "https://api.iconify.design/simple-icons:snort.svg":
    "https://img.woodfish.site/o/webp/2026/08/ecda6fac63790620a4f4673f2f1c0fe7f9075a264768a2517a5cea238beadd95.webp",
  "https://api.iconify.design/simple-icons:snowflake.svg":
    "https://img.woodfish.site/o/webp/2026/08/604decce8951490ee51228fbc9844fbefcd86783dcf8ffd43ff306e485257b66.webp",
  "https://api.iconify.design/simple-icons:snyk.svg":
    "https://img.woodfish.site/o/webp/2026/08/181cd2ef9d0fc997f43512d7083475ecdf7a06bc533ce47cc37fea29cb4c5200.webp",
  "https://api.iconify.design/simple-icons:solana.svg":
    "https://img.woodfish.site/o/webp/2026/08/635f82a46d11cbdb61987cc9a7a3bb97fe48c93cab2eadd814c51f94ef319aaa.webp",
  "https://api.iconify.design/simple-icons:solidity.svg":
    "https://img.woodfish.site/o/webp/2026/08/4e4a8c0b1f6d65057521c8f1719ec1e16d814f6985dd4be04848e73a3bdad60e.webp",
  "https://api.iconify.design/simple-icons:sonarqubecloud.svg":
    "https://img.woodfish.site/o/webp/2026/08/5980879c0ab8fbb85575213e020035e8ef62068f299df7d12f3d42d66759f5a9.webp",
  "https://api.iconify.design/simple-icons:sphinx.svg":
    "https://img.woodfish.site/o/webp/2026/08/9ee2bde4f5cfc7395a1ce8cad28e73f528a6fd301897066236c24d2469d175e4.webp",
  "https://api.iconify.design/simple-icons:splunk.svg":
    "https://img.woodfish.site/o/webp/2026/08/03bf05364158500b5e6bb63419df8e93dfa0abb4a1d803ddbf33da2a15562822.webp",
  "https://api.iconify.design/simple-icons:springboot.svg":
    "https://img.woodfish.site/o/webp/2026/08/9ec6ccb6386a7bc2a08eee4bb9c5969fff6501fc8939942ce39723888718ee1b.webp",
  "https://api.iconify.design/simple-icons:sqlite.svg":
    "https://img.woodfish.site/o/webp/2026/08/78bb09f29997de7599d227bb3e82db3d67f8b695b37866ef37f9195219b47e69.webp",
  "https://api.iconify.design/simple-icons:steamworks.svg":
    "https://img.woodfish.site/o/webp/2026/08/5b13a150e436464bc6d9f2a82deaa00d84b01d99899c561ed538955bb886c4bd.webp",
  "https://api.iconify.design/simple-icons:storybook.svg":
    "https://img.woodfish.site/o/webp/2026/08/f7d5d0c105edd26ab74d1e270e780b2ba7cb5cc30f200df68a2459e6aa36c984.webp",
  "https://api.iconify.design/simple-icons:streamlit.svg":
    "https://img.woodfish.site/o/webp/2026/08/a870778edb8d4c40bf20af468eaa35c837863e70c8fe4fb4a572f32b5a637729.webp",
  "https://api.iconify.design/simple-icons:svelte.svg":
    "https://img.woodfish.site/o/webp/2026/08/8c9411ce94f447285ef1d798f7778be3839fa523477505830341f92fa717dafc.webp",
  "https://api.iconify.design/simple-icons:swagger.svg":
    "https://img.woodfish.site/o/webp/2026/08/50914e93458bf1d1812752b0b0c5be41aae8e589c8193ea68c0f3a16ad6ae36e.webp",
  "https://api.iconify.design/simple-icons:swc.svg":
    "https://img.woodfish.site/o/webp/2026/08/b9e1b3831aeaa9d876e67fc600889281f0c945ecabfa74270b868e568e6d748f.webp",
  "https://api.iconify.design/simple-icons:swift.svg":
    "https://img.woodfish.site/o/webp/2026/08/c9446d7cee85d140d8fb3400e010f9ab17ed9fbd4ec1c55840c66b4c18144b2a.webp",
  "https://api.iconify.design/simple-icons:tableau.svg":
    "https://img.woodfish.site/o/webp/2026/08/0efc784deb475a44188b5d4a5dc886883c318316ba3e17080d33035b79cb4a58.webp",
  "https://api.iconify.design/simple-icons:tanstack.svg":
    "https://img.woodfish.site/o/webp/2026/08/420c5d15f3f233b9d5532ad12c3df5f1b6c67ac25eeaed7ae5d5ed93bd8daff3.webp",
  "https://api.iconify.design/simple-icons:tensorflow.svg":
    "https://img.woodfish.site/o/webp/2026/08/795d251409674ccfa4aefb84cadc62d2495a2c9d93cccadba6e4c4cc89a279f3.webp",
  "https://api.iconify.design/simple-icons:terraform.svg":
    "https://img.woodfish.site/o/webp/2026/08/1cfdbc0d3a332144cbf05d39be717422d75caf8cfb8100cf74045ba85f7b0354.webp",
  "https://api.iconify.design/simple-icons:travisci.svg":
    "https://img.woodfish.site/o/webp/2026/08/a4a1aa56905f77e5850e0fd2bb553901b2e305622f79687240253454ce147379.webp",
  "https://api.iconify.design/simple-icons:trello.svg":
    "https://img.woodfish.site/o/webp/2026/08/3442239cfa5e07ba5834786e7cd1e072c26efac0af2fe6b1842a8721a656e21b.webp",
  "https://api.iconify.design/simple-icons:trino.svg":
    "https://img.woodfish.site/o/webp/2026/08/171c654306fa64bc2940313a052973179d172583d46fcc7a0519a3239451d272.webp",
  "https://api.iconify.design/simple-icons:trivy.svg":
    "https://img.woodfish.site/o/webp/2026/08/62b199d19994a860fa67ed812f760d418d16a74cae85ac93fbbfd7d477e8ee3a.webp",
  "https://api.iconify.design/simple-icons:turborepo.svg":
    "https://img.woodfish.site/o/webp/2026/08/14e4f1d5b360823adf257b16d9972d29fca932832fd0f702db8bedae2584705e.webp",
  "https://api.iconify.design/simple-icons:twitch.svg":
    "https://img.woodfish.site/o/webp/2026/08/d3aa994b34ab7b2e14c574de66640b6d007667da1d870b6a2640a747bc8d0038.webp",
  "https://api.iconify.design/simple-icons:typeform.svg":
    "https://img.woodfish.site/o/webp/2026/08/dd6a2c52d7f13225253fe59f70f0d62811874383c08abd4be84e530b26a7cdd8.webp",
  "https://api.iconify.design/simple-icons:ubiquiti.svg":
    "https://img.woodfish.site/o/webp/2026/08/5bdd854893dd8355c484c72dc29cae9421424d8521ee2151ef55b5ecc5edcf36.webp",
  "https://api.iconify.design/simple-icons:unity.svg":
    "https://img.woodfish.site/o/webp/2026/08/ce572b78f6a7bd635e8134ee4dc27ed3b892bc3ff586a82da02a3e7c23e23c62.webp",
  "https://api.iconify.design/simple-icons:unrealengine.svg":
    "https://img.woodfish.site/o/webp/2026/08/85cb5fe9b06822c3efb6e64f52e3672c4d6c35bf60f3319398893cec0b79a0ca.webp",
  "https://api.iconify.design/simple-icons:vault.svg":
    "https://img.woodfish.site/o/webp/2026/08/7a52afadc50f6c906582e114ddae2c9aec5d4d6933b7ec9b421cc70f593c0a54.webp",
  "https://api.iconify.design/simple-icons:vercel.svg":
    "https://img.woodfish.site/o/webp/2026/08/4c964dfabd2ebfdff69fea2453a2e452c5500b42b8a3c5ec2fa3dac68598edfb.webp",
  "https://api.iconify.design/simple-icons:vitest.svg":
    "https://img.woodfish.site/o/webp/2026/08/e804c75c3e1f26209ed3df0e44c9617780869067005d040d5888eab7ac7a077a.webp",
  "https://api.iconify.design/simple-icons:vllm.svg":
    "https://img.woodfish.site/o/webp/2026/08/4a6078dbb57e802d0e32f4e04ce54f93fb44f51a02f03f06368c6b3a66b395f6.webp",
  "https://api.iconify.design/simple-icons:vulkan.svg":
    "https://img.woodfish.site/o/webp/2026/08/591ad44b025b7ff54170c35368b43566aefe76a45b3a00fd4614d2cbc1e9417d.webp",
  "https://api.iconify.design/simple-icons:wagmi.svg":
    "https://img.woodfish.site/o/webp/2026/08/86ec2c0288778ad3b95893256bfea861935aceb1e771721c3c359d55df036138.webp",
  "https://api.iconify.design/simple-icons:web3dotjs.svg":
    "https://img.woodfish.site/o/webp/2026/08/203b9a3118f76c9668e6aa403eeb861aaa902bda667e9de4a09323bc41aefeba.webp",
  "https://api.iconify.design/simple-icons:webflow.svg":
    "https://img.woodfish.site/o/webp/2026/08/48f3ecff0b91259e1cf42e54353960d966ea5b3f24920cf2115b3f441af8b0c9.webp",
  "https://api.iconify.design/simple-icons:webpack.svg":
    "https://img.woodfish.site/o/webp/2026/08/df853228c539cb467c7e56595f84d553be7c5dd7267c0981d53cd058ae22226c.webp",
  "https://api.iconify.design/simple-icons:wireguard.svg":
    "https://img.woodfish.site/o/webp/2026/08/83ee37de60e1d96e9a7a42ab46a30b531fc17639c77512cef4261697a91d849b.webp",
  "https://api.iconify.design/simple-icons:wireshark.svg":
    "https://img.woodfish.site/o/webp/2026/08/bcd3a209111d520f757bd05155eccbd4d43ddbc8a7389cf624c0c4a9050c73fb.webp",
  "https://api.iconify.design/simple-icons:wwise.svg":
    "https://img.woodfish.site/o/webp/2026/08/b5bc158cd35509b108693a09a31ad4303929d4e7aa52c9b7ee303930411b1adc.webp",
  "https://api.iconify.design/simple-icons:x.svg":
    "https://img.woodfish.site/o/webp/2026/08/fff86c9eeeb879cf5817fd38c6a0e03ce69d6ff21c53816174fca02131aebd5d.webp",
  "https://api.iconify.design/simple-icons:xcode.svg":
    "https://img.woodfish.site/o/webp/2026/08/6b7bdedc117ccad9f41ebc9cc15f0ca9003c967022322b89e8cc31e20c5f84fc.webp",
  "https://api.iconify.design/simple-icons:yarn.svg":
    "https://img.woodfish.site/o/webp/2026/08/62306d32dc6c731fc6108fb5c03b56763a730b30834b4b422fc1c442d092fb7f.webp",
  "https://api.iconify.design/simple-icons:youtube.svg":
    "https://img.woodfish.site/o/webp/2026/08/52edb4d3bd7c779aea8ec09900652510e290832a38ba8ccda86c2d8bef745b27.webp",
  "https://api.iconify.design/simple-icons:zoom.svg":
    "https://img.woodfish.site/o/webp/2026/08/12ea61aa8359bef3c1dc2ee3399ff170a9072de1b21149ef3f58aa45671fa487.webp",
  "https://api.iconify.design/thesvg-color:adobe-fonts.svg":
    "https://img.woodfish.site/o/webp/2026/08/df863929b2358cb35176144025623dadd3cf3e408f51b21be5fb69c2b556806c.webp",
  "https://api.iconify.design/thesvg-color:avalanche.svg":
    "https://img.woodfish.site/o/webp/2026/08/a83a6ce4b53f7be7023eb7fa8558ffa841651125c2ff82ced3b34557327f25d0.webp",
  "https://api.iconify.design/thesvg-color:llamaindex.svg":
    "https://img.woodfish.site/o/webp/2026/08/fb8dd702428d9254329b3a4e274b853eb8b2c905d025fc6395105f5b51918e1a.webp",
  "https://api.iconify.design/thesvg-color:substance-3d-painter.svg":
    "https://img.woodfish.site/o/webp/2026/08/eea17182ea987c204aec6ec68029335620e25cdf62b9aa74b9990dc1c4334bc1.webp",
  "https://api.iconify.design/vscode-icons:file-type-allure.svg":
    "https://img.woodfish.site/o/webp/2026/08/fe75f303444972684357c00c8fd6fe1ba62cbadc356111bd0b8d8504aad5063c.webp",
  "https://api.iconify.design/vscode-icons:file-type-glsl.svg":
    "https://img.woodfish.site/o/webp/2026/08/ee960edb00f0f0de5c895db43efa4e6ea57c42825c24ffc78801878b8963914d.webp",
  "https://api.iconify.design/vscode-icons:file-type-haxe.svg":
    "https://img.woodfish.site/o/webp/2026/08/5e566b730c3086da17d701a637d4279adadd088408d7c0d821afcd287e864a0c.webp",
  "https://api.iconify.design/vscode-icons:file-type-hlsl.svg":
    "https://img.woodfish.site/o/webp/2026/08/491ca7f2f2058cbe298efead15c21a0b65d495242339e56e2c373b5901f89c25.webp",
  "https://api.iconify.design/vscode-icons:file-type-plantuml.svg":
    "https://img.woodfish.site/o/webp/2026/08/3d7db0a6505001f3ae4be64d09aa7b7e5e6ca05633375a0bf288145db0a7b093.webp",
  "https://api.iconify.design/vscode-icons:file-type-vale.svg":
    "https://img.woodfish.site/o/webp/2026/08/cde25028db951da1382be57ad2f352148493cbb25f7ee229621fee31c04b81d5.webp",
  "https://blog.woodfish.site/asset/gsap.svg":
    "https://img.woodfish.site/o/webp/2026/08/eb463de53497c143ef95ec3082a694dac89776a8e95917e4daaf6cf9c33db6a6.webp",
  "https://blog.woodfish.site/remote-assets/103f75839cd4eea0a0a3c6997435c0671bd86932.svg":
    "https://img.woodfish.site/o/webp/2026/08/888cd84531de475f0845704732d9c184208b805517454d41943c73cd5871a0a8.webp",
  "https://blog.woodfish.site/remote-assets/11d81b29e2f4a4bd013b01f63c22dda5737a9f5d.svg":
    "https://img.woodfish.site/o/webp/2026/08/1be43139c06561dcb9890da429b66c18bf696338e928aaa86fcbd19e538dc3a5.webp",
  "https://blog.woodfish.site/remote-assets/1a07db62f56ca3b41207d606cf6e53771a82010d.svg":
    "https://img.woodfish.site/o/webp/2026/08/201c77db41441bd3d05f6bd607252eeb4af778827e1de1524a7b784ff8c0df1a.webp",
  "https://blog.woodfish.site/remote-assets/1d45e27d8501242fa3bb488364e219417f7d3a8f.svg":
    "https://img.woodfish.site/o/webp/2026/08/00acc9db4df7046c5487b89052a04a7655fcd42aa1d968012202f1dea249df6e.webp",
  "https://blog.woodfish.site/remote-assets/243f536c3c4e8cfae58cd2bcf9ad4a4052989d7e.svg":
    "https://img.woodfish.site/o/webp/2026/08/eb2252f21859772546041db4e9733f0d9630083fa5a7600741cb7f877dac1a0b.webp",
  "https://blog.woodfish.site/remote-assets/36acd4efa4d1d541c1fa648a3aaf8a4ad54a18ed.svg":
    "https://img.woodfish.site/o/webp/2026/08/0009fbf508fcd10bc8196ddc7bf3efb019d188a846358e4a0ea500313a0bea5f.webp",
  "https://blog.woodfish.site/remote-assets/41924b1961f5675efe543d7de454f6897d1c8271.svg":
    "https://img.woodfish.site/o/webp/2026/08/8298d55d2783dd46abe13f6641cb33091fa45199e5859cb6650fd15023378ff1.webp",
  "https://blog.woodfish.site/remote-assets/4e9cded7e8264953a331dc8616375c7133563267.svg":
    "https://img.woodfish.site/o/webp/2026/08/7b79b42537d1672275f5ae3103e833ca37bdeb477fec819eff7255b2d6f1d318.webp",
  "https://blog.woodfish.site/remote-assets/56bfb128472d4a65b8886958bb690bb567afe27d.svg":
    "https://img.woodfish.site/o/webp/2026/08/0235dbe357b312adaedc7bb8a91f479ee6c25e2b5d27612ae86d48b14f17e10d.webp",
  "https://blog.woodfish.site/remote-assets/62f0ebaf4ba438003f32bf99fb43d9ac487d663b.svg":
    "https://img.woodfish.site/o/webp/2026/08/33084191d48f1aef0727d46dfe7354f099be51c2330e74a31c17adcb13d00207.webp",
  "https://blog.woodfish.site/remote-assets/672aa8db55ec35aae1db006f948ae9346e4ca039.svg":
    "https://img.woodfish.site/o/webp/2026/08/3560f2a237adbf89e0f8595907a459c570d6968d34c0c7b05104001456fe8f16.webp",
  "https://blog.woodfish.site/remote-assets/7447b22e61cee91633ed1e6095d9731bd6ba9828.svg":
    "https://img.woodfish.site/o/webp/2026/08/40f1c6176e988578063a8204b22aae37e6f1eb90e1713d70090cd9686c2f33aa.webp",
  "https://blog.woodfish.site/remote-assets/814036b11679118076d13fd074bd098036cc120a.svg":
    "https://img.woodfish.site/o/webp/2026/08/3fb2ba3c08c071eaef0471c956da8dacc823933e0cf541d68bc559768864ecfb.webp",
  "https://blog.woodfish.site/remote-assets/9803b20dbaae6f7fe0009b6cd617ee945885ec86.svg":
    "https://img.woodfish.site/o/webp/2026/08/38ee68aed0ee2753955ead0e4e73a6c24b11f44a2d2ae3ec746c8e20c2317e52.webp",
  "https://blog.woodfish.site/remote-assets/a1598829e092549f688b4d08e34e5d858d15566f.svg":
    "https://img.woodfish.site/o/webp/2026/08/f6ccbd546c1b5b140bf2a3ee770245a67b2120a20df3c2d46c0a1b9028364cd5.webp",
  "https://blog.woodfish.site/remote-assets/a265d84a7f7f8edaf4b551a3d36f82cbc36e36f0.svg":
    "https://img.woodfish.site/o/webp/2026/08/dfe08e77af13b0b691c8c4f7cdabfa37ad5eaa09c92056b84156ba10529acd4d.webp",
  "https://blog.woodfish.site/remote-assets/d13efe560eb5a67abbed2fd481abe2069bc49918.svg":
    "https://img.woodfish.site/o/webp/2026/08/614375066a3aa4eaca53c12fc5310c4c635af00f017a9e8d3ce78816960c6f36.webp",
  "https://blog.woodfish.site/remote-assets/d27c46d2f7128f9080768bd730235d1e3402cb67.svg":
    "https://img.woodfish.site/o/webp/2026/08/584a3e158110aee0f78a183fa1d850cb6e6a10d14b4e51f11da441ec2aa707e0.webp",
  "https://blog.woodfish.site/remote-assets/df4206fdd68ca85c54a2e5cb1f4b4953cbe9bd8b.svg":
    "https://img.woodfish.site/o/webp/2026/08/bebfe306319153e5d730a970aafb89e7b1a4908ea37bc0ae69e3ac438a9f77a2.webp",
  "https://blog.woodfish.site/remote-assets/e0e6716d0173bcce73b6b203ca6c34a74a731b15.svg":
    "https://img.woodfish.site/o/webp/2026/08/be191990d9c635c10d42ed8b2c47d6aa50040989c9401bde3e98524a667b7005.webp",
  "https://blog.woodfish.site/remote-assets/e416886de9f85b2910d1e75bc2d92b60697c0496.svg":
    "https://img.woodfish.site/o/webp/2026/08/30f29d3b0910d1b9b52e4a016da6c61945fc84f64086fef86b3c43b3f7c4748c.webp",
  "https://blog.woodfish.site/remote-assets/e5e1378c33ede079a823d7983f337e835260d56e.svg":
    "https://img.woodfish.site/o/webp/2026/08/6479196f836bc974267e5ce61044a7dedd686881ef9ab3afddfcbf69b31506ea.webp",
  "https://blog.woodfish.site/remote-assets/ea435dbc4a747a98b84e721cfa8aff9d10969177.svg":
    "https://img.woodfish.site/o/webp/2026/08/02971571dd4103aef3b7ee7641eefdf0c1b3d78f122fc21e9a41d0670c46c128.webp",
};
export const TECHNOLOGY_ICON_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23111111' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16'/%3E%3C/svg%3E";

export function getTechnologyIcon(technology: string) {
  const canonicalTechnology = TECHNOLOGY_ICON_ALIASES[technology] ?? technology;
  const blogLogo = BLOG_TECH_LOGOS[canonicalTechnology];
  const iconId = ICONIFY_TECH_LOGOS[canonicalTechnology];
  const sourceLogo =
    blogLogo ??
    (iconId ? `https://api.iconify.design/${iconId}.svg` : TECHNOLOGY_ICON_FALLBACK);

  return HOSTED_TECH_LOGOS[sourceLogo] ?? sourceLogo;
}
