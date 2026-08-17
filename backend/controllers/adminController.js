const Registration = require("../models/Registration");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const User = require("../models/User");
const Gallery = require("../models/Gallery");
const Announcement = require("../models/Announcement");

// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  const [registrations, quizzes, results, users, galleryDoc, announcementCount] = await Promise.all([
    Registration.countDocuments(),
    Quiz.countDocuments(),
    Result.countDocuments(),
    User.countDocuments({ role: "participant" }),
    Gallery.findOne().select("photos"),
    Announcement.countDocuments(),
  ]);

  const topScorers = await Result.find().sort({ score: -1, createdAt: 1 }).limit(5);

  res.json({
    success: true,
    data: {
      registrations,
      quizzes,
      quizAttempts: results,
      registeredUsers: users,
      galleryPhotos: galleryDoc ? galleryDoc.photos.length : 0,
      announcements: announcementCount,
      topScorers,
    },
  });
};

module.exports = { getDashboardStats };
