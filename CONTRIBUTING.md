# Contributing to GYT Collector Regional API Integration

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/gyt-collector-regional-api-integration.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Making Changes

1. Make your changes in the feature branch
2. Follow the existing code style
3. Add tests for new functionality
4. Update documentation as needed

### Code Style

- Use ESLint for JavaScript linting
- Follow the existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Running Tests

Before submitting changes, ensure all tests pass:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code coverage
npm test -- --coverage
```

### Linting

Ensure your code passes linting:

```bash
npm run lint
```

## Commit Messages

Write clear, descriptive commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when relevant

Good examples:
```
Add OAuth token refresh mechanism
Fix XML parsing error for nested elements
Update API documentation for payment endpoint
```

## Pull Request Process

1. Update the README.md or relevant documentation with details of changes
2. Add tests that prove your fix is effective or that your feature works
3. Ensure all tests pass and linting is clean
4. Update the CHANGELOG.md with your changes
5. Submit your pull request with a clear description of the changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

## Testing Guidelines

### Unit Tests

- Test individual functions in isolation
- Mock external dependencies
- Use descriptive test names
- Aim for high code coverage

Example:
```javascript
describe('xmlToJson', () => {
  it('should convert valid XML to JSON object', async () => {
    const xml = '<request><amount>100</amount></request>';
    const result = await xmlToJson(xml);
    expect(result).toBeDefined();
    expect(result.transaction).toBeDefined();
  });
});
```

### Integration Tests

- Test complete workflows
- Mock external APIs (Akros)
- Verify request/response formats
- Test error scenarios

## Documentation

Update documentation when you:
- Add new features
- Change existing functionality
- Fix bugs that affect usage
- Add new configuration options

Documentation files:
- `README.md` - Main project documentation
- `API_DOCUMENTATION.md` - API endpoint details
- `DEPLOYMENT.md` - Deployment instructions
- `ARCHITECTURE.md` - System architecture
- `CHANGELOG.md` - Version history

## Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**:
   - Node.js version
   - npm version
   - Operating system
   - Any relevant configuration

## Suggesting Enhancements

When suggesting enhancements:

1. **Use Case**: Describe the use case for the enhancement
2. **Proposed Solution**: Your suggested implementation
3. **Alternatives**: Other approaches you considered
4. **Impact**: How this affects existing functionality

## Project Structure

```
gyt-collector-regional-api-integration/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── middleware/     # Express middleware
├── tests/
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
├── docs/              # Additional documentation
└── config/            # Configuration files
```

## Key Technologies

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **xml2js**: XML parsing and building
- **Axios**: HTTP client
- **Winston**: Logging
- **Jest**: Testing framework
- **ESLint**: Code linting

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues and pull requests
- Open a new issue with your question

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC).

Thank you for contributing! 🎉
