<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Zheus API - Copilot Instructions

## Project Overview
This is a Node.js Web API built with TypeScript, Express.js, and modern development tools.

## Architecture Guidelines
- Follow the MVC pattern with controllers, services, and routes
- Use TypeScript for type safety
- Implement proper error handling with custom middleware
- Use async/await for asynchronous operations
- Follow RESTful API conventions

## Code Style Guidelines
- Use TypeScript strict mode
- Follow the existing project structure in `src/`
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Use the `ResponseUtils` class for consistent API responses
- Wrap async route handlers with `asyncHandler` utility

## File Organization
- Controllers: Handle HTTP requests and responses
- Services: Business logic and data processing
- Routes: API endpoint definitions
- Middleware: Custom middleware functions
- Types: TypeScript type definitions
- Utils: Helper functions and utilities

## Error Handling
- Use the custom error handler middleware
- Throw errors with appropriate status codes
- Provide meaningful error messages
- Log errors for debugging

## Environment Variables
- Store sensitive data in `.env` file
- Use `process.env` to access environment variables
- Follow the pattern in `.env.example`

## Testing
- Write unit tests for services
- Test API endpoints with integration tests
- Mock external dependencies

When generating code, follow these patterns and maintain consistency with the existing codebase.
