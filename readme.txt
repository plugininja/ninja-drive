=== Ninja Drive ===
Contributors: plugininja, abdullaharham
Tags: google drive, file manager, gallery, media library, cloud integration
Requires at least: 6.2
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Complete Google Drive plugin for WordPress. Browse, manage, embed, and serve Google Drive files — all without leaving your dashboard.

== Description ==

Ninja Drive is a Google Drive integration for WordPress — file manager, gallery, media player, uploader, and more, all in one plugin.

It's a feature-complete, self-hosted Google Drive experience built entirely inside your WordPress dashboard. Connect your Drive account, manage files, embed content, and let visitors upload — no third-party portals, no switching tabs, no complicated setups.

Whether you're a freelancer sharing client deliverables, an agency managing media assets, an educator distributing course files, or a developer building a custom file-sharing workflow, Ninja Drive gives you the entire Google Drive ecosystem, right inside WordPress. No SaaS lock-in. No upload limits tied to a subscription tier. Just your files, fully under your control.

This isn't a simple embed tool. It's a full file management and content delivery platform powered by Google Drive, built from the ground up to feel like a native part of your WordPress site.

#### Ninja Drive is for you if you want to:

* Manage Google Drive files without ever leaving WordPress
* Let visitors or clients upload files directly to your Drive
* Embed documents, videos, audio, galleries, and sliders on any page
* Serve downloadable products securely from Google Drive
* Improve your WordPress media library with Google Drive storage
* Restrict file and folder access by user role, password, or login status

### Features by Category

#### 🗂️ File Management

* **Full File Operations** – Upload, download, rename, move, copy, delete, share, and create folders directly from your WordPress admin
* **Advanced Search** – Locate any file or folder instantly using powerful real-time search filters
* **Caching & Pagination** – Optimized browsing experience for large folders with hundreds of files.

#### 🧩 Module Builder

Build custom display modules and place them anywhere on your site using blocks, Elementor widgets, or shortcodes.

* **File Browser Module** – A fully customizable file browser for any folder, displayed beautifully on the frontend
* **Gallery Module** – Let clients preview, select, and download approved images or send selections directly to you
* **Embed Module** – Embed documents, PDFs, images, audio, and video anywhere using blocks, widgets, or shortcodes

#### 🎨 Appearance & Customization

* **Appearance Options** – Customize colors, layouts, card styles, borders, and backgrounds to match your brand
* **Fully Responsive** – Every module, gallery, and embed adapts perfectly to any device

#### ⚡ Performance

* Files are streamed directly from Google Drive — nothing is stored on your server
* Caching layer for fast browsing even in large folders
* Pagination for smooth navigation through thousands of files
* Separate plugin logic doesn't interfere with your WordPress page speed
* Auto Save – Settings are saved automatically, so no changes are ever lost

### Integrations

#### 🧱 Page Builders & Editors 

* **Gutenberg Blocks** – Blocks for file browsers, galleries, media players, upload forms, and more
* **Elementor Widgets** – Widgets to add Google Drive content to any Elementor layout

#### 🛠️ Developer Tools

* **REST API** – All plugin endpoints run on REST API for better performance and security

== External Services ==

This plugin connects to the **Google Drive API** to enable full integration with your Google Drive account.

=== What data is sent and when ===

* When you authorize the plugin, it requests OAuth 2.0 permission to access your Google Drive
* The plugin sends authentication tokens and API requests to Google Drive API endpoints when you perform file actions
* No data is shared with any third party other than Google
* The plugin does not store or transmit sensitive user data beyond what is required for Drive access

=== Why this data is sent ===

* To retrieve and display your Google Drive file lists
* To upload and manage files within Google Drive
* To display embedded documents such as Google Sheets, Docs, or Slides on your site

=== Service Provider Information ===

**Service Provider:** Google LLC
**Service Used:** Google Drive API
**Terms of Service:** https://policies.google.com/terms
**Privacy Policy:** https://policies.google.com/privacy
**Google Drive API Terms:** https://developers.google.com/workspace/drive/api/terms
**Google API Services User Data Policy:** https://developers.google.com/terms/api-services-user-data-policy
**Service Provider:** Microsoft Corporation
**Service Used:** Office Online Viewer
**Terms of Service:** https://www.microsoft.com/en-us/legal/terms-of-use
**Privacy Policy:** https://www.microsoft.com/en-us/privacy/privacystatement

