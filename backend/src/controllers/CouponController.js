const Coupon = require('../models/Coupon');

class CouponController {
  /**
   * @route   GET /api/coupons
   * @desc    Get all coupons (Admin only)
   * @access  Private/Admin
   */
  async index(req, res, next) {
    try {
      const coupons = await Coupon.find({});
      return res.json(coupons);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/coupons
   * @desc    Create a new coupon (Admin only)
   * @access  Private/Admin
   */
  async store(req, res, next) {
    try {
      const { code, discount_type, discount_value, expiry_date, max_uses } = req.body;

      if (!code || !discount_type || discount_value === undefined) {
        return res.status(400).json({ message: 'Code, discount type, and discount value are required' });
      }

      const formattedCode = code.toUpperCase().trim();
      const exists = await Coupon.findOne({ code: formattedCode });
      if (exists) {
        return res.status(400).json({ message: 'A coupon with this code already exists' });
      }

      const coupon = await Coupon.create({
        code: formattedCode,
        discount_type,
        discount_value: parseFloat(discount_value),
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        max_uses: max_uses ? parseInt(max_uses, 10) : null,
      });

      return res.status(201).json({
        message: 'Coupon created successfully! 🎉',
        coupon: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/coupons/:id
   * @desc    Update a coupon (Admin only)
   * @access  Private/Admin
   */
  async update(req, res, next) {
    try {
      const { code, discount_type, discount_value, expiry_date, max_uses } = req.body;

      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      // Check code uniqueness if changed
      if (code) {
        const formattedCode = code.toUpperCase().trim();
        if (formattedCode !== coupon.code) {
          const exists = await Coupon.findOne({ code: formattedCode });
          if (exists) {
            return res.status(400).json({ message: 'A coupon with this code already exists' });
          }
          coupon.code = formattedCode;
        }
      }

      if (discount_type) coupon.discount_type = discount_type;
      if (discount_value !== undefined) coupon.discount_value = parseFloat(discount_value);
      if (expiry_date !== undefined) coupon.expiry_date = expiry_date ? new Date(expiry_date) : null;
      if (max_uses !== undefined) coupon.max_uses = max_uses ? parseInt(max_uses, 10) : null;

      await coupon.save();

      return res.json({
        message: 'Coupon updated successfully! ✏️',
        coupon: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/coupons/:id
   * @desc    Delete a coupon (Admin only)
   * @access  Private/Admin
   */
  async destroy(req, res, next) {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      await Coupon.findByIdAndDelete(req.params.id);

      return res.json({
        message: 'Coupon deleted successfully! 🗑️',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/coupons/validate
   * @desc    Validate coupon code for discount application
   * @access  Private
   */
  async validateCoupon(req, res, next) {
    try {
      const { code } = req.body;

      if (!code || code.trim() === '') {
        return res.status(400).json({ message: 'Coupon code is required' });
      }

      const formattedCode = code.toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: formattedCode });

      if (!coupon) {
        return res.status(404).json({
          valid: false,
          message: 'Invalid coupon code. 😢',
        });
      }

      // Check expiration
      if (coupon.expiry_date) {
        const expiry = new Date(coupon.expiry_date);
        const today = new Date();
        
        // Strip hours to check dates correctly
        expiry.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        if (expiry < today) {
          return res.status(400).json({
            valid: false,
            message: 'This coupon has expired. ⏳',
          });
        }
      }

      // Check max uses
      if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
        return res.status(400).json({
          valid: false,
          message: 'This coupon usage limit has been reached. 🛑',
        });
      }

      return res.json({
        valid: true,
        message: 'Coupon applied successfully! 🎉',
        coupon: coupon,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CouponController();
