const Consultation = require('../models/Consultation');
const User = require('../models/User');

// Get all consultations for a user
exports.getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user.id })
      .populate('nutritionist', 'name email')
      .sort({ date: 1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific consultation
exports.getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('nutritionist', 'name email');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new consultation
exports.createConsultation = async (req, res) => {
  try {
    // Check if nutritionist exists
    const nutritionist = await User.findOne({
      _id: req.body.nutritionist,
      role: 'nutritionist'
    });

    if (!nutritionist) {
      return res.status(404).json({ message: 'Nutritionist not found' });
    }

    // Check if time slot is available
    const existingConsultation = await Consultation.findOne({
      nutritionist: req.body.nutritionist,
      date: req.body.date,
      'timeSlot.start': req.body.timeSlot.start,
      'timeSlot.end': req.body.timeSlot.end,
      status: 'scheduled'
    });

    if (existingConsultation) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    const consultation = new Consultation({
      ...req.body,
      user: req.user.id
    });

    const savedConsultation = await consultation.save();
    res.status(201).json(savedConsultation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update consultation
exports.updateConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    ).populate('nutritionist', 'name email');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.json({ message: 'Consultation cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available time slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, nutritionistId } = req.query;
    
    // Get all scheduled consultations for the date
    const scheduledConsultations = await Consultation.find({
      nutritionist: nutritionistId,
      date: date,
      status: 'scheduled'
    });

    // Generate all possible time slots
    const allSlots = generateTimeSlots();
    
    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      return !scheduledConsultations.some(consultation => {
        return consultation.timeSlot.start === slot.start &&
               consultation.timeSlot.end === slot.end;
      });
    });

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate time slots
function generateTimeSlots() {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  const slotDuration = 60; // 1 hour

  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push({ start, end });
  }

  return slots;
} 