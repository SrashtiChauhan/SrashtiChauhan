const fs = require("fs");
const path = require("path");

// ======================================================
// PATHS
// ======================================================

const ROOT = path.join(__dirname, "..");

const PROJECT_FILE = path.join(
  ROOT,
  "data",
  "project-activity.json"
);

const TIMELINE_FILE = path.join(
  ROOT,
  "data",
  "activity-timeline.json"
);

const OUTPUT_FILE = path.join(
  ROOT,
  "id-dashboard.svg"
);


// ======================================================
// LOAD DATA
// ======================================================

const projects = JSON.parse(
  fs.readFileSync(PROJECT_FILE, "utf8")
);

const timeline = JSON.parse(
  fs.readFileSync(TIMELINE_FILE, "utf8")
);


// ======================================================
// ANALYTICS
// ======================================================

const activeProjects = projects.length;

const totalRecentCommits = projects.reduce(
  (total, project) =>
    total + Number(
      project.recent_commit_count || 0
    ),
  0
);

const recentProjects = projects.slice(0, 5);

const latestProject = projects[0] || {};

const latestCommit =
  latestProject.latest_commit || {};


// ======================================================
// HELPERS
// ======================================================

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


function truncate(value, maxLength) {
  const text = String(value || "");

  if (text.length <= maxLength) {
    return text;
  }

  return (
    text.slice(0, maxLength - 1) +
    "…"
  );
}


