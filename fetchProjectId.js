import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_API_URL = "https://api.github.com/graphql";
const TOKEN = process.env.TOKEN_AUTOMATIZATION;

if (!TOKEN) {
  throw new Error("❌ Токен GitHub не найден в .env файле.");
}

async function githubRequest(query) {
  const response = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  if (data.errors) {
    console.error(
      "❌ Ошибка GitHub API:",
      JSON.stringify(data.errors, null, 2)
    );
    throw new Error("GitHub API error");
  }

  return data.data;
}

async function fetchProjectId(projectName) {
  const query = `query {
    viewer {
      projectsV2(first: 10) {
        nodes {
          id
          title
        }
      }
    }
  }`;

  const data = await githubRequest(query);
  const project = data?.viewer?.projectsV2?.nodes.find(
    (p) => p.title === projectName
  );

  if (!project) {
    throw new Error(`❌ Проект с названием "${projectName}" не найден.`);
  }

  console.log(`✅ PROJECT_ID для "${projectName}": ${project.id}`);
  return project.id;
}

// Укажи название проекта, который хочешь найти
const projectName = process.argv[2];

if (!projectName) {
  console.error("❌ Укажите название проекта в аргументах.");
  process.exit(1);
}

fetchProjectId(projectName).catch((error) => console.error(error.message));
