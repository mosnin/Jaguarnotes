# 01 Project Brief

## Product Summary

Jaguarnotes is an AI-native note-taking web application built for knowledge workers who want a thinking partner, not a blank canvas. Where Notion is a container you fill manually, Jaguarnotes is an intelligent co-author — the AI generates content, structures ideas, and expands concepts on demand via 14 slash commands and Tab-triggered autocomplete. All notes sync in real time across devices via Convex.

## Primary User

Researchers, founders, writers, and students who produce knowledge as a core part of their work. They write daily, struggle with blank-page paralysis, and want AI that enhances their thinking without breaking their flow. Single users in v1 — no team or org management.

## Core Problem

Current note tools are passive. AI features exist as chatbots bolted onto the side — they require the user to leave the editor, describe their need, copy output back in. This friction kills momentum. Users want intelligence baked into every keystroke.

## First Value Event

User triggers their first slash command in the editor and sees AI-generated content stream directly into the note — without leaving the keyboard, without copying, without context-switching.

## V1 Summary

V1 delivers the complete AI-powered writing experience: 14 slash commands (brainstorm, outline, table, diagram, explain, research, compress, punch, counter, sowhat, assume, question, premortem, brief), Tab autocomplete, a BlockNote rich-text editor, real-time sync, sharing with view/edit permissions, collaborative presence indicators, tag system, linked notes and backlinks, sub-notes, version history, Markdown export, and a dashboard with card carousel and Quick Start AI actions. All pages are mobile responsive.

## Non Goals

Billing/subscription tiers, multi-tenant organizations, admin panel, email notifications, mobile native apps, offline mode, Notion/Obsidian import, public publishing, comments, templates marketplace, and public API are all out of scope for v1.

## Technical Summary

Next.js 15 (App Router) with TypeScript and Tailwind CSS v4. Convex for real-time database and serverless functions (replaces Prisma/PostgreSQL per project constraint). Clerk for authentication. OpenAI GPT-4o mini for all AI features. Tavily for web search context. BlockNote for rich-text editing. Framer Motion for animations. White-and-light-blue neumorphism UI (hand-rolled, no UI library). Deployed on Vercel.
