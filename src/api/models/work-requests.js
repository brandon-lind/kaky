import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  workItemId: {
    type: String,
    required: [true, 'All play no work might be good for Jack, but not for this work request.']
  },

  workerId: {
    type: String,
    required: [true, 'You seem to have forgotten who you want to do the work.']
  },

  requesterId: {
    type: String,
    required: [true, 'Um...who are you? You need an ID in order to request work.']
  },

  price: {
    type: Number,
    min: [0, 'The price must be greater than 0.']
  },

  instructions: {
    type: String,
    maxlength: [500, 'Whoa, that is too much for them to process. Try less words.']
  },

  status: {
    type: String,
    enum: {
      values: ['open', 'closed', 'cancelled', 'rejected', 'working', 'waiting for payment', 'paid'],
      message: 'That status does not make any sense.'
    },
    required: [true, 'A valid status is required.']
  }

}, {
  timestamps: true
});

const WorkRequest = mongoose.model('WorkRequest', schema);

export { WorkRequest };
