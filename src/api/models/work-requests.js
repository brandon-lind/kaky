import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  workItemId: {
    type: Number,
    required: [true, 'All play no work might be good for Jack, but not for this work request.'],
    min: [1, 'Hmm, I think you are trying to spoof something since that is not a valid work item Id.'],
    max: [6, 'Hmm, I think you are trying to spoof something since that is way bigger than a valid work item Id.']
  },

  workerId: {
    type: String,
    required: [true, 'You seem to have forgotten to add the poor soul who you want to do the work.']
  },

  requesterId: {
    type: String,
    required: [true, 'Um...who are you? You need an ID in order to request work.']
  },

  price: {
    type: Number,
    min: [0, 'The price must be greater than $0. No freebies!'],
    max: [100, 'Whoa, that is way too much. Try something less than $100']
  },

  instructions: {
    type: String,
    maxlength: [200, 'Whoa, that is too much for them to process with their short attention span. Try less words.']
  },

  status: {
    type: String,
    enum: {
      values: ['open', 'closed', 'cancelled', 'rejected', 'working', 'waiting_for_payment', 'paid'],
      message: 'That status does not make any sense.'
    },
    required: [true, 'A status is required unless you plan to do the work yourself.']
  }

}, {
  timestamps: true
});

const WorkRequest = mongoose.model('WorkRequest', schema);

export { WorkRequest };