function formatDate(dateString) {
  if (!dateString) {
    return "N/A";
  }

  return new Date(
    dateString
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


// ======================================================
// SVG CONFIGURATION
// ======================================================

const WIDTH = 1200;
const HEIGHT = 520;

const GRAPH_X = 80;
const GRAPH_Y = 235;

const GRAPH_WIDTH = 1040;
const GRAPH_HEIGHT = 105;


// ======================================================
// GRAPH DATA
// ======================================================

const values = timeline.map(
  item => Number(item.commits || 0)
);

const maxValue = Math.max(
  ...values,
  1
);


const points = timeline.map(
  (item, index) => {

    const x =
      GRAPH_X +
      (
        index /
        Math.max(
          timeline.length - 1,
          1
        )
      ) *
      GRAPH_WIDTH;

    const value =
      Number(item.commits || 0);

    const y =
      GRAPH_Y +
      GRAPH_HEIGHT -
      (
        value / maxValue
      ) *
      GRAPH_HEIGHT;

    return {
      x,
      y,
      value,
      date: item.date
    };
  }
);


// ======================================================
// GRAPH PATH
// ======================================================

const linePath = points
  .map(
    (point, index) => {

      const command =
        index === 0
          ? "M"
          : "L";

      return (
        `${command} ` +
        `${point.x.toFixed(2)} ` +
        `${point.y.toFixed(2)}`
      );
    }
  )
  .join(" ");


// ======================================================
// GRAPH AREA
// ======================================================

const areaPath = `
  ${linePath}
  L ${GRAPH_X + GRAPH_WIDTH}
    ${GRAPH_Y + GRAPH_HEIGHT}
  L ${GRAPH_X}
    ${GRAPH_Y + GRAPH_HEIGHT}
  Z
`;


// ======================================================
// GRAPH GRID
// ======================================================

let graphGrid = "";

for (let i = 0; i <= 4; i++) {

  const y =
    GRAPH_Y +
    (
      GRAPH_HEIGHT / 4
    ) * i;

  graphGrid += `
    <line
      x1="${GRAPH_X}"
      y1="${y}"
      x2="${GRAPH_X + GRAPH_WIDTH}"
      y2="${y}"
      stroke="#334155"
      stroke-width="1"
      opacity="0.35"
    />
  `;
}


// ======================================================
// GRAPH DOTS
// ======================================================

let graphDots = "";

points.forEach(
  point => {

    graphDots += `
      <circle
        cx="${point.x}"
        cy="${point.y}"
        r="3"
        fill="#06b6d4"
        stroke="#020617"
        stroke-width="2"
      />
    `;
  }
);


// ======================================================
// PROJECT TABLE
// ======================================================

let projectRows = "";

recentProjects.forEach(
  (project, index) => {

    const y =
      405 +
      index * 20;

    const name =
      truncate(
        project.name,
        65
      );

    const commits =
      Number(
        project.recent_commit_count || 0
      );

    projectRows += `
      <g>

        <circle
          cx="90"
          cy="${y - 4}"
          r="3"
          fill="#06b6d4"
        />

        <text
          x="104"
          y="${y}"
          fill="#cbd5e1"
          font-size="10"
          font-family="Arial, Helvetica, sans-serif"
        >
          ${escapeXml(name)}
        </text>

        <text
          x="1110"
          y="${y}"
          fill="#67e8f9"
          font-size="9"
          text-anchor="end"
          font-family="Arial, Helvetica, sans-serif"
        >
          ${commits}
          ${commits === 1 ? "commit" : "commits"}
        </text>

      </g>
    `;
  }
);


// ======================================================
// BUILD SVG
// ======================================================

const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${WIDTH}"
  height="${HEIGHT}"
  viewBox="0 0 ${WIDTH} ${HEIGHT}"
>

  <defs>

    <!-- Background -->

    <linearGradient
      id="background"
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >

      <stop
        offset="0%"
        stop-color="#020617"
      />

      <stop
        offset="55%"
        stop-color="#0f172a"
      />

      <stop
        offset="100%"
        stop-color="#111827"
      />

    </linearGradient>


    <!-- Graph area -->

    <linearGradient
      id="graphArea"
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >

      <stop
        offset="0%"
        stop-color="#06b6d4"
        stop-opacity="0.24"
      />

      <stop
        offset="100%"
        stop-color="#06b6d4"
        stop-opacity="0"
      />

    </linearGradient>


    <!-- Glow -->

    <filter
      id="glow"
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
    >

      <feGaussianBlur
        stdDeviation="4"
        result="blur"
      />

      <feMerge>

        <feMergeNode
          in="blur"
        />

        <feMergeNode
          in="SourceGraphic"
        />

      </feMerge>

    </filter>

  </defs>


  <!-- ==================================================
       BACKGROUND
       ================================================== -->

  <rect
    width="${WIDTH}"
    height="${HEIGHT}"
    rx="28"
    fill="url(#background)"
  />


  <!-- ==================================================
       BACKGROUND GRID
       ================================================== -->

  <g
    opacity="0.06"
    stroke="#64748b"
    stroke-width="1"
  >

    ${Array.from(
      { length: 25 },
      (_, index) => `
        <line
          x1="${index * 50}"
          y1="0"
          x2="${index * 50}"
          y2="${HEIGHT}"
        />
      `
    ).join("")}

    ${Array.from(
      { length: 11 },
      (_, index) => `
        <line
          x1="0"
          y1="${index * 50}"
          x2="${WIDTH}"
          y2="${index * 50}"
        />
      `
    ).join("")}

  </g>


  <!-- ==================================================
       MAIN PANEL
       ================================================== -->

  <rect
    x="30"
    y="30"
    width="1140"
    height="460"
    rx="26"
    fill="#020617"
    stroke="#1e3a8a"
    stroke-width="1"
  />

  <rect
    x="40"
    y="40"
    width="1120"
    height="440"
    rx="20"
    fill="#0f172a"
    opacity="0.94"
  />


  <!-- ==================================================
       HEADER
       ================================================== -->

  <text
    x="70"
    y="78"
    fill="#67e8f9"
    font-size="10"
    letter-spacing="3"
    font-family="Arial, Helvetica, sans-serif"
  >
    GITHUB // DEVELOPMENT ANALYTICS
  </text>


  <text
    x="70"
    y="112"
    fill="#f8fafc"
    font-size="23"
    font-weight="bold"
    font-family="Arial, Helvetica, sans-serif"
  >
    PROJECT ACTIVITY
  </text>


  <text
    x="70"
    y="132"
    fill="#64748b"
    font-size="9"
    letter-spacing="1.5"
    font-family="Arial, Helvetica, sans-serif"
  >
    REAL GITHUB ACTIVITY // LAST 30 DAYS
  </text>


  <!-- LIVE -->

  <circle
    cx="1070"
    cy="72"
    r="5"
    fill="#10b981"
    filter="url(#glow)"
  />

  <text
    x="1084"
    y="76"
    fill="#64748b"
    font-size="9"
    font-family="Arial, Helvetica, sans-serif"
  >
    LIVE DATA
  </text>


  <!-- ==================================================
       METRICS
       ================================================== -->

  <g>

    <text
      x="70"
      y="175"
      fill="#67e8f9"
      font-size="28"
      font-weight="bold"
      font-family="Arial, Helvetica, sans-serif"
    >
      ${activeProjects}
    </text>

    <text
      x="70"
      y="192"
      fill="#64748b"
      font-size="8"
      letter-spacing="1"
      font-family="Arial, Helvetica, sans-serif"
    >
      ACTIVE PROJECTS
    </text>

  </g>


  <g>

    <text
      x="250"
      y="175"
      fill="#a78bfa"
      font-size="28"
      font-weight="bold"
      font-family="Arial, Helvetica, sans-serif"
    >
      ${totalRecentCommits}
    </text>

    <text
      x="250"
      y="192"
      fill="#64748b"
      font-size="8"
      letter-spacing="1"
      font-family="Arial, Helvetica, sans-serif"
    >
      COMMITS / 30 DAYS
    </text>

  </g>


  <g>

    <text
      x="445"
      y="175"
      fill="#f0abfc"
      font-size="28"
      font-weight="bold"
      font-family="Arial, Helvetica, sans-serif"
    >
      ${recentProjects.length}
    </text>

    <text
      x="445"
      y="192"
      fill="#64748b"
      font-size="8"
      letter-spacing="1"
      font-family="Arial, Helvetica, sans-serif"
    >
      TOP ACTIVE REPOS
    </text>

  </g>


  <!-- ==================================================
       GRAPH
       ================================================== -->

  <line
    x1="70"
    y1="205"
    x2="1130"
    y2="205"
    stroke="#1e293b"
    stroke-width="1"
  />

  ${graphGrid}


  <path
    d="${areaPath}"
    fill="url(#graphArea)"
  />


  <path
    d="${linePath}"
    fill="none"
    stroke="#06b6d4"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    filter="url(#glow)"
  />


  ${graphDots}


  <!-- GRAPH DATES -->

  <text
    x="${GRAPH_X}"
    y="${GRAPH_Y + GRAPH_HEIGHT + 22}"
    fill="#475569"
    font-size="8"
    font-family="Arial, Helvetica, sans-serif"
  >
    ${timeline[0]?.date || ""}
  </text>


  <text
    x="${GRAPH_X + GRAPH_WIDTH}"
    y="${GRAPH_Y + GRAPH_HEIGHT + 22}"
    fill="#475569"
    font-size="8"
    text-anchor="end"
    font-family="Arial, Helvetica, sans-serif"
  >
    ${timeline[timeline.length - 1]?.date || ""}
  </text>


  <!-- ==================================================
       PROJECT TABLE
       ================================================== -->

  <line
    x1="70"
    y1="365"
    x2="1130"
    y2="365"
    stroke="#1e293b"
    stroke-width="1"
  />


  <text
    x="70"
    y="388"
    fill="#94a3b8"
    font-size="8"
    letter-spacing="1.5"
    font-family="Arial, Helvetica, sans-serif"
  >
    RECENTLY ACTIVE PROJECTS
  </text>


  ${projectRows}


  <!-- ==================================================
       LAST PUSH
       ================================================== -->

  <text
    x="70"
    y="472"
    fill="#475569"
    font-size="8"
    font-family="Arial, Helvetica, sans-serif"
  >
    LAST PUSH:
    ${escapeXml(
      formatDate(
        latestCommit.date
      )
    )}
    //
    ${escapeXml(
      truncate(
        latestCommit.message,
        100
      )
    )}
  </text>


  <!-- ==================================================
       DECORATIVE CORNERS
       ================================================== -->

  <path
    d="M 30 70 L 30 30 L 70 30"
    fill="none"
    stroke="#06b6d4"
    stroke-width="2"
  />

  <path
    d="M 1170 450 L 1170 490 L 1130 490"
    fill="none"
    stroke="#a855f7"
    stroke-width="2"
  />

</svg>
`;


// ======================================================
// WRITE SVG FILE
// ======================================================

fs.writeFileSync(
  OUTPUT_FILE,
  svg.trim(),
  "utf8"
);


// ======================================================
// TERMINAL OUTPUT
// ======================================================

console.log("");
console.log("==========================================");
console.log("GITHUB ANALYTICS GENERATED");
console.log("==========================================");
console.log(`Projects: ${activeProjects}`);
console.log(`Commits / 30 days: ${totalRecentCommits}`);
console.log(`Timeline points: ${timeline.length}`);
console.log(`Output: ${OUTPUT_FILE}`);
console.log("==========================================");