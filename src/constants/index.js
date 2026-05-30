export const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_TYPE = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  API_ERROR: 'API_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
};

export const ERROR_MESSAGE = {
  DB_CONNECTION_ERROR: 'Database connection failed',
  UNEXPECTED_ERROR: 'An unexpected error occurred during startup',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXIST: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_NOT_FOUND: 'Authentication token not found',
  ACCESS_TOKEN_EXPIRED: 'Access token is invalid or expired',
  USER_NOT_AUTHENTICATED: 'User is not authenticated',
  USER_ROLES_NOT_FOUND: 'User roles not found',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  ASSET_NOT_FOUND: 'Asset not found',
  ASSET_SERIAL_EXISTS: 'An asset with this serial number already exists',
  ASSET_HAS_ACTIVE_ASSIGNMENTS: 'Cannot delete asset with active assignments',
  ASSIGNMENT_NOT_FOUND: 'Assignment not found',
  ASSIGNMENT_NOT_ACTIVE: 'Assignment is not active',
  ASSIGNMENT_NOT_OWNED: 'This assignment does not belong to you',
  ASSET_RETURN_NOT_ALLOWED:
    'Asset can only be returned after the employee has acknowledged it',
  ASSIGNMENT_CANCEL_NOT_ALLOWED:
    'Only unacknowledged assignments can be cancelled',
  ASSET_NOT_AVAILABLE: 'Asset is not available for assignment',
  TICKET_NOT_FOUND: 'Support ticket not found',
  TICKET_INVALID_ACTION: 'Invalid ticket review action',
  INVALID_RESET_TOKEN: 'Password reset link is invalid or has expired',
  EMAIL_SEND_FAILED: 'Unable to send password reset email. Please try again later',
  ACCOUNT_EMAIL_NOT_FOUND: 'No account is registered with this email address',
  EMAIL_ALREADY_VERIFIED: 'This email address is already verified',
  EMAIL_NOT_VERIFIED: 'Your email is not verified. Please verify your email before signing in',
  INVALID_VERIFICATION_TOKEN: 'Email verification link is invalid or has expired',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  INVALID_SORT_FIELD: 'Invalid sort field',
  INVALID_SORT_ORDER: 'Invalid sort order. Use asc or desc',
};

export const TokenPurpose = {
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
};

export const EMAIL_SUBJECT = {
  PASSWORD_RESET: 'Reset your password',
  EMAIL_VERIFICATION: 'Verify your email address',
  ASSET_ASSIGNMENT: 'New Asset Assigned',
  ASSET_ACKNOWLEDGEMENT: 'Asset Acknowledged',
  SUPPORT_TICKET_REPORTED: 'Asset Issue Reported',
  ASSET_UNDER_REPAIR: 'Asset Under Repair',
  ASSET_TICKET_RESOLVED: 'Asset Issue Resolved',
  ASSET_RETURNED: 'Asset Returned',
  ASSIGNMENT_CANCELLED: 'Asset Assignment Cancelled',
};

export const SUCCESS_MESSAGE = {
  DB_CONNECTION_SUCCESS: 'Database connected successfully!',
  USERS_FETCHED: 'Users fetched successfully',
  USER_FETCHED: 'User fetched successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  SIGNUP_SUCCESS: 'Account created. Verification email sent to your inbox',
  LOGIN_SUCCESS: 'Logged in successfully',
  FORGOT_PASSWORD_EMAIL_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully. You can now sign in with your new password',
  VERIFICATION_EMAIL_SENT: 'Verification email sent. Please check your inbox',
  EMAIL_VERIFIED_SUCCESS: 'Email verified successfully. You can now sign in',
  ASSETS_FETCHED: 'Assets fetched successfully',
  ASSET_FETCHED: 'Asset fetched successfully',
  ASSET_CREATED: 'Asset created successfully',
  ASSET_UPDATED: 'Asset updated successfully',
  ASSET_DELETED: 'Asset deleted successfully',
  ASSET_STATUS_UPDATED: 'Asset status updated successfully',
  ASSIGNMENT_STATUS_UPDATED: 'Assignment status updated successfully',
  ASSIGNMENT_CREATED: 'Asset assigned successfully',
  ASSIGNMENT_ACKNOWLEDGED: 'Asset acknowledged successfully',
  ASSIGNMENT_RETURNED: 'Asset returned successfully',
  ASSIGNMENT_CANCELLED: 'Assignment cancelled successfully',
  MY_ASSETS_FETCHED: 'Active assignments fetched successfully',
  MY_ASSET_DETAIL_FETCHED: 'Asset detail fetched successfully',
  MY_HISTORY_FETCHED: 'Assignment history fetched successfully',
  TICKET_CREATED: 'Support ticket created successfully',
  TICKETS_FETCHED: 'Support tickets fetched successfully',
  TICKET_REVIEWED: 'Support ticket reviewed successfully',
  ADMIN_SUMMARY_FETCHED: 'Admin summary fetched successfully',
  AUDIT_LOGS_FETCHED: 'Audit logs fetched successfully',
  ASSET_TYPES_FETCHED: 'Asset types fetched successfully',
  NOTIFICATIONS_FETCHED: 'Notifications fetched successfully',
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
  ALL_NOTIFICATIONS_MARKED_READ: 'All notifications marked as read',
};

export const UserRole = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

export const AssetType = {
  LAPTOP: 'laptop',
  MONITOR: 'monitor',
  ACCESSORY: 'accessory',
  OTHER: 'other',
};

export const DEFAULT_ASSET_TYPES = Object.values(AssetType);

export const AssetCondition = {
  NEW: 'new',
  GOOD: 'good',
  FAIR: 'fair',
  DAMAGED: 'damaged',
};

export const AssetStatus = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  ACKNOWLEDGED: 'acknowledged',
  PENDING_REVIEW: 'pending_review',
  UNDER_REPAIR: 'under_repair',
};

export const EventType = {
  REGISTERED: 'registered',
  ASSIGNED: 'assigned',
  ACKNOWLEDGED: 'acknowledged',
  RETURNED: 'returned',
  TICKET_OPENED: 'ticket_opened',
  REPAIR_STARTED: 'repair_started',
  REPAIR_COMPLETED: 'repair_completed',
  DELETED: 'deleted',
  ASSIGNMENT_CANCELLED: 'assignment_cancelled',
};

export const TicketStatus = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
};

export const NotificationType = {
  ASSET_ASSIGNED: 'asset_assigned',
  ASSET_ACKNOWLEDGED: 'asset_acknowledged',
  TICKET_CREATED: 'ticket_created',
  ASSET_UNDER_REPAIR: 'asset_under_repair',
  TICKET_RESOLVED: 'ticket_resolved',
  ASSET_RETURNED: 'asset_returned',
  ASSIGNMENT_CANCELLED: 'assignment_cancelled',
};
