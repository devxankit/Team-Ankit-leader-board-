import mongoose from 'mongoose'
import { LABEL_MAX_LENGTH, MAX_POINTS, RULE_CATEGORIES } from '../config/constants.js'
import { isValidPoints } from '../utils/points.js'

/**
 * A reusable reason for giving or taking points. Events copy the label and
 * points at the moment they are created, so editing or archiving a rule never
 * rewrites history.
 */
const ruleSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: LABEL_MAX_LENGTH },

    /** Positive = reward, negative = penalty. */
    points: {
      type: Number,
      required: true,
      validate: {
        validator: isValidPoints,
        message: `Points must be a non-zero whole number between -${MAX_POINTS} and ${MAX_POINTS}`,
      },
    },

    category: { type: String, enum: RULE_CATEGORIES, default: 'Other' },
    icon: { type: String, trim: true, maxlength: 16, default: '' },

    /** Soft delete: archived rules disappear from the picker but keep their history. */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('Rule', ruleSchema)
