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

  console.log(`Info about "${projectName}":`);
  console.log(``);

  console.log(`PROJECT_ID=${project.id}`);
  return project.id;
}

async function fetchStatusField(projectId) {
  const query = `query {
    node(id: "${projectId}") {
      ... on ProjectV2 {
        fields(first: 20) {
          nodes {
            __typename
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
            ... on ProjectV2Field {
              id
              name
            }
          }
        }
      }
    }
  }`;

  const data = await githubRequest(query);
  const statusField = data?.node?.fields?.nodes.find(
    (field) => field.name === "Status"
  );

  if (!statusField) {
    throw new Error(`❌ Поле "Status" не найдено в проекте ${projectId}.`);
  }

  console.log(`ID_COLUMN_STATUS: ${statusField.id}`);
  return statusField;
}

(async () => {
  const projectName = process.argv[2];

  if (!projectName) {
    console.error("❌ Укажите название проекта в аргументах.");
    process.exit(1);
  }

  try {
    const projectId = await fetchProjectId(projectName);
    const statusField = await fetchStatusField(projectId);

    const columns = statusField.options;
    if (!columns) {
      throw new Error(`❌ Для поля "Status" не найдены столбцы.`);
    }

    const statusMapping = {
      "Back Log": "ID_COLUMN_STATUS_BACK_LOG",
      "To Do": "ID_COLUMN_STATUS_TO_DO",
      "In Progress": "ID_COLUMN_STATUS_IN_PROGRESS",
      Blocked: "ID_COLUMN_STATUS_BLOCKED",
      Review: "ID_COLUMN_STATUS_REVIEW",
      Done: "ID_COLUMN_STATUS_DONE",
    };

    columns.forEach((option) => {
      const varName = statusMapping[option.name];
      if (varName) {
        console.log(`${varName} = ${option.id}`);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
})();
