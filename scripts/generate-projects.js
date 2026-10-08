const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const projects = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "data/project-activity.json"),
    "utf8"
  )
);

const character = fs
  .readFileSync(
    path.join(ROOT, "assets/character-optimized.png")
  )
  .toString("base64");


// ======================================================
// SELECTED PROJECTS
// ======================================================

const selectedProjects = [
  {
    name: "FlowPilot",
    repo: "Agentic_Srishti--FlowPilot-Enterprise-Workflow-Orchestration-Platform",
    description:
      "Enterprise workflow orchestration platform"
  },

  {
    name: "ResolveIQ",
    repo: "ResolveIQ",
    description:
      "Intelligent problem solving platform"
  },

  {
    name: "QueryNest AI",
    repo: "QueryNest-ai",
    description:
      "AI-powered knowledge retrieval and RAG platform"
  },

  {
    name: "Buildora AI",
    repo: "Buildora-AI",
    description:
      "AI-powered website builder"
  },

  {
    name: "PulseMeet",
    repo: "PulseMeet",
    description:
      "Event registration and management platform"
  }
];


// ======================================================
// ADD REAL COMMIT DATA
// ======================================================

const projectCards = selectedProjects
  .map((project, index) => {

    const githubProject =
      projects.find(
        item =>
          item.name === project.repo
      );

    const commits =
      githubProject
        ? Number(
            githubProject.recent_commit_count || 0
          )
        : 0;

    const row =
      Math.floor(index / 2);

    const col =
      index % 2;

    const x =
      475 + col * 315;

    const y =
      145 + row * 105;

    const repoUrl =
      `https://github.com/SrashtiChauhan/${project.repo}`;

    return `
      <a
        href="${repoUrl}"
        target="_blank"
      >

        <g
          transform="translate(${x}, ${y})"
          cursor="pointer"
        >

          <rect
            width="285"
            height="82"
            rx="14"
            fill="#0f172a"
            stroke="#1e3a8a"
          />

          <circle
            cx="20"
            cy="25"
            r="4"
            fill="#06b6d4"
          />

          <text
            x="35"
            y="28"
            fill="#f8fafc"
            font-size="12"
            font-family="Arial"
            font-weight="bold"
          >
            ${project.name}
          </text>

          <text
            x="35"
            y="47"
            fill="#64748b"
            font-size="9"
            font-family="Arial"
          >
            ${project.description}
          </text>

          <text
            x="35"
            y="66"
            fill="#67e8f9"
            font-size="8"
            font-family="Arial"
          >
            ${commits} commits / 30 days
          </text>

          <text
            x="260"
            y="66"
            fill="#475569"
            font-size="8"
            text-anchor="end"
            font-family="Arial"
          >
            VIEW →
          </text>

        </g>

      </a>
    `;
  })
  .join("");


// ======================================================
// SVG
// ======================================================

const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1200"
  height="520"
  viewBox="0 0 1200 520"
>

  <defs>

    <linearGradient
      id="bg"
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
        offset="100%"
        stop-color="#111827"
      />

    </linearGradient>

  </defs>


  <!-- Background -->

  <rect
    width="1200"
    height="520"
    rx="28"
    fill="url(#bg)"
  />


  <!-- Header -->

  <text
    x="60"
    y="55"
    fill="#67e8f9"
    font-size="10"
    letter-spacing="3"
    font-family="Arial"
  >
    PROJECT UNIVERSE
  </text>

  <text
    x="60"
    y="90"
    fill="#f8fafc"
    font-size="25"
    font-weight="bold"
    font-family="Arial"
  >
    Things I Build
  </text>


  <!-- Character -->

  <image
    href="data:image/png;base64,${character}"
    x="70"
    y="125"
    width="335"
    height="335"
    preserveAspectRatio="xMidYMid meet"
  />


  <!-- Character glow -->

  <ellipse
    cx="235"
    cy="458"
    rx="125"
    ry="10"
    fill="#06b6d4"
    opacity="0.12"
  />


  <!-- Divider -->

  <line
    x1="440"
    y1="110"
    x2="440"
    y2="470"
    stroke="#1e3a8a"
    stroke-width="1"
  />


  <!-- Projects heading -->

  <text
    x="475"
    y="100"
    fill="#67e8f9"
    font-size="9"
    letter-spacing="2"
    font-family="Arial"
  >
    SELECTED PROJECTS
  </text>


  <!-- Clickable projects -->

  ${projectCards}


</svg>
`;


// ======================================================
// WRITE FILE
// ======================================================

fs.writeFileSync(
  path.join(ROOT, "projects.svg"),
  svg.trim(),
  "utf8"
);

console.log("Projects section generated.");
console.log(
  `Projects shown: ${selectedProjects.length}`
);