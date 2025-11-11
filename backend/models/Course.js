import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  id: String,
  title: String,
  duration: String,
  videoUrl: String,
  completed: {
    type: Boolean,
    default: false
  },
  locked: {
    type: Boolean,
    default: false
  }
});

const moduleSchema = new mongoose.Schema({
  id: String,
  title: String,
  duration: String,
  lessons: [lessonSchema],
  completed: {
    type: Boolean,
    default: false
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  instructor: {
    type: String,
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorAvatar: {
    type: String,
    default: 'https://i.pravatar.cc/150?img=1'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Iniciante', 'Intermediário', 'Avançado'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  modules: [moduleSchema],
  features: [String],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;