=== External Domains Used ===

* `https://www.googleapis.com/drive/v3/files/` – Google Drive file operations
* `https://www.googleapis.com/auth/drive` – OAuth scope for Drive access
* `https://accounts.google.com` – Google OAuth authorization
* `https://apps.googleusercontent.com` – OAuth client ID processing
* `https://drive.google.com` – Google Drive file management and browsing
* `https://docs.google.com` – Embedded Google Docs, Sheets, Slides, and PDF popup preview
* `https://docs.google.com/spreadsheets/` – Embedded Google Sheets display
* `https://docs.google.com/viewerng/viewer?embedded=true&url=` – PDF popup preview
* `https://sites.google.com` – Google Sites content display in popup preview
* `https://script.google.com` – Google Apps Script integration
* `https://lh3.googleusercontent.com` – User file and folder thumbnails
* `https://drive-thirdparty.googleusercontent.com` – Third-party Google Drive content rendering
* `https://view.officeapps.live.com/op/view.aspx?src=` – Office file popup preview

== Installation ==

= Install from WordPress Admin (Recommended) =
1. Go to **Plugins → Add New** in your WordPress dashboard
2. Search for **"Ninja Drive"**
3. Click **Install Now**, then **Activate**

= Connecting Your Google Drive =

**Own App Setup (Recommended for Multiple Sites or Branding)**

**Step 1:** Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project

**Step 2:** Enable **Google Drive API** via APIs & Services → Library

**Step 3:** Go to **APIs & Services → OAuth Consent Screen** and configure your app name and contact details

**Step 4:** Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**

**Step 5:** Choose **Web Application**, then copy the **Redirect URI** from your plugin settings (Ninja Drive → Settings → Own App) and paste it into **Authorized Redirect URIs**

**Step 6:** Copy your **Client ID** and **Client Secret**, then paste them into the plugin settings and click **Authorize**

== Additional Notes ==

This plugin bundles a modified version of the Google API Client library, which is licensed under the Apache License, Version 2.0. The Apache 2.0 license is compatible with GPLv3, and as this plugin is licensed "GPL-2.0-or-later", the combined work is compatible with and may be used under GPLv3 terms, though this plugin itself remains licensed under GPL-2.0-or-later.

File type thumbnail icons are loaded from Google's CDN (drive-thirdparty.googleusercontent.com) as a fallback when no local thumbnail is available. This is an image resource only — no executable code. Thumbnail requests may also proxy content through Google's servers (googleapis.com, lh3.googleusercontent.com) when displaying file previews in the WordPress admin or frontend.

== Frequently Asked Questions ==

= Do files get copied to my server? =
No. All files remain in Google Drive. Ninja Drive streams or embeds them directly from Google's infrastructure.

= How secure is the connection? =
Very secure. Ninja Drive uses OAuth 2.0 for authentication and encrypted channels for all data transfer. No Google account credentials, file IDs, or sensitive data are exposed on the frontend.

= Can I use my own Google Cloud credentials? =
Yes. Go to **Ninja Drive → Settings → Own App** and enter your Client ID and Client Secret to use your own Google Cloud application.

= Which file types can I embed? =
Most common formats are supported, including images (JPG, PNG, GIF, WebP), audio (MP3, WAV), video (MP4, MOV), documents (PDF, DOCX, XLSX, PPTX), and all native Google formats (Docs, Sheets, Slides, Forms).

= Can I restrict who sees certain files or folders? =
Yes. You can restrict access by user role, login status, or password. Private folder support for individual users is also available.

= Can visitors upload files to my Google Drive? =
Yes. The File Uploader Module allows visitors, clients, or customers to upload files directly to your connected Drive account from any page on your site.

== Shortcodes ==

Use the built-in Shortcode Builder to generate all parameters visually. Example: `[ninja-drive id="1"]`

== Contribute ==

Ninja Drive is an open-source project. You can view the full unminified source and contribute on GitHub:
https://github.com/plugininja/ninja-drive

== Changelog ==

= 1.0.0 =
* Initial release of Ninja Drive

== Upgrade Notice ==

= 1.0.0 =
Initial release of Ninja Drive