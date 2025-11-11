import mongoose from 'mongoose';

const landingPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hero: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    cta: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Publicada', 'Rascunho'],
    default: 'Rascunho'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

landingPageSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

const LandingPage = mongoose.models.LandingPage || mongoose.model('LandingPage', landingPageSchema);
export default LandingPage;

