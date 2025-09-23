const { sequelize } = require('./src/config/database');
const Review = require('./src/models/Review');
const Tutorial = require('./src/models/Tutorial');
const User = require('./src/models/User');

async function debugReviews() {
  try {
    await sequelize.authenticate();
    console.log('🔍 Database connected');

    // Load associations
    require('./src/models/associations');

    // Step 1: Check if reviews exist in database
    console.log('\n=== 1️⃣ CHECKING DATABASE ===');
    const allReviews = await Review.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Tutorial, as: 'tutorial', attributes: ['id', 'title'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📊 Total reviews in database: ${allReviews.length}`);
    allReviews.forEach((review, index) => {
      console.log(`${index + 1}. Review ID: ${review.id}`);
      console.log(`   User: ${review.user?.name} (${review.user?.email})`);
      console.log(`   Tutorial: ${review.tutorial?.title}`);
      console.log(`   Rating: ${review.rating} stars`);
      console.log(`   Comment: ${review.comment}`);
      console.log(`   Created: ${review.created_at}`);
      console.log('   ---');
    });

    // Step 2: Check reviews for a specific tutorial
    console.log('\n=== 2️⃣ CHECKING REVIEWS FOR SPECIFIC TUTORIAL ===');
    const tutorials = await Tutorial.findAll({ limit: 1 });
    if (tutorials.length > 0) {
      const tutorialId = tutorials[0].id;
      console.log(`🔍 Checking reviews for tutorial: ${tutorials[0].title} (${tutorialId})`);
      
      const tutorialReviews = await Review.findAll({
        where: { tutorial_id: tutorialId },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });
      
      console.log(`📊 Reviews for this tutorial: ${tutorialReviews.length}`);
      tutorialReviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.user?.name}: ${review.rating} stars - "${review.comment}"`);
      });
    }

    // Step 3: Test the exact query that the API uses
    console.log('\n=== 3️⃣ TESTING API QUERY ===');
    if (tutorials.length > 0) {
      const tutorialId = tutorials[0].id;
      console.log(`🔍 Testing getTutorialReviews query for tutorial: ${tutorialId}`);
      
      const apiQuery = await Review.findAll({
        where: { tutorial_id: tutorialId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profile_picture']
        }],
        order: [['created_at', 'DESC']]
      });
      
      console.log(`📊 API query result: ${apiQuery.length} reviews`);
      console.log('📊 Raw data structure:');
      console.log(JSON.stringify(apiQuery, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

debugReviews();
