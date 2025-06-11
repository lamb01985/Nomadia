# Nomadia

🛠️ Installation Instructions

Clone the repo
git clone {git@shh}
cd nomadia

✈️ frontend

- npm install @mui/material @emotion/react @emotion/styled
- npm install @fontsource/roboto
- npm install @mui/icons-material
- npm i react-router-dom
- npm run dev

💾 Server/Backend:

- docker kill $(docker ps -q)
- docker system prune -af
- docker compose up -d
- docker exec -it postgres_db psql -U postgres
- \c nomadia
- \i data/trips.sql;

- python -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt
- fastapi dev main.py

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.galvanize.com/livetolaff123/nomadia.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.galvanize.com/livetolaff123/nomadia/-/settings/integrations)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

---

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name

Nomadia: Trip planner and logger

## Description

Utilizing AI we seek to assist users to plan a trip itinerary and keep track of everything that happened on said adventures with pictures and notes

## Usage

After inputing a location, the page should present a list of itinerary suggestions

When a user is on a trip they should be able to store information about their trip including pictures and notes

## Authors and acknowledgment

Sarah Lambertson
Carla Belden
Eliza Rose Gadzinski
Caroline Short
Maya Valdez

## License

For open source projects, say how it is licensed.

## Project status

Starting
