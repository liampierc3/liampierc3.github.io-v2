# Liam Pierce Portfolio Website

A static HTML website for Liam Pierce, Director / Editor / Cinematographer.

## Overview

This is a simple static HTML website built for showcasing Liam Pierce's portfolio as a filmmaker. The site includes:

- Home page with featured work
- Gallery page with filterable portfolio items
- About section
- Contact form (using Formspree for form submissions)

## Getting Started

### Local Development

To view the website locally:

1. Clone this repository
2. Open `index.html` in your web browser

That's it! Since this is a static HTML website, no build process or server is required.

### Customization

#### Contact Form

The contact form uses [Formspree](https://formspree.io/) to handle form submissions. To make the form work:

1. Sign up for a free Formspree account
2. Create a new form and get your form ID
3. Replace `YOUR_FORM_ID` in the form action in both `index.html` and `app/page.tsx` with your actual Formspree form ID:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

#### Content

To update the content:

- Edit `index.html` for the main page content
- Edit `gallery.html` for the portfolio gallery
- Update images by replacing the image URLs with your own
- Modify text content as needed

#### Styling

The website uses:

- Tailwind CSS (via CDN) for utility classes
- Custom CSS in `styles/globals.css`
- Inline styles for specific components

## Deployment

To deploy this website:

1. Upload all files to your web hosting provider
2. Ensure the following files and directories are included:
   - `index.html`
   - `gallery.html`
   - `styles/` directory
   - Any images or assets you've added

## Original Project

This website was converted from a Next.js project to a static HTML website. The original Next.js code is still available in the repository if you want to switch back to a dynamic site in the future.

## License

All rights reserved. This project and its contents are not licensed for reuse without permission.
