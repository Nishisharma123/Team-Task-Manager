const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  dueDate: Date
}, { timestamps: true });

// Ensure owner is always an admin member
projectSchema.pre('save', function(next) {
  if (this.isNew) {
    const ownerExists = this.members.some(m => m.user.toString() === this.owner.toString());
    if (!ownerExists) {
      this.members.push({ user: this.owner, role: 'Admin' });
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
