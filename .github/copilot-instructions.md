<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Zheus API - Copilot Instructions

## Project Overview
Node.js Web API: TypeScript + Express.js + Clean Architecture

## Core Principles
- **MVC Pattern**: Controllers → Services → Routes
- **TypeScript Strict**: Type safety required
- **RESTful APIs**: Standard conventions
- **Error Handling**: Custom middleware + meaningful messages
- **Async/Await**: No callbacks

## Code Standards
- Use `ResponseUtils` for API responses
- Wrap handlers with `asyncHandler`
- JSDoc for complex functions
- Follow existing `src/` structure
- Environment variables via `.env`

## Workflow Rules
⚠️ **IMPORTANT**: Always ask for confirmation before:
- Creating/modifying files
- Running terminal commands
- Making structural changes
- Installing dependencies


## Quick Reference
- Entity generation: `/api/entity/generate`
- Command generation: `/api/command/generate`  
- Full scaffold: `/api/project/scaffold`
- Validation: `/api/project/validate-scaffold`
