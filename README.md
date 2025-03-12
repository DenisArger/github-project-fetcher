````markdown
# GitHub Project Columns Fetcher

## Project Description

This project is a Node.js script that connects to the GitHub GraphQL API to retrieve information about a GitHub Projects V2 project. The script performs the following tasks:

- Retrieves the project identifier (PROJECT_ID) by its name.
- Extracts the project's "Status" field, including its options (columns).
- Displays a mapping of column names (e.g., "Back Log", "To Do", "In Progress", "Blocked", "Review", "Done") to corresponding variables and their identifiers.

## Features

- Connects to the GitHub GraphQL API using a personal access token.
- Dynamically retrieves project data.
- Outputs column identifiers for the "Status" field with predefined variable names.

## Requirements

- Node.js version 12 or higher.
- A personal GitHub token with access rights to the GraphQL API.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```
````

2. Navigate to the project directory:
   ```bash
   cd <project_directory>
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Setup

Create a `.env` file in the root directory of the project and add your GitHub token:

```dotenv
TOKEN_AUTOMATIZATION=your_github_token
```

## Running the Script

Run the script by passing the project name as an argument. For example:

```bash
node index.js "Project Name"
```

After executing the script, the following will be displayed:

- The project identifier (PROJECT_ID).
- The identifier of the "Status" field (ID_COLUMN_STATUS).
- A mapping of column names to variables, for example:
  - `ID_COLUMN_STATUS_BACK_LOG = <column identifier>`
  - `ID_COLUMN_STATUS_TO_DO = <column identifier>`
  - `ID_COLUMN_STATUS_IN_PROGRESS = <column identifier>`
  - `ID_COLUMN_STATUS_BLOCKED = <column identifier>`
  - `ID_COLUMN_STATUS_REVIEW = <column identifier>`
  - `ID_COLUMN_STATUS_DONE = <column identifier>`

## License

This project is open-source. You are free to use and modify it as needed.
