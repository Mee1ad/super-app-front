# Changelog Management System

A comprehensive changelog management system with role-based access control, AI-powered changelog generation, and a modern React frontend.

## Features

### Core Functionality
- **AI-powered changelog generation** from git commits using DeepSeek
- **Role-based access control** with Admin, Editor, and Viewer roles
- **Draft/Published workflow** for changelog entries
- **Semantic versioning** support
- **User view tracking** for unread changelog entries
- **Comprehensive filtering** and search capabilities
- **Pagination** for large changelog lists

### User Interface
- **Modern React components** with TypeScript
- **Responsive design** for mobile and desktop
- **Real-time updates** with optimistic UI
- **Permission-based UI** that adapts to user roles
- **Toast notifications** for user feedback
- **Loading states** and error handling

### API Integration
- **RESTful API** with full CRUD operations
- **Authentication** with JWT tokens
- **Error handling** with proper HTTP status codes
- **Request/response interceptors** for centralized logic
- **TypeScript interfaces** for all data types

## Architecture

### Directory Structure
```
app/changelog/
├── atoms/           # Core business logic and data
│   ├── types.ts     # TypeScript interfaces and types
│   ├── api.ts       # API service layer
│   ├── useChangelogApi.ts  # Custom hooks for API operations
│   ├── useAuth.ts   # Authentication and permission management
│   ├── mock-data.ts # Mock data for development/testing
│   └── api.test.ts  # API service tests
├── molecules/       # Reusable UI components
│   ├── ChangelogCard.tsx    # Individual changelog entry display
│   ├── ChangelogFilters.tsx # Filtering and search controls
│   └── Pagination.tsx       # Pagination component
├── organisms/       # Complex UI components
│   ├── ChangelogList.tsx    # Main changelog list view
│   └── AdminDashboard.tsx   # Admin dashboard with statistics
└── page.tsx         # Main page component
```

### Data Models

#### ChangelogEntry
```typescript
interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  change_type: ChangeType;
  is_breaking: boolean;
  commit_hash: string;
  commit_date: string;
  commit_message: string;
  release_date: string;
  is_published: boolean;
  published_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}
```

#### User & Role System
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  role?: Role;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}
```

### Permission System

The system uses a granular permission system with the following permissions:

- `changelog:view` - View published changelog entries
- `changelog:create` - Create new changelog entries
- `changelog:update` - Edit existing changelog entries
- `changelog:delete` - Delete changelog entries
- `changelog:publish` - Publish/unpublish changelog entries
- `changelog:view_drafts` - View draft changelog entries

### Role Types
- **Admin**: Full access to all features
- **Editor**: Can create, edit, and publish changelog entries
- **Viewer**: Can only view published changelog entries

## API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Changelog Endpoints

#### Get Changelog Entries
```
GET /changelog
```
Query Parameters:
- `page` (number, default: 1)
- `per_page` (number, default: 20, max: 100)
- `version` (string, optional) - Filter by version
- `change_type` (string, optional) - Filter by change type
- `include_drafts` (boolean, optional) - Include draft entries

#### Get Single Changelog Entry
```
GET /changelog/{entry_id}
```

#### Get Changelog Summary
```
GET /changelog/summary/{version}
```

#### Get Unread Changelog
```
GET /changelog/unread?user_identifier={identifier}
```

#### Mark as Viewed
```
POST /changelog/mark-viewed
```
Body: `{ entry_id: string, user_identifier: string }`

#### Process New Commits (AI Generation)
```
POST /changelog/process-commits
```

#### Publish Changelog Entry
```
POST /changelog/publish
```
Body: `{ entry_id: string }`
Requires: `changelog:publish` permission

#### Unpublish Changelog Entry
```
POST /changelog/unpublish
```
Body: `{ entry_id: string }`
Requires: `changelog:publish` permission

#### Update Changelog Entry
```
PUT /changelog/{entry_id}
```
Body: `{ title?, description?, version?, change_type?, is_breaking? }`
Requires: `changelog:update` permission

#### Delete Changelog Entry
```
DELETE /changelog/{entry_id}
```
Requires: `changelog:delete` permission

#### Get Available Versions
```
GET /changelog/versions
```

#### Get Current Version
```
GET /changelog/current-version
```

## Usage

### Basic Setup

1. **Install dependencies** (already included in the project)
2. **Configure API URL** in environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
3. **Start the development server**:
   ```bash
   pnpm dev
   ```

### Authentication

The system includes a demo authentication system for development:

1. Click "Demo Login" to authenticate as an admin user
2. The system will simulate a logged-in user with full permissions
3. In production, replace the mock authentication with your actual auth system

### Using the Changelog System

#### Viewing Changelog Entries
1. Navigate to `/changelog`
2. Use filters to search and filter entries
3. Click on entries to view details
4. Use pagination to navigate through large lists

#### Managing Changelog Entries (Admin/Editor)
1. **Publish/Unpublish**: Click the eye icon on draft entries
2. **Edit**: Click the edit icon to modify entries
3. **Delete**: Click the trash icon to remove entries
4. **Process Commits**: Use the admin dashboard to generate new entries from git commits

#### Admin Dashboard
1. Navigate to the "Admin" tab
2. View statistics and system information
3. Use quick actions for common tasks
4. Monitor recent activity

## Development

### Adding New Features

1. **New API endpoints**: Add to `api.ts` and create corresponding hooks in `useChangelogApi.ts`
2. **New UI components**: Follow the atomic design pattern (atoms → molecules → organisms)
3. **New permissions**: Add to `types.ts` and update the permission system

### Testing

Run tests with:
```bash
pnpm test
```

The system includes comprehensive tests for:
- API service layer
- Custom hooks
- Component rendering
- Permission system

### Styling

The system uses:
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Custom design system** with consistent spacing and colors

### Performance Optimization

- **Virtual scrolling** for large lists (can be implemented)
- **Debounced search** and filtering
- **API response caching** in hooks
- **Optimistic updates** for better UX
- **Lazy loading** of components

## Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Authentication (for production)
NEXT_PUBLIC_AUTH_PROVIDER=your-auth-provider
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
```

### Customization

#### Change Type Colors
Modify `CHANGE_TYPE_CONFIG` in `types.ts` to customize colors and icons for different change types.

#### Permission System
Extend the permission system by adding new permissions to `PERMISSIONS` in `types.ts`.

#### API Configuration
Update the API base URL and add custom headers in `api.ts`.

## Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Environment Setup
1. Set production API URL
2. Configure authentication system
3. Set up monitoring and error tracking
4. Configure CDN for static assets

### Security Considerations
- Implement proper authentication and authorization
- Use HTTPS in production
- Validate all user inputs
- Implement rate limiting
- Set up proper CORS policies

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check API URL configuration
   - Verify backend server is running
   - Check network connectivity

2. **Authentication Issues**
   - Clear localStorage and re-authenticate
   - Check token expiration
   - Verify permission configuration

3. **Permission Errors**
   - Check user role assignment
   - Verify permission configuration
   - Check API response for permission details

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## Contributing

1. Follow the existing code structure and patterns
2. Add tests for new features
3. Update documentation for API changes
4. Follow TypeScript best practices
5. Use the established component hierarchy

## License

This changelog system is part of the larger application and follows the same license terms. 