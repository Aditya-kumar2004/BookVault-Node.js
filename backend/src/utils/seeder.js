const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables if running as standalone CLI script
if (require.main === module) {
  dotenv.config({ path: require('path').join(__dirname, '../../.env') });
}

const User = require('../models/User');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const seedDatabase = async (silent = false) => {
  const log = (msg) => {
    if (!silent) console.log(msg);
  };

  try {
    log('🌱 Beginning database seeding process...');

    // 1. Seed Default Users
    log('👥 Seeding users...');
    await User.deleteMany();
    
    const adminPassword = await bcrypt.hash('password123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@bookvault.com',
      password: adminPassword,
      role: 'admin',
      phone: '9876543210',
      bio: 'System Administrator for BookVault application.',
      status: 'Active',
    });

    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@bookvault.com',
      password: userPassword,
      role: 'user',
      phone: '9876543211',
      bio: 'Avid reader and literary enthusiast.',
      status: 'Active',
    });

    log(`👥 Created Users: ${adminUser.email} (admin), ${regularUser.email} (user)`);

    // 2. Seed Default Authors (from AuthorController.php)
    log('✍️ Seeding authors...');
    await Author.deleteMany();

    const defaultAuthors = [
      { name: 'Erin Morgenstern', img: 'https://i.pravatar.cc/200?img=47', rating: 4.7 },
      { name: 'Paulo Coelho', img: 'https://i.pravatar.cc/200?img=12', rating: 4.8 },
      { name: 'John Green', img: 'https://i.pravatar.cc/200?img=15', rating: 4.6 },
      { name: 'Alex Michaelides', img: 'https://i.pravatar.cc/200?img=33', rating: 4.5 },
      { name: 'E. Lockhart', img: 'https://i.pravatar.cc/200?img=49', rating: 4.4 },
      { name: 'Timothy Snyder', img: 'https://i.pravatar.cc/200?img=5', rating: 4.7 },
    ];

    await Author.create(defaultAuthors);
    log(`✍️ Created ${defaultAuthors.length} authors.`);

    // 3. Seed Default Books (from BookSeeder.php)
    log('📚 Seeding books...');
    await Book.deleteMany();

    const defaultBooks = [
      // === ORIGINAL 8 BOOKS ===
      {
        _id: 1,
        title: 'The Starless Sea',
        author: 'Erin Morgenstern',
        isbn: '9780525559474',
        price: 18.99,
        original_price: 26.0,
        rating: 4.6,
        genre: 'Fantasy',
        stock: 42,
        pages: 512,
        publisher: 'Doubleday',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/midnight_library.png',
        description: 'A love letter to bibliophiles, centered on a secret underground library filled with magic, mysteries, and stories.'
      },
      {
        _id: 2,
        title: 'We Were Liars',
        author: 'E. Lockhart',
        isbn: '9780385737951',
        price: 12.50,
        original_price: 17.99,
        rating: 4.3,
        genre: 'Thriller',
        stock: 18,
        pages: 240,
        publisher: 'Delacorte',
        is_featured: false,
        is_deal: true,
        cover_image: '/covers/maze_runner.png',
        description: 'A sophisticated, suspenseful novel about a wealthy, seemingly perfect family whose dark secrets unravel on a private island.'
      },
      {
        _id: 3,
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        isbn: '9781250301697',
        price: 14.95,
        original_price: 21.0,
        rating: 4.5,
        genre: 'Thriller',
        stock: 64,
        pages: 336,
        publisher: 'Celadon Books',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/silent_patient.png',
        description: 'A shocking psychological thriller about a woman’s act of violence against her husband, and the therapist obsessed with uncovering her motive.'
      },
      {
        _id: 4,
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        isbn: '9780374533557',
        price: 14.99,
        original_price: 19.99,
        rating: 4.6,
        genre: 'Nonfiction',
        stock: 120,
        pages: 499,
        publisher: 'Farrar Straus',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/thinking_fast.png',
        description: 'A renowned psychologist explains the two systems that drive the way we think—one fast and intuitive, one slow and logical.'
      },
      {
        _id: 5,
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '9780062315007',
        price: 10.99,
        original_price: 16.99,
        rating: 4.7,
        genre: 'Fiction',
        stock: 230,
        pages: 208,
        publisher: 'HarperOne',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/the_alchemist.png',
        description: 'A beautiful fable about a young Andalusian shepherd boy who journeys to Egypt in search of a worldly treasure, discovering self-wisdom along the way.'
      },
      {
        _id: 6,
        title: 'The Fault in Our Stars',
        author: 'John Green',
        isbn: '9780525478812',
        price: 11.50,
        original_price: 15.99,
        rating: 4.6,
        genre: 'Romance',
        stock: 56,
        pages: 313,
        publisher: 'Dutton Books',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/fault_stars.png',
        description: 'The award-winning story of Hazel Grace Lancaster and Augustus Waters, two teenagers whose lives are touched by cancer, love, and tragedy.'
      },
      {
        _id: 7,
        title: 'The Midnight Library',
        author: 'Matt Haig',
        isbn: '9780525559473',
        price: 15.99,
        original_price: 22.99,
        rating: 4.4,
        genre: 'Fiction',
        stock: 88,
        pages: 304,
        publisher: 'Canongate',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/midnight_library.png',
        description: 'Somewhere out beyond the edge of the universe there is a library that contains an infinite number of books, each one the story of another reality.'
      },
      {
        _id: 8,
        title: 'Echoes of Eternity',
        author: 'Aveline Thorne',
        isbn: '9781982137285',
        price: 19.99,
        original_price: 29.99,
        rating: 4.9,
        genre: 'Fantasy',
        stock: 50,
        pages: 432,
        publisher: 'Orbit Books',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/echoes_eternity.png',
        description: 'An epic high-fantasy adventure where time shifts and forgotten ancient magic resurfaces to threaten a fractured kingdom.'
      },
      // === CURATED 25 BOOKS ===
      {
        _id: 9,
        title: 'The Art of War',
        author: 'Sun Tzu',
        isbn: '9780195014761',
        price: 9.99,
        original_price: 15.00,
        rating: 4.8,
        genre: 'Military Strategy',
        stock: 50,
        pages: 273,
        publisher: 'Oxford University Press',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/art_of_war.png',
        description: 'An ancient Chinese military treatise dating from the Late Spring and Autumn Period, containing 13 chapters dedicated to distinct strategy aspects.'
      },
      {
        _id: 10,
        title: 'Can\'t Hurt Me',
        author: 'David Goggins',
        isbn: '9781544512280',
        price: 17.99,
        original_price: 24.99,
        rating: 4.9,
        genre: 'Mental Toughness & Discipline',
        stock: 140,
        pages: 364,
        publisher: 'Lioncrest Publishing',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/cant_hurt_me.png',
        description: 'David Goggins shares his astonishing life story, demonstrating that most of us tap into only 40% of our capabilities.'
      },
      {
        _id: 11,
        title: 'Extreme Ownership',
        author: 'Jocko Willink & Leif Babin',
        isbn: '9781250067050',
        price: 19.99,
        original_price: 26.99,
        rating: 4.9,
        genre: 'Military Leadership',
        stock: 65,
        pages: 320,
        publisher: 'St. Martin\'s Press',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/extreme_ownership.png',
        description: 'Sent to the most violent battlefield in Iraq, two Navy SEAL task unit leaders learn firsthand that leadership at every level is the most vital factor.'
      },
      {
        _id: 12,
        title: 'Make Your Bed',
        author: 'William H. McRaven',
        isbn: '9781455570249',
        price: 8.99,
        original_price: 14.00,
        rating: 4.7,
        genre: 'Military Leadership',
        stock: 80,
        pages: 130,
        publisher: 'Grand Central Publishing',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/make_your_bed.png',
        description: 'Ten simple, powerful life lessons based on Admiral McRaven\'s Navy SEAL training, designed to help you change yourself and the world.'
      },
      {
        _id: 13,
        title: 'Call Sign Chaos',
        author: 'Jim Mattis',
        isbn: '9780812996838',
        price: 18.00,
        original_price: 28.00,
        rating: 4.7,
        genre: 'Military Strategy',
        stock: 45,
        pages: 320,
        publisher: 'Random House',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/call_sign_chaos.png',
        description: 'A clear-eyed account of Jim Mattis\'s leadership career, sharing lessons learned from three decades as a Marine officer and Secretary of Defense.'
      },
      {
        _id: 14,
        title: 'On War',
        author: 'Carl von Clausewitz',
        isbn: '9780691018546',
        price: 16.50,
        original_price: 24.99,
        rating: 4.5,
        genre: 'Military Strategy',
        stock: 30,
        pages: 752,
        publisher: 'Princeton University Press',
        is_featured: false,
        is_deal: true,
        cover_image: '/covers/on_war.png',
        description: 'A book on war and military strategy by Prussian general Carl von Clausewitz, written mostly after the Napoleonic wars.'
      },
      {
        _id: 15,
        title: 'Lone Survivor',
        author: 'Marcus Luttrell',
        isbn: '9780316044691',
        price: 11.99,
        original_price: 16.99,
        rating: 4.8,
        genre: 'Military Leadership',
        stock: 50,
        pages: 390,
        publisher: 'Little Brown and Co',
        is_featured: false,
        is_deal: true,
        cover_image: '/covers/lone_survivor.png',
        description: 'The inspirational, firsthand account of Operation Redwing, Navy SEAL teamwork, and the lone survivor\'s escape in the mountains of Afghanistan.'
      },
      {
        _id: 16,
        title: 'No Easy Day',
        author: 'Mark Owen',
        isbn: '9780525953722',
        price: 12.99,
        original_price: 19.99,
        rating: 4.6,
        genre: 'Military Strategy',
        stock: 35,
        pages: 336,
        publisher: 'Dutton Penguin',
        is_featured: false,
        is_deal: true,
        cover_image: '/covers/no_easy_day.png',
        description: 'The firsthand account of the mission that killed Osama bin Laden, written by a former member of the US Navy SEALs.'
      },
      {
        _id: 17,
        title: 'Discipline Equals Freedom',
        author: 'Jocko Willink',
        isbn: '9781250156945',
        price: 13.99,
        original_price: 21.00,
        rating: 4.7,
        genre: 'Mental Toughness & Discipline',
        stock: 85,
        pages: 208,
        publisher: 'St. Martin\'s Press',
        is_featured: false,
        is_deal: false,
        cover_image: 'https://covers.openlibrary.org/b/isbn/9781250156945-L.jpg',
        description: 'A field manual outlining the physical and mental disciplines required to build complete self-mastery and achieve freedom.'
      },
      {
        _id: 18,
        title: 'The Warrior Ethos',
        author: 'Steven Pressfield',
        isbn: '9781936891009',
        price: 9.95,
        original_price: 14.95,
        rating: 4.7,
        genre: 'Mental Toughness & Discipline',
        stock: 60,
        pages: 112,
        publisher: 'Black Irish Books',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/warrior_ethos.png',
        description: 'An analysis of the warrior codes of the ancient Spartans, Romans, and Macedonians, showing how their mental toughness applies to modern battles.'
      },
      {
        _id: 19,
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        price: 16.00,
        original_price: 24.00,
        rating: 4.8,
        genre: 'Success & Personal Growth',
        stock: 350,
        pages: 320,
        publisher: 'Avery',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/atomic_habits.png',
        description: 'Distills the most proven biological and psychological strategies to build good habits, break bad ones, and master tiny daily improvements.'
      },
      {
        _id: 20,
        title: 'The 5 AM Club',
        author: 'Robin Sharma',
        isbn: '9781443456623',
        price: 13.50,
        original_price: 19.99,
        rating: 4.4,
        genre: 'Success & Personal Growth',
        stock: 110,
        pages: 336,
        publisher: 'HarperCollins',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/five_am_club.png',
        description: 'Robin Sharma introduces the revolutionary 5 AM morning routine that has helped his clients maximize productivity and activate health.'
      },
      {
        _id: 21,
        title: 'The Mountain Is You',
        author: 'Brianna Wiest',
        isbn: '9781938258756',
        price: 15.99,
        original_price: 22.99,
        rating: 4.6,
        genre: 'Success & Personal Growth',
        stock: 95,
        pages: 248,
        publisher: 'Thought Catalog',
        is_featured: true,
        is_deal: false,
        cover_image: 'https://covers.openlibrary.org/b/isbn/9781938258756-L.jpg',
        description: 'A transformative guide showing why we self-sabotage, when we do it, and how to harness our internal power to overcome lifelong mountains.'
      },
      {
        _id: 22,
        title: 'Unbeatable Mind',
        author: 'Mark Divine',
        isbn: '9781500462000',
        price: 12.50,
        original_price: 18.00,
        rating: 4.5,
        genre: 'Mental Toughness & Discipline',
        stock: 40,
        pages: 250,
        publisher: 'CreateSpace',
        is_featured: false,
        is_deal: false,
        cover_image: 'https://covers.openlibrary.org/b/isbn/9781500462000-L.jpg',
        description: 'Written by a retired Navy SEAL Commander, this book outlines step-by-step training to build mental toughness, emotional resilience, and physical capability.'
      },
      {
        _id: 23,
        title: 'Gates of Fire',
        author: 'Steven Pressfield',
        isbn: '9780553580532',
        price: 11.50,
        original_price: 16.99,
        rating: 4.8,
        genre: 'Mental Toughness & Discipline',
        stock: 55,
        pages: 400,
        publisher: 'Bantam Books',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/gates_of_fire.png',
        description: 'An epic, historic novel depicting the legendary Battle of Thermopylae, highlighting the Spartan discipline and warrior brotherhood.'
      },
      {
        _id: 24,
        title: 'Leaders Eat Last',
        author: 'Simon Sinek',
        isbn: '9781591845324',
        price: 15.50,
        original_price: 22.00,
        rating: 4.6,
        genre: 'Military Leadership',
        stock: 75,
        pages: 368,
        publisher: 'Portfolio Penguin',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/leaders_eat_last.png',
        description: 'Simon Sinek examines why only some teams trust each other completely and build circles of safety, drawing inspiration from Marine Corps strategies.'
      },
      {
        _id: 25,
        title: 'Start With Why',
        author: 'Simon Sinek',
        isbn: '9781591846352',
        price: 14.00,
        original_price: 20.00,
        rating: 4.6,
        genre: 'Military Leadership',
        stock: 90,
        pages: 256,
        publisher: 'Portfolio',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/start_with_why.png',
        description: 'A powerful look at how the world\'s most influential leaders inspire action and build loyal teams by starting with a core purpose.'
      },
      {
        _id: 26,
        title: 'Ego Is The Enemy',
        author: 'Ryan Holiday',
        isbn: '9781591847816',
        price: 14.50,
        original_price: 21.00,
        rating: 4.7,
        genre: 'Success & Personal Growth',
        stock: 80,
        pages: 226,
        publisher: 'Portfolio',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/ego_is_enemy.png',
        description: 'Ryan Holiday explores the historic and philosophical battles against our greatest internal enemy—ego—and how to cultivate humility.'
      },
      {
        _id: 27,
        title: 'The Obstacle Is The Way',
        author: 'Ryan Holiday',
        isbn: '9781591846353',
        price: 14.00,
        original_price: 20.00,
        rating: 4.7,
        genre: 'Success & Personal Growth',
        stock: 85,
        pages: 201,
        publisher: 'Portfolio',
        is_featured: false,
        is_deal: false,
        cover_image: 'https://covers.openlibrary.org/b/isbn/9781591846353-L.jpg',
        description: 'Distills Stoic principles into a practical blueprint to turn trials into triumphs, showing that what blocks our path can become our path.'
      },
      {
        _id: 28,
        title: 'The 48 Laws of Power',
        author: 'Robert Greene',
        isbn: '9780140280197',
        price: 14.99,
        original_price: 22.00,
        rating: 4.6,
        genre: 'Military Strategy',
        stock: 120,
        pages: 452,
        publisher: 'Viking Press',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/laws_of_power.png',
        description: 'A non-fiction book distilling 3,000 years of the history of power into forty-eight essential laws by drawing from military strategists and historical figures.'
      },
      {
        _id: 29,
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        isbn: '9781612680194',
        price: 10.99,
        original_price: 16.99,
        rating: 4.6,
        genre: 'Wealth & Financial Success',
        stock: 280,
        pages: 207,
        publisher: 'Plata Publishing',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/rich_dad_poor_dad.png',
        description: 'Explores Robert Kiyosaki\'s childhood experience growing up with two fathers, showing the critical financial habits that differentiate the rich from the poor.'
      },
      {
        _id: 30,
        title: 'Think and Grow Rich',
        author: 'Napoleon Hill',
        isbn: '9781593302008',
        price: 8.50,
        original_price: 12.99,
        rating: 4.7,
        genre: 'Wealth & Financial Success',
        stock: 150,
        pages: 238,
        publisher: 'Ralston Society',
        is_featured: false,
        is_deal: false,
        cover_image: 'https://covers.openlibrary.org/b/isbn/9781593302008-L.jpg',
        description: 'The legendary wealth-creation handbook distilling the habits and mindsets of the world\'s most successful billionaires into 13 steps.'
      },
      {
        _id: 31,
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        isbn: '9780857197689',
        price: 15.99,
        original_price: 22.99,
        rating: 4.8,
        genre: 'Wealth & Financial Success',
        stock: 400,
        pages: 242,
        publisher: 'Harriman House',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/psychology_money.png',
        description: 'Shares 19 short stories exploring the strange ways people think about money, demonstrating that doing well with money is about behavior, not intelligence.'
      },
      {
        _id: 32,
        title: 'Millionaire Fastlane',
        author: 'M. J. DeMarco',
        isbn: '9780984358106',
        price: 16.95,
        original_price: 24.95,
        rating: 4.7,
        genre: 'Wealth & Financial Success',
        stock: 120,
        pages: 334,
        publisher: 'Viperion Publishing',
        is_featured: false,
        is_deal: false,
        cover_image: '/covers/millionaire_fastlane.png',
        description: 'A complete, aggressive blueprint for financial independence, challenging standard retirement dogmas and pointing directly to entrepreneurship.'
      },
      {
        _id: 33,
        title: 'The Almanack of Naval Ravikant',
        author: 'Eric Jorgenson',
        isbn: '9781544514215',
        price: 14.00,
        original_price: 19.99,
        rating: 4.8,
        genre: 'Wealth & Financial Success',
        stock: 180,
        pages: 244,
        publisher: 'Magrathea Publishing',
        is_featured: true,
        is_deal: false,
        cover_image: '/covers/almanack_naval.png',
        description: 'A beautiful collection of Naval Ravikant\'s wisdom on building leverage, creating wealth, and cultivating long-term happiness.'
      }
    ];

    await Book.create(defaultBooks);
    log(`📚 Seeded ${defaultBooks.length} books successfully.`);

    // 4. Seed Standard Coupon (BVAULT20)
    log('🎟️ Seeding coupons...');
    await Coupon.deleteMany();

    const coupons = [
      {
        code: 'BVAULT20',
        discount_type: 'percent',
        discount_value: 20,
        max_uses: 1000,
        uses_count: 0,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      },
      {
        code: 'SAVE10',
        discount_type: 'fixed',
        discount_value: 10.0,
        max_uses: 500,
        uses_count: 0,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      }
    ];

    await Coupon.create(coupons);
    log(`🎟️ Seeded ${coupons.length} promotional coupons.`);

    // 5. Clean up existing Carts & Orders
    log('🧹 Clearing old carts and orders...');
    await Cart.deleteMany();
    await Order.deleteMany();

    log('✅ Database successfully seeded and initialized! 🎉');
    return { success: true, count: defaultBooks.length };
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    throw error;
  }
};

// Executed directly in CLI mode
if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookvault')
    .then(() => seedDatabase())
    .then(() => {
      console.log('🔌 Closing db connection...');
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ CLI Seeding Error:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
