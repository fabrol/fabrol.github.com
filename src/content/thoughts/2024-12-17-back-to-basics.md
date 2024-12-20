---
title: Back to basics
date: '2024-12-17'
draft: false
slug: back-to-basics
projectSlug: personal-website
tags: ['projects']
socialLinks: {}
---
*"What I cannot create, I do not understand."* — Richard P. Feynman

In an age of AI-generated code and bloated web frameworks, I took inspiration from [digital gardens](https://maggieappleton.com/garden-history) and chose to do it the old fashioned way. Rather than reaching for the usual frameworks or libraries, I’m hand rolling it from the ground up.

Is it novel? *No.*

Is it theraputic? *Yes.*

A kind of catharsis for those of us who cut our teeth in the pre-AI, hand-crafted web era. To resist the capitalist-work-urge to only do something if its "novel" or "improves something".

I started with a landing page. Then build injection to share components. Then a blog engine..on and on. Each step added a layer of depth to the site, making it feel more interconnected. And while frameworks might have made some of these features easier, building them myself was quite satisfying 😌

### The Build System

At the heart of the site is a custom build system written in [Deno](https://deno.land/). It’s inspired by static site generators but keeps things simple and focused, much like the rest of the project.

#### Page Composition

The site’s structure is modular, using templates to assemble pages from reusable components. The build system (found in `scripts/build.ts`) handles tasks like:

- Loading and merging HTML templates
- Injecting shared elements like navigation and footers
- Processing markdown files for blog posts
- Copying and optimizing assets

Each page has a clean, predictable layout:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Injected head component -->
</head>
<body>
  <div class="container">
    <!-- Injected navigation -->
    <main>
      <!-- Page content -->
    </main>
    <!-- Injected footer -->
  </div>
</body>
</html>
```

#### The Blog Engine
It’s simple, but it gets the job done and has room to grow. Features include:

- Frontmatter for metadata
- Automatic slug generation
- Date-based sorting
- Relationships to related projects
- Social media sharing links

Here’s an example of a markdown post with YAML frontmatter:

```yaml
---
title: "My Post Title"
date: '2024-12-20'
draft: false
slug: my-post
projectSlug: related-project
socialLinks:
  twitter: https://twitter.com/...
---
```

The build system parses these files, converts them to HTML, and slots them into the site’s templates. Simple and satisfying.

#### Development Workflow

I wanted the development experience to feel frictionless. Here’s what’s included:

- A watch system for automatic rebuilds during development
- A CLI task to create new blog posts
- Local file serving for quick testing
- GitHub Actions for automated deployment

For example, creating a new blog post is as simple as:

```bash
deno task new-thought "My New Post Title"
```
The site is hosted on GitHub Pages with a custom GitHub Action workflow .

### Browse and Explore

It’s fun to dig into the details of how things work, and this site is built with that curiosity in mind. Everything here is simple and open—a nod to the joy of creating systems from scratch. Please browse away, and enjoy exploring how it all comes together.

