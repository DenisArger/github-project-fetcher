import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_API_URL = "https://api.github.com/graphql";
const TOKEN = process.env.TOKEN_AUTOMATIZATION;
const ORGANIZATION = process.env.GITHUB_ORG || null;

if (!TOKEN) {
  throw new Error("❌ GitHub token not found in .env file.");
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
    console.error("❌ GitHub API Error:", JSON.stringify(data.errors, null, 2));
    throw new Error("GitHub API error");
  }
  return data.data;
}

async function fetchProjectId(projectName) {
  let projects = [];

  if (ORGANIZATION) {
    const orgQuery = `query {
      organization(login: "${ORGANIZATION}") {
        projectsV2(first: 20) {
          nodes {
            id
            title
          }
        }
      }
    }`;

    const orgData = await githubRequest(orgQuery);
    projects = orgData?.organization?.projectsV2?.nodes || [];

    if (projects.length === 0) {
      console.warn("⚠️ There are no available projects in the organization.");
    }
  }

  if (projects.length === 0) {
    const userQuery = `query {
      viewer {
        projectsV2(first: 10) {
          nodes {
            id
            title
          }
        }
      }
    }`;

    const userData = await githubRequest(userQuery);
    projects = userData?.viewer?.projectsV2?.nodes || [];
    if (projects.length === 0) {
      throw new Error(
        "❌ The projects were not found either in the organization or among the personal ones."
      );
    }
  }

  const project = projects.find((p) => p.title === projectName);
  if (!project) {
    throw new Error(`❌ Project with name "${projectName}" not found.`);
  }

  console.log(`Info about "${projectName}":\n`);
  console.log(`ID_PROJECT=${project.id}`);

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
    throw new Error(`❌ Field "Status" not found in project ${projectId}.`);
  }

  console.log(`ID_COLUMN_STATUS=${statusField.id}`);
  return statusField;
}

(async () => {
  const projectName = process.argv[2];

  if (!projectName) {
    console.error("❌ Please provide a project name as an argument.");
    process.exit(1);
  }

  try {
    const projectId = await fetchProjectId(projectName);
    const statusField = await fetchStatusField(projectId);

    const columns = statusField.options;
    if (!columns) {
      throw new Error(`❌ No columns found for the "Status" field.`);
    }

    const statusMapping = {
      "Need Definition": "ID_COLUMN_STATUS_NEED_DEFINITION",
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
        console.log(`${varName}=${option.id}`);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
})();
