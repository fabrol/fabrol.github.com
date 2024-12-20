export function generateProjectCard(project: Project): string {
  return `
    <div class="project-card" onclick="window.location='/projects/${
      project.slug
    }.html'">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-meta">
        ${project.technologies
          ?.map((tech) => `<span class="tech-tag">${tech}</span>`)
          .join("")}
      </div>
      <div class="project-links">
        ${
          project.url
            ? `<a href="${project.url}" onclick="event.stopPropagation()" target="_blank">View Project</a>`
            : ""
        }
        ${
          project.github
            ? `<a href="${project.github}" onclick="event.stopPropagation()" target="_blank">Source Code</a>`
            : ""
        }
      </div>
    </div>
  `;
}
