const { z } = require('zod');

const registerSchema = z.object({
  name_or_org: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['donor', 'ngo', 'volunteer'], { errorMap: () => ({ message: 'Role must be donor, ngo, or volunteer' }) }),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const donationSchema = z.object({
  food_type: z.string().min(2, 'Food type is required'),
  quantity: z.number().int().positive('Quantity must be a positive number'),
  expiry_time: z.string().datetime({ message: 'Invalid expiry time format' }),
  pickup_lat: z.number().min(-90).max(90),
  pickup_lng: z.number().min(-180).max(180),
  photo_url: z.string().url().optional(),
});

const claimSchema = z.object({
  requested_quantity: z.number().int().positive(),
  needs_volunteer: z.boolean().optional().default(false),
});

const taskStatusSchema = z.object({
  status: z.enum(['en_route_donor', 'picked_up', 'en_route_ngo', 'delivered']),
  delivery_photo_proof: z.string().url().optional(),
});

/**
 * Middleware factory: validates req.body against a zod schema.
 * On failure returns 400 with a list of field errors.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  req.body = result.data; // Use the cleaned/coerced data
  next();
};

module.exports = { validate, registerSchema, loginSchema, donationSchema, claimSchema, taskStatusSchema };
