const Author = require('../models/Author');

class AuthorController {
  /**
   * @route   GET /api/authors
   * @desc    Get all authors (with self-seeding fallback)
   * @access  Public
   */
  async index(req, res, next) {
    try {
      const count = await Author.countDocuments();

      // Self-seeding check: if empty, populate default starter authors
      if (count === 0) {
        const defaultAuthors = [
          { name: 'Erin Morgenstern', img: 'https://i.pravatar.cc/200?img=47', rating: 4.7 },
          { name: 'Paulo Coelho', img: 'https://i.pravatar.cc/200?img=12', rating: 4.8 },
          { name: 'John Green', img: 'https://i.pravatar.cc/200?img=15', rating: 4.6 },
          { name: 'Alex Michaelides', img: 'https://i.pravatar.cc/200?img=33', rating: 4.5 },
          { name: 'E. Lockhart', img: 'https://i.pravatar.cc/200?img=49', rating: 4.4 },
          { name: 'Timothy Snyder', img: 'https://i.pravatar.cc/200?img=5', rating: 4.7 },
        ];
        await Author.create(defaultAuthors);
        console.log('✍️ Seeded default authors dynamically inside AuthorController.');
      }

      const authors = await Author.find({}).sort({ createdAt: -1 });
      return res.json(authors);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/authors
   * @desc    Create a new author (Admin only)
   * @access  Private/Admin
   */
  async store(req, res, next) {
    try {
      const { name, img, rating } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Author name is required' });
      }

      const exists = await Author.findOne({ name });
      if (exists) {
        return res.status(400).json({ message: 'An author with this name already exists' });
      }

      const author = await Author.create({
        name,
        img: img || 'https://i.pravatar.cc/200?img=default',
        rating: rating !== undefined ? parseFloat(rating) : 4.5,
      });

      return res.status(201).json({
        message: 'Author added successfully! ✍️',
        author: author,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/authors/:id
   * @desc    Update an existing author profile (Admin only)
   * @access  Private/Admin
   */
  async update(req, res, next) {
    try {
      const { name, img, rating } = req.body;

      const author = await Author.findById(req.params.id);
      if (!author) {
        return res.status(404).json({ message: 'Author not found' });
      }

      // Check name uniqueness if changed
      if (name && name !== author.name) {
        const exists = await Author.findOne({ name });
        if (exists) {
          return res.status(400).json({ message: 'An author with this name already exists' });
        }
        author.name = name;
      }

      if (img !== undefined) author.img = img;
      if (rating !== undefined) author.rating = parseFloat(rating);

      await author.save();

      return res.json({
        message: 'Author updated successfully! ✏️',
        author: author,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/authors/:id
   * @desc    Delete an author profile (Admin only)
   * @access  Private/Admin
   */
  async destroy(req, res, next) {
    try {
      const author = await Author.findById(req.params.id);
      if (!author) {
        return res.status(404).json({ message: 'Author not found' });
      }

      await Author.findByIdAndDelete(req.params.id);

      return res.json({
        message: 'Author deleted successfully! 🗑️',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthorController();
