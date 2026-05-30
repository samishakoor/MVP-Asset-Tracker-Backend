import { SERVER_URL } from './index.js';

/**
 * Swagger/OpenAPI configuration for Asset Tracker API
 * All path definitions are centralized 
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Asset Tracker API',
    version: '1.0.0',
    description: 'Complete API documentation for the Asset Tracker backend - employee asset management, assignments, support tickets, and audit logs.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: SERVER_URL,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from login/signup endpoint',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                example: 'ValidationError',
              },
              message: {
                type: 'string',
                example: 'Validation failed',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cuid123456789',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            example: 'john.doe@example.com',
          },
          role: {
            type: 'string',
            enum: ['admin', 'employee'],
            example: 'employee',
          },
          isVerified: {
            type: 'boolean',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Asset: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
            example: 'MacBook Pro 16"',
          },
          assetType: {
            type: 'string',
            example: 'laptop',
          },
          serialNumber: {
            type: 'string',
            example: 'SN123456789',
          },
          condition: {
            type: 'string',
            enum: ['new', 'good', 'fair', 'damaged'],
            example: 'good',
          },
          status: {
            type: 'string',
            enum: ['available', 'assigned', 'acknowledged', 'pending_review', 'under_repair'],
            example: 'available',
          },
          notes: {
            type: 'string',
            nullable: true,
          },
          isDeleted: {
            type: 'boolean',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Assignment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          assetId: {
            type: 'string',
          },
          employeeId: {
            type: 'string',
          },
          assignedBy: {
            type: 'string',
          },
          assignedAt: {
            type: 'string',
            format: 'date-time',
          },
          acknowledgedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          returnedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          isActive: {
            type: 'boolean',
          },
          currentStatus: {
            type: 'string',
            enum: ['assigned', 'acknowledged', 'pending_review', 'under_repair'],
          },
        },
      },
      SupportTicket: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          assignmentId: {
            type: 'string',
          },
          reportedBy: {
            type: 'string',
          },
          reviewedBy: {
            type: 'string',
            nullable: true,
          },
          description: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['open', 'under_review', 'resolved'],
          },
          adminNotes: {
            type: 'string',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          userId: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
          assetId: {
            type: 'string',
            nullable: true,
          },
          assetName: {
            type: 'string',
            nullable: true,
          },
          isRead: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          total_records: {
            type: 'integer',
            example: 50,
          },
          total_pages: {
            type: 'integer',
            example: 5,
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health Check',
      description: 'API health verification',
    },
    {
      name: 'Authentication',
      description: 'Public authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management and employee self-service',
    },
    {
      name: 'Assets',
      description: 'Asset inventory management (Admin)',
    },
    {
      name: 'Assignments',
      description: 'Asset assignment workflow',
    },
    {
      name: 'Support Tickets',
      description: 'Employee support tickets and admin review',
    },
    {
      name: 'Notifications',
      description: 'Employee notification inbox',
    },
    {
      name: 'Admin',
      description: 'Admin dashboard and audit logs',
    },
  ],
  paths: {
    '/ping': {
      get: {
        tags: ['Health Check'],
        summary: 'API health check',
        description: 'Public — Verify that the API is running',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'pong' },
                  },
                },
              },
            },
          },
        },
      },
    },
  
    // ========== AUTHENTICATION ROUTES ==========
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        description: 'Public — Create a new employee or admin account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                  password: { type: 'string', format: 'password', minLength: 6, example: 'SecurePass123' },
                  role: { type: 'string', enum: ['admin', 'employee'], default: 'employee' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', description: 'JWT authentication token' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or email already exists',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password',
        description: 'Public — Authenticate user and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                  password: { type: 'string', format: 'password', example: 'SecurePass123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', description: 'JWT authentication token' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request a password reset email',
        description: 'Public — Send a password reset link to the user\'s email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset email sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password reset email sent' },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password using a reset token',
        description: 'Public — Update password using the token from reset email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string', description: 'Reset token from email' },
                  newPassword: { type: 'string', format: 'password', minLength: 6, example: 'NewSecurePass123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password reset successful' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid or expired token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  
    '/auth/send-verification-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Send email verification link',
        description: 'Public — Resend verification email to unverified accounts',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Verification email sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Verification email sent' },
                  },
                },
              },
            },
          },
        },
      },
    },
  
    '/auth/verify-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify email address',
        description: 'Public — Confirm email address via token link',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string', description: 'Verification token from email' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Email verified successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid or expired token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  
    // ========== ASSET ROUTES ==========
    '/assets': {
      post: {
        tags: ['Assets'],
        summary: 'Register a new asset in inventory',
        description: 'Private (Admin) — Add a new hardware asset to the system',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'assetType', 'serialNumber', 'condition'],
                properties: {
                  name: { type: 'string', example: 'MacBook Pro 16"' },
                  assetType: { type: 'string', example: 'laptop' },
                  serialNumber: { type: 'string', example: 'SN123456789' },
                  condition: { type: 'string', enum: ['new', 'good', 'fair', 'damaged'], example: 'new' },
                  notes: { type: 'string', example: 'Purchased on 2024-01-15' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Asset created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Asset' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized - Invalid or missing token' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
      get: {
        tags: ['Assets'],
        summary: 'List or filter assets (optional pagination)',
        description: 'Private (Admin) — Get all assets with optional filters and pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 }, description: 'Page number for pagination' },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 }, description: 'Number of items per page' },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['available', 'assigned', 'acknowledged', 'pending_review', 'under_repair'] }, description: 'Filter by asset status' },
          { in: 'query', name: 'asset_type', schema: { type: 'string' }, description: 'Filter by asset type' },
          { in: 'query', name: 'employee_id', schema: { type: 'string' }, description: 'Filter by assigned employee ID' },
          { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search by asset name or serial number (case-insensitive)' },
        ],
        responses: {
          200: {
            description: 'Assets retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      oneOf: [
                        { type: 'array', items: { $ref: '#/components/schemas/Asset' } },
                        {
                          type: 'object',
                          properties: {
                            assets: { type: 'array', items: { $ref: '#/components/schemas/Asset' } },
                            pagination: { $ref: '#/components/schemas/Pagination' },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
    },
  
    '/assets/types': {
      get: {
        tags: ['Assets'],
        summary: 'List distinct asset types',
        description: 'Private (Admin) — Get unique asset type values for filters and forms',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Asset types retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { type: 'string' }, example: ['laptop', 'monitor', 'keyboard', 'mouse'] },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
    },
  
    '/assets/{id}': {
      get: {
        tags: ['Assets'],
        summary: 'Get asset details with history',
        description: 'Private (Admin) — Retrieve complete asset details including assignments, tickets, and events',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Asset ID' },
        ],
        responses: {
          200: {
            description: 'Asset retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      allOf: [
                        { $ref: '#/components/schemas/Asset' },
                        {
                          type: 'object',
                          properties: {
                            assignments: { type: 'array', items: { $ref: '#/components/schemas/Assignment' } },
                            events: { type: 'array', items: { type: 'object' } },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Asset not found' },
        },
      },
      put: {
        tags: ['Assets'],
        summary: 'Update asset fields',
        description: 'Private (Admin) — Modify asset properties',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Asset ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  assetType: { type: 'string' },
                  serialNumber: { type: 'string' },
                  condition: { type: 'string', enum: ['new', 'good', 'fair', 'damaged'] },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Asset updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Asset' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Asset not found' },
        },
      },
      delete: {
        tags: ['Assets'],
        summary: 'Soft-delete an asset',
        description: 'Private (Admin) — Mark asset as deleted (not permanent deletion)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Asset ID' },
        ],
        responses: {
          200: {
            description: 'Asset deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Asset deleted successfully' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Asset not found' },
        },
      },
    },
  
    // ========== ASSIGNMENT ROUTES ==========
    '/assignments': {
      post: {
        tags: ['Assignments'],
        summary: 'Assign asset to employee',
        description: 'Private (Admin) — Create a new asset assignment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['assetId', 'employeeId'],
                properties: {
                  assetId: { type: 'string', description: 'ID of the asset to assign' },
                  employeeId: { type: 'string', description: 'ID of the employee receiving the asset' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Asset assigned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Assignment' },
                  },
                },
              },
            },
          },
          400: { description: 'Asset not available or validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Asset or employee not found' },
        },
      },
    },
  
    '/assignments/{id}/status': {
      patch: {
        tags: ['Assignments'],
        summary: 'Update assignment status',
        description: 'Private (Admin) — Change the current status of an assignment',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Assignment ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['assigned', 'acknowledged', 'pending_review', 'under_repair'], description: 'New status for the assignment' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Assignment status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Assignment' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Assignment not found' },
        },
      },
    },
  
    '/assignments/{id}/return': {
      patch: {
        tags: ['Assignments'],
        summary: 'Mark assignment as returned',
        description: 'Private (Admin) — Record asset return from employee',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Assignment ID' },
        ],
        responses: {
          200: {
            description: 'Asset returned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Assignment' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Assignment not found' },
        },
      },
    },
  
    '/assignments/{id}/cancel': {
      patch: {
        tags: ['Assignments'],
        summary: 'Cancel unacknowledged assignment',
        description: 'Private (Admin) — Cancel assignment before employee acknowledges receipt',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Assignment ID' },
        ],
        responses: {
          200: {
            description: 'Assignment cancelled successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Assignment cancelled successfully' },
                  },
                },
              },
            },
          },
          400: { description: 'Assignment already acknowledged (cannot cancel)' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Assignment not found' },
        },
      },
    },
  
    '/assignments/{id}/acknowledge': {
      patch: {
        tags: ['Assignments'],
        summary: 'Acknowledge asset receipt',
        description: 'Private (Employee) — Confirm receipt of assigned asset',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Assignment ID' },
        ],
        responses: {
          200: {
            description: 'Asset acknowledged successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Assignment' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required or not owner of assignment' },
          404: { description: 'Assignment not found' },
        },
      },
    },
  
    // ========== SUPPORT TICKET ROUTES ==========
    '/support-tickets': {
      post: {
        tags: ['Support Tickets'],
        summary: 'Report an issue on an active assignment',
        description: 'Private (Employee) — Create a support ticket for an assigned asset',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['assignmentId', 'description'],
                properties: {
                  assignmentId: { type: 'string', description: 'ID of the active assignment' },
                  description: { type: 'string', description: 'Issue description', example: 'Screen has dead pixels in the upper right corner' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Ticket created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/SupportTicket' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error or assignment not active' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required' },
          404: { description: 'Assignment not found' },
        },
      },
      get: {
        tags: ['Support Tickets'],
        summary: 'List support tickets with pagination and filters',
        description: 'Private (Admin) — Get all support tickets with optional status filter',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number' },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, description: 'Items per page' },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['open', 'under_review', 'resolved'] }, description: 'Filter by ticket status' },
        ],
        responses: {
          200: {
            description: 'Tickets retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        tickets: { type: 'array', items: { $ref: '#/components/schemas/SupportTicket' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                        status_counts: {
                          type: 'object',
                          properties: {
                            open: { type: 'integer' },
                            under_review: { type: 'integer' },
                            resolved: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
    },
  
    '/support-tickets/{id}/review': {
      patch: {
        tags: ['Support Tickets'],
        summary: 'Review or resolve a support ticket',
        description: 'Private (Admin) — Update ticket status and add admin notes',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Ticket ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['mark_under_review', 'mark_resolved', 'start_repair', 'complete_repair'], description: 'Action to perform on the ticket' },
                  adminNotes: { type: 'string', description: 'Optional admin notes for the action', example: 'Replaced the screen, device working normally' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Ticket reviewed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/SupportTicket' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid action or validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'Ticket not found' },
        },
      },
    },
  
    // ========== NOTIFICATION ROUTES ==========
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get paginated notifications for the logged-in user',
        description: 'Private (Employee) — Retrieve user\'s notification inbox',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number' },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, description: 'Items per page' },
        ],
        responses: {
          200: {
            description: 'Notifications retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                        unread_count: { type: 'integer', example: 5 },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required' },
        },
      },
    },
  
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        description: 'Private (Employee) — Count of unread notifications (for badge)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Unread count retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        unread_count: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required' },
        },
      },
    },
  
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a single notification as read',
        description: 'Private (Employee) — Mark one notification as read by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Notification ID' },
        ],
        responses: {
          200: {
            description: 'Notification marked as read',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Notification' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required or not owner' },
          404: { description: 'Notification not found' },
        },
      },
    },
  
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        description: 'Private (Employee) — Bulk mark as read for current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All notifications marked as read',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'All notifications marked as read' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required' },
        },
      },
    },
  
    // ========== USER ROUTES ==========
    '/users/me/assets': {
      get: {
        tags: ['Users'],
        summary: 'List active asset assignments for the logged-in employee',
        description: 'Private (Employee) — Get all currently assigned assets with details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Active assets retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        allOf: [
                          { $ref: '#/components/schemas/Assignment' },
                          { type: 'object', properties: { asset: { $ref: '#/components/schemas/Asset' } } },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required' },
        },
      },
    },
  
    '/users/me/assets/{assetId}': {
      get: {
        tags: ['Users'],
        summary: 'Get detail for one assigned asset by asset ID',
        description: 'Private (Employee) — Retrieve full details for a single assigned asset',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'assetId', required: true, schema: { type: 'string' }, description: 'Asset ID' },
        ],
        responses: {
          200: {
            description: 'Asset detail retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      allOf: [
                        { $ref: '#/components/schemas/Asset' },
                        {
                          type: 'object',
                          properties: {
                            assignment: { $ref: '#/components/schemas/Assignment' },
                            events: { type: 'array', items: { type: 'object' } },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required or not assigned to user' },
          404: { description: 'Asset not found or not assigned to user' },
        },
      },
    },
  
    '/users/me/history': {
      get: {
        tags: ['Users'],
        summary: 'Get paginated history of returned assignments',
        description: 'Private (Employee) — View past asset assignments for the logged-in user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number' },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 15 }, description: 'Items per page' },
        ],
        responses: {
          200: {
            description: 'Assignment history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        history: { type: 'array', items: { $ref: '#/components/schemas/Assignment' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Employee role required' },
        },
      },
    },
  
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user account',
        description: 'Private (Admin) — Register a new employee or admin',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Smith' },
                  email: { type: 'string', format: 'email', example: 'jane.smith@example.com' },
                  password: { type: 'string', format: 'password', minLength: 6, example: 'SecurePass123' },
                  role: { type: 'string', enum: ['admin', 'employee'], default: 'employee' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error or email already exists' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'List all users',
        description: 'Private (Admin) — Get all registered users (employees and admins)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
    },
  
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a single user by ID',
        description: 'Private (Admin) — Retrieve user details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' },
        ],
        responses: {
          200: {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'User not found' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update a user by ID',
        description: 'Private (Admin) — Modify user information',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['admin', 'employee'] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user by ID',
        description: 'Private (Admin) — Remove a user account',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' },
        ],
        responses: {
          200: {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User deleted successfully' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
          404: { description: 'User not found' },
        },
      },
    },
  
    // ========== ADMIN ROUTES ==========
    '/admin/summary': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard summary',
        description: 'Private (Admin) — Dashboard overview with asset counts, open tickets, recent events, and employee stats',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard summary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        total_assets: { type: 'integer', example: 150 },
                        assets_by_status: {
                          type: 'object',
                          properties: {
                            available: { type: 'integer' },
                            assigned: { type: 'integer' },
                            acknowledged: { type: 'integer' },
                            pending_review: { type: 'integer' },
                            under_repair: { type: 'integer' },
                          },
                        },
                        open_tickets_count: { type: 'integer', example: 8 },
                        employees_with_assets: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              employeeId: { type: 'string' },
                              employeeName: { type: 'string' },
                              employeeEmail: { type: 'string' },
                              assetCount: { type: 'integer' },
                            },
                          },
                        },
                        recent_events: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              event_type: { type: 'string' },
                              asset_name: { type: 'string' },
                              triggered_by_name: { type: 'string' },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
    },
  
    '/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Get paginated audit log events',
        description: 'Private (Admin) — Complete system activity history with pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number' },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, description: 'Items per page' },
        ],
        responses: {
          200: {
            description: 'Audit logs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        events: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              event_type: { type: 'string', enum: ['registered', 'deleted', 'assigned', 'assignment_cancelled', 'acknowledged', 'ticket_opened', 'repair_started', 'repair_completed', 'returned'] },
                              asset_id: { type: 'string' },
                              asset_name: { type: 'string' },
                              triggered_by: { type: 'string' },
                              triggered_by_name: { type: 'string' },
                              target_employee_name: { type: 'string', nullable: true },
                              notes: { type: 'string', nullable: true },
                              created_at: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin role required' },
        },
      },
    },
  },
};
