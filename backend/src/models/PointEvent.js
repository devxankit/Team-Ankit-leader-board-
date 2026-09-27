import mongoose from 'mongoose'
import { LABEL_MAX_LENGTH, MAX_POINTS, NOTE_MAX_LENGTH } from '../config/constants.js'
import { isValidPoints } from '../utils/points.js'

const { ObjectId } = mongoose.Schema.Types

/**
 * The points ledger. A member's score is the sum of their non-voided events —
 * there is no stored counter. Events are only ever inserted or voided, never
 * edited, so the history is a faithful audit trail.
 */
const pointEventSchema = new mongoose.Schema(
  {
    member: { type: ObjectId, ref: 'User', required: true },

    /** The rule used, or null for a custom one-off entry. */
    rule: { type: ObjectId, ref: 'Rule', default: null },

    /** Snapshots taken at the time of the event. */
    ruleLabel: { type: String, required: true, trim: true, maxlength: LABEL_MAX_LENGTH },
    points: {
      type: Number,
      required: true,
      validate: {
        validator: isValidPoints,
        message: `Points must be a non-zero whole number between -${MAX_POINTS} and ${MAX_POINTS}`,
      },
    },

    note: { type: String, trim: true, maxlength: NOTE_MAX_LENGTH, default: '' },
    givenBy: { type: ObjectId, ref: 'User', required: true },

    /** Shared by every event created by one "Apply" in the admin panel. */
    batchId: { type: ObjectId, required: true },

    isVoided: { type: Boolean, default: false },
    voidedBy: { type: ObjectId, ref: 'User', default: null },
    voidedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

pointEventSchema.index({ member: 1, createdAt: -1 })
pointEventSchema.index({ createdAt: -1 })

export default mongoose.model('PointEvent', pointEventSchema)
